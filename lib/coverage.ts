const KEY = "ti-tarot-coverage";

export function getCoverage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return new Set(raw as string[]);
  } catch {
    return new Set();
  }
}

export function toggleCoverage(control: string): Set<string> {
  const current = getCoverage();
  if (current.has(control)) {
    current.delete(control);
  } else {
    current.add(control);
  }
  localStorage.setItem(KEY, JSON.stringify([...current]));
  return current;
}
