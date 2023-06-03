export default function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return res.status(200).send(process.env.VAPID_PUBLIC);
    default:
      return res.status(405).send('Method not allowed');
  }
}

export const config = {
  runtime: 'edge',
  regions: 'fra1',
};
