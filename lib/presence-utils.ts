/** One entry per Liveblocks user id (ignores extra tabs/connections). */
export function uniqueByUserId<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of items) {
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return [...map.values()];
}

export function participantName(u: {
  presence: { name?: string };
  info: { name?: string };
}): string {
  return u.presence.name?.trim() || u.info?.name?.trim() || 'Guest';
}

export function participantColor(u: {
  presence: { color?: string };
  info: { color?: string };
}): string {
  return u.presence.color || u.info?.color || '#6965db';
}
