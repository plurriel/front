import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return res.status(200).json({
      hash: await bcrypt.hash(req.body.password, 15),
    });
  }
  return res.status(405).json({ message: 'Method not allowed' });
}
