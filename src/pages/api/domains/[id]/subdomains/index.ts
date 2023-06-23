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
  domainId: string()
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

    const { domainId, name } = req.body;

    const domain = await prisma.domain.findUnique({
      where: {
        id: domainId,
      },
    });

    if (!domain) {
      return res.status(404).json({
        message: 'No such domain',
      });
    }

    if (!(await hasPermissions(['domain', domainId], ['createSub'], user.id))) {
      return res.status(401).json({
        message: 'You are not authorised to make this change on this domain',
      });
    }

    await prisma.subdomain.create({
      data: {
        name: `${name}.${domain.name}`,
        domainId,
      },
    });
    return res.status(201).json({
      message: 'Subdomain created',
    });
  }
  return res.status(405).json({
    message: 'Method not allowed',
  });
}
