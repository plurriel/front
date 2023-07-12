import { prisma } from '@/lib/prisma';
import { getLogin } from '@/lib/login';
import { hasPermissions } from '@/lib/authorization';
import { NextApiRequest, NextApiResponse } from 'next';
import { crackOpen } from '@/lib/utils';
import {
  InferType,
  ValidationError,
  array,
  object,
  string,
} from 'yup';

export const mailPatchSchema = object({
  to: array(string().required()),
  cc: array(string().required()),
  bcc: array(string().required()),
  subject: string().nullable(),
  html: string().nullable(),
}).required();

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
        folder: { select: { address: { select: { id: true, name: true } } } },
      },
    });

    if (!mail) {
      return res.status(404).json({
        message: 'No such mail',
      });
    }

    if (!(await hasPermissions(['address', mail.folder.address.id], ['view', 'consult'], user.id))) {
      return res.status(401).json({
        message: 'Insufficient permissions - Must be able to view and consult address',
      });
    }
    return res.status(200).json(mail);
  }
  if (req.method === 'PATCH') {
    const user = await getLogin(req);
    if (user instanceof Error) {
      return res.status(412).json({
        message: `Precondition Failed - Must log in before continuing + ${user.message}`,
      });
    }

    let body: InferType<typeof mailPatchSchema>;
    try {
      body = await mailPatchSchema.validate(req.body);
    } catch (err) {
      return res.status(400).json({ message: (err as ValidationError).message });
    }

    const mail = await prisma.mail.findUnique({
      where: {
        id: crackOpen(req.query.id as string | string[]),
      },
      include: {
        folder: { select: { address: true } },
        convo: { include: { mails: { take: 2 } } },
      },
    });

    if (!mail) {
      return res.status(404).json({
        message: 'No such mail',
      });
    }

    // if (!mail.folder.address.folders.length) {
    //   mail.folder.address.folders = [
    //     await prisma.folder.create({
    //       data: {
    //         type: 'Sent',
    //         name: '',
    //         addressId: mail.folder.address.id,
    //       },
    //     }),
    //   ];
    // }

    if (!(await hasPermissions(['address', mail.folder.address.id], ['view', 'consult'], user.id))) {
      return res.status(401).json({
        message: 'Insufficient permissions - Must be able to view and consult address',
      });
    }

    if (mail.type !== 'Draft') {
      return res.status(412).json({
        message: 'Precondition failed - Mail must be draft',
      });
    }

    const allInterlocutors = new Set([
      ...mail.convo.interlocutors,
      ...(body.to || []),
      ...(body.cc || []),
      ...(body.bcc || []),
    ]);

    // console.log(mail.convo.mails, mail.convo.mails.length === 1, body.subject);

    const newMail = await prisma.mail.update({
      where: {
        id: crackOpen(req.query.id as string | string[]),
      },
      data: {
        to: body.to || undefined,
        cc: body.cc || undefined,
        bcc: body.bcc || undefined,
        subject: body.subject || undefined,
        html: body.html || undefined,
        convo: {
          update: {
            subject: mail.convo.mails.length === 1 ? body.subject || undefined : undefined,
            interlocutors: [...allInterlocutors],
          },
        },
        folder: {
          connectOrCreate: {
            where: {
              name_type_addressId: {
                name: '',
                type: 'Sent',
                addressId: mail.folder.address.id,
              },
            },
            create: {
              name: '',
              type: 'Sent',
              addressId: mail.folder.address.id,
            },
          },
        },
      },
      include: {
        convo: true,
      },
    });

    return res.status(200).json(newMail);
  }
  return res.status(405).json({
    message: 'Method not allowed',
  });
}
