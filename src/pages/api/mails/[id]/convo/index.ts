import { NextApiRequest, NextApiResponse } from 'next';
import { getLogin } from '@/lib/login';
import { prisma } from '@/lib/prisma';
import { crackOpen } from '@/lib/utils';
import { hasPermissions } from '@/lib/authorization';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const user = await getLogin(req);
    if (user instanceof Error) {
      return res.status(412).json({
        message: `Precondition Failed - Must log in before continuing + ${user.message}`,
      });
    }

    const mail = await prisma.mail.findUnique({
      where: {
        id: crackOpen(req.query.id as string | string[]),
      },
      include: {
        folder: { select: { addressId: true } },
        convo: true,
      },
    });

    if (!mail) {
      return res.status(404).json({
        message: 'No such mail',
      });
    }

    if (!(await hasPermissions(['address', mail.folder.addressId], ['view', 'consult'], user.id))) {
      return res.status(401).json({
        message: 'Insufficient permissions - Must be able to view and consult address',
      });
    }

    return res.status(200).json(mail.convo);
  }
  return res.status(405).json({
    message: 'Method not allowed',
  });
}
