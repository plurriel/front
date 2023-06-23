import { NextRequest, NextResponse } from 'next/server';

export default function handler(req: NextRequest) {
  switch (req.method) {
    case 'GET':
      return NextResponse.json({
        vapid: process.env.VAPID_PUBLIC,
      });
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
