import { NextResponse } from 'next/server';
import { hasPermissions } from '@/lib/authorisation';
import { prisma } from '@/lib/prisma';
import { getLogin } from '@/lib/login';

export default async function handler(req) {
  if (req.method === 'GET') {
    const user = await getLogin(req);
    if (user instanceof Error) {
      console.log(user, req);
      return NextResponse.json({
        message: `Precondition Failed - Must log in before continuing + ${user.message}`,
      }, { status: 412 });
    }

    const folder = await prisma.folder.findUnique({
      where: {
        id: req.query.id,
      },
      select: {
        convos: true,
        addressId: true,
      },
    });

    if (!(await hasPermissions(['address', folder.addressId], { view: true, consult: true }, user.id))) {
      return NextResponse.json({
        message: 'Insufficient permissions - Must be able to view and consult folder',
      }, { status: 401 });
    }

    if (!folder) {
      return NextResponse.json({
        message: 'No such folder',
      }, { status: 404 });
    }
    return NextResponse.json(folder.convos);
  }
  return NextResponse.json({
    message: 'Method not allowed',
  }, { status: 405 });
}

export const config = {
  runtime: 'edge',
  regions: 'fra1',
};
