import { NextRequest, NextResponse } from 'next/server';
import { getLogin } from '@/lib/login';
import { prisma } from '@/lib/prisma';
import { hasPermissions } from '@/lib/authorization';

export default async function handler(req: NextRequest) {
  return NextResponse.json({
    message: 'To come',
  }, { status: 501 });
  // switch (req.method) {
  //   case 'POST':
  //     const user = await getLogin(req);
  //     if (user instanceof Error) {
  //       return NextResponse.json({
  //         message: `Precondition Failed - Must log in before continuing + ${user.message}`,
  //       }, { status: 412 });
  //     }

  //     const address = await prisma.address.findUnique({
  //       where: {
  //         id: req.nextUrl.searchParams.get('id'),
  //       },
  //     });

  //     if (!address) {
  //       return NextResponse.json({
  //         message: 'No such address',
  //       }, { status: 404 });
  //     }

  //     if (!(await hasPermissions(['address', address.id], ['view', 'consult'], user.id))) {
  //       return NextResponse.json({
  //         message: 'Insufficient permissions - Must be able to view and consult address',
  //       }, { status: 401 });
  //     }
  //     return NextResponse.json(mail);
  //   default:
  //     return NextResponse.json({
  //       message: 'Method not allowed',
  //     }, { status: 405 });
  // }
}
