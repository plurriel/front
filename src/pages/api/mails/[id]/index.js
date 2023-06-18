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

    const mail = await prisma.mail.findUnique({
      where: {
        id: req.nextUrl.searchParams.get('id'),
      },
      include: {
        convo: {
          select: {
            folder: {
              select: {
                address: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!mail) {
      return NextResponse.json({
        message: 'No such mail',
      }, { status: 404 });
    }

    if (!(await hasPermissions(['address', mail.convo.folder.address.id], ['view', 'consult'], user.id))) {
      return NextResponse.json({
        message: 'Insufficient permissions - Must be able to view and consult address',
      }, { status: 401 });
    }
    return NextResponse.json(mail);
  }
  return NextResponse.json({
    message: 'Method not allowed',
  }, { status: 405 });
}

export const config = {
  runtime: 'edge',
  regions: 'fra1',
};
