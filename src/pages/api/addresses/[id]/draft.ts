import { getLogin } from '@/lib/login';
import { prisma } from '@/lib/prisma';
import { hasPermissions } from '@/lib/authorization';
import { crackOpen } from '@/lib/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  InferType,
  ValidationError,
  array,
  object,
  string,
} from 'yup';
import cuid2 from '@paralleldrive/cuid2';

export const draftReqSchema = object({
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

      const address = await prisma.address.findUnique({
        where: {
          id: crackOpen(req.query.id as string | string[]),
        },
        include: {
          folders: {
            where: {
              type: 'Drafts',
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

      if (!(await hasPermissions(['address', address.id], ['view', 'consult'], user.id))) {
        return res.status(401).json({
          message: 'Insufficient permissions - Must be able to view and consult address',
        });
      }

      let body: InferType<typeof draftReqSchema>;
      try {
        body = await draftReqSchema.validate(req.body);
      } catch (err) {
        return res.status(400).json({
          message: (err as ValidationError).message,
        });
      }

      if (!address.folders.length) {
        address.folders = [
          await prisma.folder.create({
            data: {
              type: 'Drafts',
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
        const inReplyTo = await prisma.mail.findUnique({
          where: {
            id: body.inReplyTo,
          },
        });
        if (!inReplyTo) return res.status(404).json({ message: 'In Reply To mail could not be found' });
        convoId = inReplyTo.convoId;
        await prisma.convo.update({
          where: {
            id: convoId,
          },
          data: {
            latest: new Date(now),
          },
        });
      } else {
        const convo = await prisma.convo.create({
          data: {
            // folderId: address.folders[0].id,
            latest: new Date(now),
          },
        });
        convoId = convo.id;
      }

      const mail = await prisma.mail.create({
        data: {
          id: mailId,
          messageId,
          type: 'Draft',
          from: address.name,
          to: body.to,
          cc: body.cc,
          bcc: body.bcc,
          at: new Date(now),
          recvDelay: 0,
          convoId,
          folderId: address.folders[0].id,
        },
      });

      return res.status(200).json(mail);
    default:
      return res.status(405).json({
        message: 'Method not allowed',
      });
  }
}
