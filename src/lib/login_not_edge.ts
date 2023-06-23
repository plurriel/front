import nacl from 'tweetnacl';
import { getCookie } from 'cookies-next';
import { prisma } from '@/lib/prisma';
import { NextApiRequest } from 'next';

export async function getLogin(req: NextApiRequest) {
  const now = Date.now();
  // Check if signature is correct
  let sessionSign;
  let sessionData;
  try {
    sessionSign = Buffer.from(getCookie('session_sign', { req }) as string, 'base64');
  } catch (err) {
    return new Error('"session_sign" is not a valid signature');
  }
  try {
    sessionData = JSON.parse(getCookie('session_data', { req }) as string);
  } catch (err) {
    return new Error('"session_data" is not a valid JSON');
  }

  const { userId } = sessionData;
  if (!userId
    || typeof userId !== 'string'
    || !userId.match(/^c[a-z0-9]{24}$/)) return new Error('"session_data".userId is not a valid cuid');

  const date = sessionData.genTime;
  if (!date || typeof date !== 'number') return new Error('"session_data".genTime is not a valid timestamp');

  const isValid = nacl.sign.open(sessionSign, Buffer.from(process.env.AUTH_PUBLIC, 'base64'));
  console.log('getLogin', 0, Date.now() - now);
  if (!isValid) return new Error('The signature is invalid');

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  console.log('getLogin', 1, Date.now() - now);

  if (!user) return new Error('This user does not exist');

  if (date < user.lastPwChange.getTime()) return new Error('Password has been changed since login');

  return user;
}
