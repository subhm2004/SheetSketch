export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

export function laserGlowColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'rgba(255, 60, 60, 0.9)';
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.92)`;
}
