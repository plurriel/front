import {
  number,
  object,
  string,
  InferType,
} from 'yup';
import { prisma } from '@/lib/prisma';
import { getLogin } from '@/lib/login';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'PUT':
      const user = await getLogin(req);
      if (user instanceof Error) {
        return res.status(412).json({
          message: 'Precondition failed - Must be logged in',
        });
      }

      const subscriptionData = req.body;

      const subscriptionSchema = object({
        endpoint: string().required(),
        expirationTime: number().nullable(),
        keys: object({
          p256dh: string().required(),
          auth: string().required(),
        }).required(),
      }).required();

      try {
        subscriptionSchema.validate(subscriptionData);
      } catch (err) {
        return res.status(400).json({
          message: err.message,
        });
      }

      let newSubscriptionArray = user.webPushSubData as InferType<typeof subscriptionSchema>[];

      if (!Array.isArray(newSubscriptionArray)) newSubscriptionArray = [];

      const seenEndpoints = new Set([subscriptionData.endpoint]);
      newSubscriptionArray = newSubscriptionArray.filter((v) => (seenEndpoints.has(v.endpoint)
        ? false
        : (seenEndpoints.add(v.endpoint), true)));

      newSubscriptionArray.push(subscriptionData);

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          webPushSubData: JSON.stringify(newSubscriptionArray),
        },
      });
      return res.status(201).json({
        message: 'Subscription data successfully added!',
      });
    default:
      return res.status(405).json({
        message: 'Method not allowed',
      });
  }
}
