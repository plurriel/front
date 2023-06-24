import { NextApiRequest, NextApiResponse } from 'next';
import {
  InferType,
  ValidationError,
  object,
  string,
} from 'yup';
import { prisma } from '@/lib/prisma';
import { getLogin } from '@/lib/login';
import { hasPermissions } from '@/lib/authorization';
import { crackOpen, emailAddrUtils } from '@/lib/utils';
import { sendMail } from '@/lib/sendmail';

export const replyReqSchema = object({
  contents: string().optional(),
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

      let body: InferType<typeof replyReqSchema>;
      try {
        body = await replyReqSchema.validate(req.body);
      } catch (err) {
        return res.status(400).json({
          message: (err as ValidationError).message,
        });
      }

      const mailDb = await prisma.mail.findUnique({
        where: {
          id: crackOpen(req.query.id as string | string[]),
        },
        include: {
          convo: {
            select: {
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
          },
        },
      }); // pls kill me

      if (!mailDb) {
        return res.status(404).json({
          message: 'No such mail',
        });
      }

      if (!(await hasPermissions(['address', mailDb.convo.folder.address.id], ['view', 'consult', 'send'], user.id))) {
        return res.status(401).json({
          message: 'Insufficient permissions - Must be able to view, send from and consult address',
        });
      }

      const {
        convo: { folder: { address } },
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

      const mailData = await sendMail({
        from: {
          name: address.name,
          sentFolder: address.folders[0],
          domain: address.subdomain.domain,
        },
        to: [...tos],
        cc: [...ccs],
        bcc: [],
        subject: `Re: ${mail.subject}`,
        contents: body.contents || '',
        inReplyTo: mail,
      });
      return res.status(200).json(mailData);
    default:
      return res.status(405).json({
        message: 'Method not allowed',
      });
  }
}
