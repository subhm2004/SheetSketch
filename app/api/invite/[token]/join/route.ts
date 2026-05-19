import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token: inviteToken } = await params;
  const { password } = await req.json();

  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  const { Redis } = await import('@upstash/redis');
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const raw = await redis.get(`invite:${inviteToken}`);
  if (!raw) {
    return NextResponse.json({ error: 'Invite link expired or invalid' }, { status: 404 });
  }

  const invite = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const { roomId } = invite as { roomId: string };

  const roomRaw = await redis.get(`room:${roomId}`);
  if (!roomRaw) {
    return NextResponse.json({ error: 'Room no longer exists' }, { status: 404 });
  }

  const room =
    typeof roomRaw === 'string'
      ? JSON.parse(roomRaw)
      : (roomRaw as { hashedPassword: string });

  const valid = await bcrypt.compare(password, room.hashedPassword);
  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const accessToken = jwt.sign(
    { roomId, type: 'room_access' },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  return NextResponse.json({ token: accessToken, roomId });
}
