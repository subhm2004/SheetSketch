import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { verifyRoomToken } from '@/lib/room-auth';

const INVITE_TTL_SEC = 7 * 24 * 60 * 60; // 7 days

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const auth = verifyRoomToken(req.headers.get('authorization'), roomId);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { Redis } = await import('@upstash/redis');
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const room = await redis.get(`room:${roomId}`);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  const token = randomBytes(18).toString('base64url');
  await redis.set(
    `invite:${token}`,
    JSON.stringify({ roomId, createdAt: Date.now() }),
    { ex: INVITE_TTL_SEC }
  );

  const origin = req.nextUrl.origin;
  const inviteUrl = `${origin}/invite/${token}`;

  return NextResponse.json({ inviteUrl, token });
}
