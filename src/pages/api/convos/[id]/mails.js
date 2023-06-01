import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const convo = await prisma.convo.findUnique({
      where: {
        id: req.query.id,
      },
      select: {
        mails: true,
      },
    });
    if (!convo) return res.status(404).send('No such convo');
    return res.status(200).json(convo.mails);
  }
  return res.status(405).send('Method not allowed');
}
