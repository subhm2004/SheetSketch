import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const { Redis } = await import('@upstash/redis');
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const raw = await redis.get(`invite:${token}`);
  if (!raw) {
    return NextResponse.json({ error: 'Invite link expired or invalid' }, { status: 404 });
  }

  const invite = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return NextResponse.json({ roomId: invite.roomId as string });
}
