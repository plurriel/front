import { NextApiRequest, NextApiResponse } from 'next';
import {
  InferType,
  ValidationError,
  object,
  string,
} from 'yup';
import cuid2 from '@paralleldrive/cuid2';
import { prisma } from '@/lib/prisma';
import { getLogin } from '@/lib/login';
import { hasPermissions } from '@/lib/authorization';
import { crackOpen, emailAddrUtils } from '@/lib/utils';
import { channel } from '@/lib/amqplib';

export const replyReqSchema = object({
  contents: string().optional(),
}).required();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      const now = Date.now();
      const user = await getLogin(req);
      if (user instanceof Error) {
        return res.status(412).json({
          message: `Precondition Failed - Must log in before continuing + ${user.message}`,
        });
      }

      const mailDb = await prisma.mail.findUnique({
        where: {
          id: crackOpen(req.query.id as string | string[]),
        },
        include: {
          folder: {
            select: {
              address: {
                include: {
                  folders: {
                    where: {
                      type: 'Sent',
                      name: '',
                    },
                  },
                  subdomain: {
                    select: {
                      domain: true,
                    },
                  },
                },
              },
            },
          },
        },
      }); // pls kill me

      if (!mailDb) {
        return res.status(404).json({
          message: 'No such mail',
        });
      }

      if (!(await hasPermissions(['address', mailDb.folder.address.id], ['view', 'consult', 'send'], user.id))) {
        return res.status(401).json({
          message: 'Insufficient permissions - Must be able to view, send from and consult address',
        });
      }

      let body: InferType<typeof replyReqSchema>;
      try {
        body = await replyReqSchema.validate(req.body);
      } catch (err) {
        return res.status(400).json({
          message: (err as ValidationError).message,
        });
      }

      const {
        folder: { address },
        ...mail
      } = mailDb;

      if (!address.folders.length) {
        address.folders = [
          await prisma.folder.create({
            data: {
              type: 'Sent',
              name: '',
              addressId: address.id,
            },
          }),
        ];
      }
      const tos = new Set(
        [mail.from, ...mail.to]
          .filter((addressDest) => emailAddrUtils.extractAddress(addressDest) !== address.name),
      );
      const ccs = new Set(
        mail.cc
          .filter((addressDest) => emailAddrUtils.extractAddress(addressDest) !== address.name),
      );
      const mailId = `c${cuid2.createId()}`;
      const messageId = `<${mailId}@${address.name.split('@')[1]}>`;

      const mailInDb = await prisma.mail.create({
        data: {
          type: 'Outbound',
          id: mailId,
          from: address.name,
          to: [...tos],
          cc: [...ccs],
          bcc: [],
          at: new Date(now),
          recvDelay: 0,
          subject: `Re: ${mail.subject || ''}`,
          messageId,
          html: body.contents,
          inReplyTo: mail.id,
          unsuccessful: [...new Set([...tos, ...ccs].map((v) => emailAddrUtils.extractAddress(v)))],
          folderId: address.folders[0].id,
          convoId: mail.convoId,
        },
      });

      channel.sendToQueue('mail_submission', Buffer.from(crackOpen(mailId as string | string[]), 'ascii'));

      return res.status(200).json(mailInDb);
    default:
      return res.status(405).json({
        message: 'Method not allowed',
      });
  }
}
