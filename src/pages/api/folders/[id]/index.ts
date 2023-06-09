import { prisma } from '@/lib/prisma';
import { getLogin } from '@/lib/login';
import { hasPermissions } from '@/lib/authorization';
import { crackOpen } from '@/lib/utils';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const user = await getLogin(req);
    if (user instanceof Error) {
      return res.status(412).json({
        message: `Precondition Failed - Must log in before continuing + ${user.message}`,
      });
    }

    const folder = await prisma.folder.findUnique({
      where: {
        id: crackOpen(req.query.id as string | string[]),
      },
    });

    if (!folder) {
      return res.status(404).json({
        message: 'No such folder',
      });
    }

    if (!(await hasPermissions(['address', folder.addressId], ['view', 'consult'], user.id))) {
      return res.status(401).json({
        message: 'Insufficient permissions - Must be able to view and consult address',
      });
    }

    return res.status(200).json(folder);
  }
  return res.status(405).json({
    message: 'Method not allowed',
  });
}
