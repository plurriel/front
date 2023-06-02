import { object, string } from 'yup';
import { hasPermissions } from '@/lib/authorisation';
import { prisma } from '@/lib/prisma.js';
import { getLogin } from '@/pages/api/login';

const schema = object({
  name: string()
    .lowercase()
    .min(1)
    .max(64)
    .matches(/^([0-9a-z!#$%&'*+\-/=?^_`{|}~]+\.)*[0-9a-z!#$%&'*+\-/=?^_`{|}~]+$/),
  subdomainId: string()
    .matches(/^c[0-9a-z]{24}$/),
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const user = await getLogin({ req, res });
    if (!user) return res.status(412).send('Precondition Failed - Must log in before continuing');

    try {
      schema.validate(user);
    } catch (err) {
      return res.status(400).send(err.message);
    }

    const { subdomainId, name } = req.body;

    if (!hasPermissions(['subdomain', subdomainId], { createMail: true }, user.id)) {
      return res.status(401).send('You are not authorised to make this change on this subdomain');
    }

    await prisma.address.create({
      data: {
        name: `${name}@${await prisma.subdomain.findUnique({
          where: {
            id: subdomainId,
          },
        }).then((subdomain) => subdomain.name)}`,
        catchAll: false,
        subdomainId,
        folders: {
          createMany: {
            data: ['Inbox', 'Sent', 'Drafts', 'Spam', 'Deleted']
              .map((type) => ({
                name: '',
                type,
              })),
          },
        },
      },
    });
    return res.status(200).send('Address created');
  }
  return res.status(405).send('Method not allowed');
}

export const config = {
  runtime: 'edge',
};
