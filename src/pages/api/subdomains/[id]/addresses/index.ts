import { object, string } from 'yup';
import { hasPermissions } from '@/lib/authorization';
import { prisma } from '@/lib/prisma';
import { getLogin } from '@/lib/login';
import { NextApiRequest, NextApiResponse } from 'next';

const schema = object({
  name: string()
    .lowercase()
    .min(1)
    .max(64)
    .matches(/^([0-9a-z!#$%&'*+\-/=?^_`{|}~]+\.)*[0-9a-z!#$%&'*+\-/=?^_`{|}~]+$/)
    .required(),
  subdomainId: string()
    .matches(/^c[0-9a-z]{24}$/)
    .required(),
}).required();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const user = await getLogin(req);
    if (user instanceof Error) {
      return res.status(412).json({
        message: `Precondition Failed - Must log in before continuing + ${user.message}`,
      });
    }

    try {
      schema.validate(req.body);
    } catch (err) {
      return res.status(400).json({
        message: err.message,
      });
    }

    const { subdomainId, name } = req.body;

    const subdomain = await prisma.subdomain.findUnique({
      where: {
        id: subdomainId,
      },
    });

    if (!subdomain) {
      return res.status(404).json({
        message: 'No such subdomain',
      });
    }

    if (!(await hasPermissions(['subdomain', subdomainId], ['createMail'], user.id))) {
      return res.status(401).json({
        message: 'You are not authorised to make this change on this subdomain',
      });
    }

    await prisma.address.create({
      data: {
        name: `${name}@${subdomain.name}`,
        catchAll: false,
        subdomainId,
        folders: {
          createMany: {
            data: (['Inbox', 'Sent', 'Drafts', 'Spam', 'Deleted'] as const)
              .map((type) => ({
                name: '',
                type,
              })),
          },
        },
      },
    });
    return res.status(201).json({
      message: 'Address created',
    });
  }
  return res.status(405).json({
    message: 'Method not allowed',
  });
}
