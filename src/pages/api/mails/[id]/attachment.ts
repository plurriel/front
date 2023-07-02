import { hasPermissions } from '@/lib/authorization';
import { getLogin } from '@/lib/login';
import { prisma } from '@/lib/prisma';
import { crackOpen } from '@/lib/utils';
import { NextApiRequest, NextApiResponse } from 'next';

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
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
          folder: { select: { address: { select: { id: true, name: true } } } },
        },
      });

      if (!mail) {
        return res.status(404).json({
          message: 'No such mail',
        });
      }

      if (!(await hasPermissions(['address', mail.folder.address.id], ['view', 'compose'], user.id))) {
        return res.status(401).json({
          message: 'Insufficient permissions - Must be able to view and compose mail',
        });
      }
    case 'PUT':

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}
