import jwt from 'jsonwebtoken';

export type RoomTokenPayload = { roomId: string; type: string };

export function verifyRoomToken(
  authHeader: string | null,
  roomId: string
): RoomTokenPayload | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as RoomTokenPayload;
    if (payload.type !== 'room_access' || payload.roomId !== roomId) return null;
    return payload;
  } catch {
    return null;
  }
}
