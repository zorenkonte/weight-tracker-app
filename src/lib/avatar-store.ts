// Client-only — never import in server components

const STORAGE_KEY = "wt_avatar_colors";

export const AVATAR_PALETTE = [
  { label: "Emerald", bg: "bg-emerald-100", text: "text-emerald-700", hex: "#6ee7b7" },
  { label: "Sky",     bg: "bg-sky-100",     text: "text-sky-700",     hex: "#7dd3fc" },
  { label: "Violet",  bg: "bg-violet-100",  text: "text-violet-700",  hex: "#c4b5fd" },
  { label: "Amber",   bg: "bg-amber-100",   text: "text-amber-700",   hex: "#fcd34d" },
  { label: "Rose",    bg: "bg-rose-100",    text: "text-rose-500",    hex: "#fda4af" },
  { label: "Teal",    bg: "bg-teal-100",    text: "text-teal-700",    hex: "#5eead4" },
  { label: "Orange",  bg: "bg-orange-100",  text: "text-orange-700",  hex: "#fdba74" },
  { label: "Indigo",  bg: "bg-indigo-100",  text: "text-indigo-700",  hex: "#a5b4fc" },
];

export function getDefaultColor(index: number) {
  return AVATAR_PALETTE[index % AVATAR_PALETTE.length];
}

export function getSavedColorIndex(name: string): number | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const map = JSON.parse(stored) as Record<string, number>;
    return map[name] ?? null;
  } catch { return null; }
}

export function getAvatarColor(name: string, index: number) {
  const saved = getSavedColorIndex(name);
  return AVATAR_PALETTE[saved ?? (index % AVATAR_PALETTE.length)];
}

export function saveColorIndex(name: string, colorIndex: number): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const map = stored ? (JSON.parse(stored) as Record<string, number>) : {};
    map[name] = colorIndex;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function renameColorKey(oldName: string, newName: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const map = JSON.parse(stored) as Record<string, number>;
    if (oldName in map) {
      map[newName] = map[oldName];
      delete map[oldName];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    }
  } catch {}
}
