import { getLogin } from '@/lib/login';
import { prisma } from '@/lib/prisma';
import { hasPermissions } from '@/lib/authorization';
import { NextApiRequest, NextApiResponse } from 'next';
import { crackOpen } from '@/lib/utils';
import {
  InferType,
  ValidationError,
  array,
  mixed,
  object,
  string,
} from 'yup';
import { sendMail } from '@/lib/sendmail';

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
          subdomain: { select: { domain: true } },
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

      const mailData = await sendMail({
        from: {
          name: address.name,
          sentFolder: address.folders[0],
          domain: address.subdomain.domain,
        },
        to: body.to,
        cc: body.cc,
        bcc: body.bcc,
        subject: body.subject || '',
        contents: body.contents || '',
      });
      return res.status(200).json(mailData);
    default:
      return res.status(405).json({
        message: 'Method not allowed',
      });
  }
}
