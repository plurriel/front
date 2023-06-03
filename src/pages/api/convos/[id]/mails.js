import { prisma } from '@/lib/prisma_edge';
import { getLogin } from '@/lib/login';
import { hasPermissions } from '@/lib/authorisation';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const user = await getLogin({ req, res });
    if (user instanceof Error) return res.status(412).send(`Precondition Failed - Must log in before continuing + ${user.message}`);

    const convo = await prisma.convo.findUnique({
      where: {
        id: req.query.id,
      },
      select: {
        mails: true,
        folder: { select: { addressId: true } },
      },
    });

    if (!(await hasPermissions(['address', convo.folder.addressId], { view: true, consult: true }, user.id))) return res.status(401).send('Insufficient permissions - Must be able to view anc consult mailbox');

    if (!convo) return res.status(404).send('No such convo');
    return res.status(200).json(convo.mails);
  }
  return res.status(405).send('Method not allowed');
}

export const config = {
  runtime: 'edge',
  regions: 'fra1',
};
