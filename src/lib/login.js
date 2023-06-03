import { isCuid } from '@paralleldrive/cuid2';
import { getCookie } from 'cookies-next';
import nacl from 'tweetnacl';
import { prisma } from './prisma';

export async function getLogin({ req, res }) {
  // Check if signature is correct
  let sessionSign;
  let sessionData;
  try {
    sessionSign = Buffer.from(getCookie('session_sign', { req, res }), 'base64');
  } catch (err) {
    return new Error('"session_sign" is not a valid signature');
  }
  try {
    sessionData = JSON.parse(getCookie('session_data', { req, res }));
  } catch (err) {
    return new Error('"session_data" is not a valid JSON');
  }

  const { userId } = sessionData;
  if (!userId
    || typeof userId !== 'string'
    || !isCuid(userId)) return new Error('"session_data".userId is not a valid cuid');

  const date = sessionData.genTime;
  if (!date || typeof date !== 'number') return new Error('"session_data".genTime is not a valid timestamp');

  const isValid = nacl.sign.open(sessionSign, Buffer.from(process.env.AUTH_PUBLIC, 'base64'));
  if (!isValid) return new Error('The signature is invalid');

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) return new Error('This user does not exist');

  if (date < user.lastPwChange.getTime()) return new Error('Password has been changed since login');

  return user;
}
