import { hasPermissions } from '@/lib/authorisation';
import { prisma } from '@/lib/prisma';
import { getLogin } from '../../login';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const user = await getLogin({ req, res });
    if (user instanceof Error) return res.status(412).send(`Precondition Failed - Must log in before continuing + ${user.message}`);

    const folder = await prisma.folder.findUnique({
      where: {
        id: req.query.id,
      },
      select: {
        convos: true,
        addressId: true,
      },
    });

    if (!(await hasPermissions(['address', folder.addressId], { view: true, consult: true }, user.id))) return res.status(401).send('Insufficient permissions - Must be able to view anc consult folder');

    if (!folder) return res.status(404).send('No such folder');
    return res.status(200).json(folder.convos);
  }
  return res.status(405).send('Method not allowed');
}

export const config = {
  runtime: 'edge',
  regions: 'fra1',
};
