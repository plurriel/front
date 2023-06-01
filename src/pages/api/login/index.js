/* eslint-disable import/no-extraneous-dependencies */
import bcrypt from 'bcrypt';
import { getCookie, setCookie } from 'cookies-next';
import { isCuid } from '@paralleldrive/cuid2';
import nacl from 'tweetnacl';
import { hexToArray, arrayToUtf8, utf8ToArray } from 'enc-utils';
import * as ecies from 'ecies-25519';
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      if (!req.body.username
        || typeof req.body.username !== 'string'
        || !req.body.username.length) return res.status(400).send('"username" should be a non-empty string');
      if (!req.body.password
        || typeof req.body.password !== 'string'
        || !req.body.password.length) return res.status(400).send('"password" should be a non-empty string');

      const user = await prisma.user.findUnique({
        where: {
          username: req.body.username,
        },
      });

      if (!user) return res.status(400).send('User or password incorrect');

      // Try to decrypt
      let actualPassword;
      let timeOfEncryption;
      try {
        const passwordData = JSON.parse(arrayToUtf8(await ecies.decrypt(
          Buffer.from(hexToArray(req.body.password)),
          Buffer.from(process.env.USERS_TO_US_PRIVATE, 'base64'),
        )));
        actualPassword = passwordData.password;
        timeOfEncryption = passwordData.time;
      } catch (err) {
        return res.status(406).send('Unable to decrypt password');
      }

      if (!(await bcrypt.compare(actualPassword, user.passwordHash))) return res.status(400).send('User or password incorrect');

      if (Date.now() - timeOfEncryption > 5 * 1000) return res.status(410).send('Too late (Login attempts are coupled with timestamps to prevent relay attacks)');

      // Create HMAC token
      const sessionData = JSON.stringify({
        genTime: Date.now(),
        userId: user.id,
      });
      const sessionSign = nacl.sign(utf8ToArray(sessionData), Buffer.from(process.env.AUTH_PRIVATE, 'base64'));
      setCookie('session_data', sessionData, { req, res });
      setCookie('session_sign', Buffer.from(sessionSign).toString('base64'), { req, res });
      return res.status(200).send('Check cookies');
    default:
      return res.status(405).send('Method not allowed');
  }
}

export async function getLogin({ req, res }) {
  // Check if signature is correct
  let sessionSign;
  let sessionData;
  try {
    sessionSign = Buffer.from(getCookie('session_sign', { req, res }), 'base64');
  } catch (err) {
    return false;
  }
  try {
    sessionData = JSON.parse(getCookie('session_data', { req, res }));
  } catch (err) {
    return false;
  }

  const { userId } = sessionData;
  if (!userId
    || typeof userId !== 'string'
    || !isCuid(userId)) return false;

  const date = sessionData.genTime;
  if (!date || typeof date !== 'number') return false;

  const isValid = nacl.sign.open(sessionSign, Buffer.from(process.env.AUTH_PUBLIC, 'base64'));
  if (!isValid) return false;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) return false;

  if (date < user.lastPwChange.getTime()) return false;

  return user;
}
