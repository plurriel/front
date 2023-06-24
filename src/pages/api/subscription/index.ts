import {
  number,
  object,
  string,
  InferType,
  ValidationError,
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

      const subscriptionSchema = object({
        endpoint: string().required(),
        expirationTime: number().nullable(),
        keys: object({
          p256dh: string().required(),
          auth: string().required(),
        }).required(),
      }).required();

      let subscriptionData: InferType<typeof subscriptionSchema>;
      try {
        subscriptionData = await subscriptionSchema.validate(req.body, { strict: true });
      } catch (err: unknown) {
        return res.status(400).json({
          message: (err as ValidationError)?.message,
        });
      }

      let newSubscriptionArray = user
        .webPushSubData
        .map((v) => JSON.parse(v)) as InferType<typeof subscriptionSchema>[];

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
