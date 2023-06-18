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

    const folder = await prisma.folder.findUnique({
      where: {
        id: req.nextUrl.searchParams.get('id'),
      },
    });

    if (!folder) {
      return NextResponse.json({
        message: 'No such folder',
      }, { status: 404 });
    }

    if (!(await hasPermissions(['address', folder.addressId], ['view', 'consult'], user.id))) {
      return NextResponse.json({
        message: 'Insufficient permissions - Must be able to view and consult address',
      }, { status: 401 });
    }

    return NextResponse.json(folder);
  }
  return NextResponse.json({
    message: 'Method not allowed',
  }, { status: 405 });
}

export const config = {
  runtime: 'edge',
  regions: 'fra1',
};
