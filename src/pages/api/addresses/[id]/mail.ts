import { NextApiRequest, NextApiResponse } from 'next';
import {
  InferType,
  ValidationError,
  array,
  mixed,
  object,
  string,
} from 'yup';
import { getLogin } from '@/lib/login';
import { prisma } from '@/lib/prisma';
import { hasPermissions } from '@/lib/authorization';
import { crackOpen, emailAddrUtils } from '@/lib/utils';
import cuid2 from '@paralleldrive/cuid2';
import { channel } from '@/lib/amqplib';

export const mailReqSchema = object({
  to: array(string().required()).required(),
  cc: array(string().required()).required(),
  bcc: array(string().required()).required(),
  subject: string().optional(),
  contents: string().optional(),
  inReplyTo: string(),
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

      let body: InferType<typeof mailReqSchema>;
      try {
        body = await mailReqSchema.validate(req.body);
      } catch (err) {
        return res.status(400).json({
          message: (err as ValidationError).message,
        });
      }

      const address = await prisma.address.findUnique({
        where: {
          id: crackOpen(req.query.id as string | string[]),
        },
        include: {
          folders: {
            where: {
              type: 'Sent',
              name: '',
            },
          },
        },
      });

      if (!address) {
        return res.status(404).json({
          message: 'No such address',
        });
      }

      if (!(await hasPermissions(['address', address.id], ['view', 'send'], user.id))) {
        return res.status(401).json({
          message: 'Insufficient permissions - Must be able to view and send from address',
        });
      }

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

      const mailId = `c${cuid2.createId()}`;
      const messageId = `<${mailId}@${address.name.split('@')[1]}`;

      let convoId;
      if (body.inReplyTo) {
        const inReplyToMail = await prisma.mail.findFirst({
          where: {
            id: body.inReplyTo,
          },
        });
        if (!inReplyToMail) return res.status(404).json({ message: 'In Reply To mail could not be found' });
        convoId = inReplyToMail.convoId;
        await prisma.convo.update({
          where: {
            id: convoId,
          },
          data: {
            latest: new Date(now),
          },
        });
      } else {
        const interlocutors = new Set(
          [...body.to, ...body.cc, ...body.bcc]
            .filter((addressDest) => emailAddrUtils.extractAddress(addressDest) !== address.name),
        );
        convoId = (await prisma.convo.create({
          data: {
            subject: body.subject,
            interlocutors: [...interlocutors],
            folderId: address.folders[0].id,
            latest: new Date(now),
          },
        })).id;
      }

      const mailInDb = await prisma.mail.create({
        data: {
          type: 'Outbound',
          id: mailId,
          from: address.name,
          to: body.to,
          cc: body.cc,
          bcc: body.bcc,
          at: new Date(now),
          recvDelay: 0,
          subject: body.subject,
          messageId,
          html: body.contents,
          inReplyTo: body.inReplyTo,
          unsuccessful: [...body.to, ...body.cc, ...body.bcc],
          convoId,
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
