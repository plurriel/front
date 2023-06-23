import nacl from 'tweetnacl';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

function toArrayBuffer(buffer: Buffer): Uint8Array {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; i += 1) {
    view[i] = buffer[i];
  }
  return view;
}

export async function getLogin(req: NextRequest) {
  const now = Date.now();
  // Check if signature is correct
  let sessionSign;
  let sessionData;
  try {
    // eslint-disable-next-line dot-notation
    sessionSign = Buffer.from(req.cookies.get('session_sign')?.value, 'base64');
  } catch (err) {
    return new Error('"session_sign" is not a valid signature');
  }
  try {
    // eslint-disable-next-line dot-notation
    sessionData = JSON.parse(req.cookies.get('session_data')?.value);
  } catch (err) {
    return new Error('"session_data" is not a valid JSON');
  }

  const { userId } = sessionData;
  if (!userId
    || typeof userId !== 'string'
    || !userId.match(/^c[a-z0-9]{24}$/)) return new Error('"session_data".userId is not a valid cuid');

  const date = sessionData.genTime;
  if (!date || typeof date !== 'number') return new Error('"session_data".genTime is not a valid timestamp');

  const isValid = nacl.sign.open(toArrayBuffer(sessionSign), toArrayBuffer(Buffer.from(process.env.AUTH_PUBLIC, 'base64')));
  console.log('getLogin', Date.now() - now);
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
