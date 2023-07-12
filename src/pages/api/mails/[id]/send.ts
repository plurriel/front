import { prisma } from '@/lib/prisma';
import { getLogin } from '@/lib/login';
import { hasPermissions } from '@/lib/authorization';
import { NextApiRequest, NextApiResponse } from 'next';
import { crackOpen } from '@/lib/utils';
// import {
//   InferType,
//   ValidationError,
//   array,
//   object,
//   string,
// } from 'yup';
import { channel } from '@/lib/amqplib';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
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

    if (!(await hasPermissions(['address', mail.folder.address.id], ['view', 'send'], user.id))) {
      return res.status(401).json({
        message: 'Insufficient permissions - Must be able to view and send from address',
      });
    }

    if (!['Draft', 'Inbound'].includes(mail.type)) {
      return res.status(412).json({
        message: 'Precondition failed - Mail must be draft or outbound',
      });
    }

    if (mail.type === 'Draft') {
      await prisma.mail.update({
        where: {
          id: crackOpen(req.query.id as string | string[]),
        },
        data: {
          type: 'Outbound',
        },
      });
    }

    channel.sendToQueue('mail_submission', Buffer.from(crackOpen(req.query.id as string | string[]), 'ascii'));

    return res.status(200).json(mail);
  }
  return res.status(405).json({
    message: 'Method not allowed',
  });
}
