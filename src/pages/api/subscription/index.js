import { number, object, string } from 'yup';
import { prisma } from '@/lib/prisma';
import { getLogin } from '@/lib/login';

export default async function handler(req, res) {
  switch (req.method) {
    case 'PUT':
      const user = await getLogin({ req, res });
      if (user instanceof Error) return res.status(412).send('Precondition failed - Must be logged in');

      let newSubscriptionArray = JSON.parse(user.webPushSubData);

      if (!Array.isArray(newSubscriptionArray)) newSubscriptionArray = [];

      const subscriptionData = req.body;

      try {
        const subscriptionSchema = object({
          endpoint: string().required(),
          expirationTime: number().nullable(),
          keys: object({
            p256dh: string().required(),
            auth: string().required(),
          }).required(),
        });
        subscriptionSchema.validate(subscriptionData);
      } catch (err) {
        return res.status(400).send(err.message);
      }

      newSubscriptionArray.push(subscriptionData);

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          webPushSubData: JSON.stringify(newSubscriptionArray),
        },
      });
      return res.status(200).send('Subscription data successfully added!');
    default:
      return res.status(405).send('Method not allowed');
  }
}
