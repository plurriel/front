import { NextResponse } from 'next/server';
import { object, string } from 'yup';
import { hasPermissions } from '@/lib/authorization';
import { prisma } from '@/lib/prisma';
import { getLogin } from '@/lib/login';

const schema = object({
  name: string()
    .lowercase()
    .min(1)
    .max(64)
    .matches(/^([0-9a-z!#$%&'*+\-/=?^_`{|}~]+\.)*[0-9a-z!#$%&'*+\-/=?^_`{|}~]+$/)
    .required(),
  domainId: string()
    .matches(/^c[0-9a-z]{24}$/)
    .required(),
}).required();

export default async function handler(req) {
  if (req.method === 'POST') {
    const user = await getLogin(req);
    if (user instanceof Error) {
      return NextResponse.json({
        message: `Precondition Failed - Must log in before continuing + ${user.message}`,
      }, { status: 412 });
    }

    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({
        message: 'Request body should be in json',
      }, { status: 400 });
    }

    try {
      schema.validate(body);
    } catch (err) {
      return NextResponse.json({
        message: err.message,
      }, { status: 400 });
    }

    const { domainId, name } = body;

    const domain = await prisma.domain.findUnique({
      where: {
        id: domainId,
      },
    });

    if (!domain) {
      return NextResponse.json({
        message: 'No such domain',
      }, { status: 404 });
    }

    if (!(await hasPermissions(['domain', domainId], ['createSub'], user.id))) {
      return NextResponse.json({
        message: 'You are not authorised to make this change on this domain',
      }, { status: 401 });
    }

    await prisma.subdomain.create({
      data: {
        name: `${name}.${domain.name}`,
        domainId,
      },
    });
    return NextResponse.json({
      message: 'Subdomain created',
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
