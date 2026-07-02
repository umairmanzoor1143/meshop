// Deterministic pastel tiles for products/categories without a resolved image,
// matching the letter-tile look of the prototype.

const PALETTE = [
  "#efe6cf",
  "#e7d9c6",
  "#dfe4dc",
  "#e9d6d2",
  "#efe2d4",
  "#dde1e6",
  "#eef0e2",
  "#f2e6c9",
  "#efdcd4",
  "#e6e0d2",
];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function tileColor(seed: string): string {
  return PALETTE[hash(seed) % PALETTE.length];
}

export function tileMark(label: string): string {
  const trimmed = label.trim();
  return trimmed ? trimmed[0]!.toUpperCase() : "•";
}
