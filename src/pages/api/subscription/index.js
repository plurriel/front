import { number, object, string } from 'yup';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLogin } from '@/lib/login';

export default async function handler(req) {
  switch (req.method) {
    case 'PUT':
      const user = await getLogin(req);
      if (user instanceof Error) {
        return NextResponse.json({
          message: 'Precondition failed - Must be logged in',
        }, { status: 412 });
      }

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
        return NextResponse.json({
          message: err.message,
        }, { status: 400 });
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
      return NextResponse.json({
        message: 'Subscription data successfully added!',
      }, { status: 201 });
    default:
      return NextResponse.json({
        message: 'Method not allowed',
      }, { status: 405 });
  }
}

export const config = {
  runtime: 'edge',
  regions: 'fra1',
};
