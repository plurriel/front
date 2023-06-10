import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLogin } from '@/lib/login';
import { hasPermissions } from '@/lib/authorization';

export default async function handler(req) {
  if (req.method === 'GET') {
    const user = await getLogin(req);
    if (user instanceof Error) {
      return NextResponse.json({
        message: `Precondition Failed - Must log in before continuing + ${user.message}`,
      }, { status: 412 });
    }

    const convo = await prisma.convo.findUnique({
      where: {
        id: req.nextUrl.searchParams.get('id'),
      },
      select: {
        mails: true,
        folder: { select: { addressId: true } },
      },
    });

    if (!(await hasPermissions(['address', convo.folder.addressId], ['view', 'consult'], user.id))) {
      return NextResponse.json({
        message: 'Insufficient permissions - Must be able to view and consult mailbox',
      }, { status: 401 });
    }

    if (!convo) {
      return NextResponse.json({
        message: 'No such convo',
      }, { status: 404 });
    }
    return NextResponse.json(convo.mails);
  }
  return NextResponse.json({
    message: 'Method not allowed',
  }, { status: 405 });
}

export const config = {
  runtime: 'edge',
  regions: 'fra1',
};
