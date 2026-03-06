"use client";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/daily", label: "Daily" },
  { href: "/spread", label: "Spread" },
  { href: "/techniques", label: "Techniques" },
  { href: "/defenses", label: "Defenses" },
  { href: "/sectors", label: "Sectors" },
  { href: "/map", label: "Map" },
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About" },
];

export function SiteNav({ current, className }: { current?: string; className?: string }) {
  const links = NAV_LINKS.filter((l) => l.href !== current);

  return (
    <nav
      className={`flex flex-wrap gap-y-2 mb-8 ${className ?? ""}`}
      style={{ gap: "0 4px" }}
      aria-label="Site navigation"
    >
      {links.map((link, i) => (
        <span key={link.href} className="flex items-center gap-1">
          {i > 0 && (
            <span aria-hidden="true" style={{ color: "var(--color-gold)", opacity: 0.25, padding: "0 2px" }}>
              ·
            </span>
          )}
          <a
            href={link.href}
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.5,
              fontFamily: "var(--font-cinzel), serif",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {link.href === "/" ? `← ${link.label}` : link.label}
          </a>
        </span>
      ))}
    </nav>
  );
}
