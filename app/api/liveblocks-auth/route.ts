import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const { Liveblocks } = await import('@liveblocks/node');
  const liveblocks = new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY! });

  const { room, token, userId, userName, userColor } = await req.json();

  if (!token || !room) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: { roomId: string; type: string };
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as { roomId: string; type: string };
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  if (payload.type !== 'room_access' || payload.roomId !== room) {
    return NextResponse.json({ error: 'Unauthorized for this room' }, { status: 403 });
  }

  const stableUserId =
    typeof userId === 'string' && /^guest_[a-zA-Z0-9_-]{8,64}$/.test(userId)
      ? userId
      : `guest_${Math.random().toString(36).slice(2, 14)}`;

  const session = liveblocks.prepareSession(stableUserId, {
    userInfo: {
      name: typeof userName === 'string' && userName.trim() ? userName.trim() : 'Anonymous',
      color: typeof userColor === 'string' && userColor.trim() ? userColor : '#6965db',
    },
  });

  session.allow(room, ['room:write', 'room:presence:write', 'comments:write']);

  const { body, status } = await session.authorize();
  return new NextResponse(body, { status });
}
