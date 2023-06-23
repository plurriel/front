import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return res.status(200).json({
        vapid: process.env.VAPID_PUBLIC,
      });
    default:
      return res.status(405).json({
        message: 'Method not allowed',
      });
  }
}
