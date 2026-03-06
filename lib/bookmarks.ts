const KEY = "ti-tarot-bookmarks";

export function getBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function toggleBookmark(slug: string): boolean {
  const current = getBookmarks();
  const isBookmarked = current.includes(slug);
  const updated = isBookmarked
    ? current.filter((s) => s !== slug)
    : [...current, slug];
  localStorage.setItem(KEY, JSON.stringify(updated));
  return !isBookmarked;
}

export function isBookmarked(slug: string): boolean {
  return getBookmarks().includes(slug);
}
