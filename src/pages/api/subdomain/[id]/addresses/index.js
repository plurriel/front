import { NextResponse } from 'next/server';
import { object, string } from 'yup';
import { hasPermissions } from '@/lib/authorisation';
import { prisma } from '@/lib/prisma';
import { getLogin } from '@/lib/login';

const schema = object({
  name: string()
    .lowercase()
    .min(1)
    .max(64)
    .matches(/^([0-9a-z!#$%&'*+\-/=?^_`{|}~]+\.)*[0-9a-z!#$%&'*+\-/=?^_`{|}~]+$/),
  subdomainId: string()
    .matches(/^c[0-9a-z]{24}$/),
});

export default async function handler(req) {
  if (req.method === 'POST') {
    const user = await getLogin(req);
    if (user instanceof Error) {
      return NextResponse.json({
        message: `Precondition Failed - Must log in before continuing + ${user.message}`,
      }, { status: 412 });
    }

    try {
      schema.validate(user);
    } catch (err) {
      return NextResponse.json({
        message: err.message,
      }, { status: 400 });
    }

    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({
        message: 'Request body should be in json',
      }, { status: 400 });
    }

    const { subdomainId, name } = body;

    if (!hasPermissions(['subdomain', subdomainId], { createMail: true }, user.id)) {
      return NextResponse.json({
        message: 'You are not authorised to make this change on this subdomain',
      }, { status: 401 });
    }

    await prisma.address.create({
      data: {
        name: `${name}@${await prisma.subdomain.findUnique({
          where: {
            id: subdomainId,
          },
        }).then((subdomain) => subdomain.name)}`,
        catchAll: false,
        subdomainId,
        folders: {
          createMany: {
            data: ['Inbox', 'Sent', 'Drafts', 'Spam', 'Deleted']
              .map((type) => ({
                name: '',
                type,
              })),
          },
        },
      },
    });
    return NextResponse.json({
      message: 'Address created',
    }, { status: 201 });
  }
  return NextResponse.json({
    message: 'Method not allowed',
  }, { status: 405 });
}

export const config = {
  runtime: 'edge',
  regions: 'fra1',
};
