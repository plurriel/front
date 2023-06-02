import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const folder = await prisma.folder.findUnique({
      where: {
        id: req.query.id,
      },
      select: {
        convos: true,
      },
    });
    if (!folder) return res.status(404).send('No such folder');
    return res.status(200).json(folder.convos);
  }
  return res.status(405).send('Method not allowed');
}

export const config = {
  runtime: 'edge',
};
