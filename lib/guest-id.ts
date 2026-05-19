/** Stable per-browser ID so chat/cursors stay "you" after refresh. */
export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('guest_id');
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? `guest_${crypto.randomUUID()}`
        : `guest_${Math.random().toString(36).slice(2, 14)}`;
    sessionStorage.setItem('guest_id', id);
  }
  return id;
}
