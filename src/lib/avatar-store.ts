// Color palette for member avatars. Safe to import in server and client components.

export const AVATAR_PALETTE = [
  { label: "Emerald", hex: "#6ee7b7", textHex: "#065f46" },
  { label: "Sky",     hex: "#7dd3fc", textHex: "#0c4a6e" },
  { label: "Violet",  hex: "#c4b5fd", textHex: "#4c1d95" },
  { label: "Amber",   hex: "#fcd34d", textHex: "#78350f" },
  { label: "Rose",    hex: "#fda4af", textHex: "#9f1239" },
  { label: "Teal",    hex: "#5eead4", textHex: "#134e4a" },
  { label: "Orange",  hex: "#fdba74", textHex: "#7c2d12" },
  { label: "Indigo",  hex: "#a5b4fc", textHex: "#312e81" },
];

export function getAvatarColor(colorIndex: number | null | undefined, fallbackIndex: number) {
  const idx = colorIndex ?? fallbackIndex;
  return AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
}
