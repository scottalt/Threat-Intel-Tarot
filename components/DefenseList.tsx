import type { Defense } from "@/data/types";

export function DefenseList({ defenses }: { defenses: Defense[] }) {
  return (
    <ul className="space-y-2">
      {defenses.map((d, i) => (
        <li key={i} className="flex items-start gap-2">
          <span style={{ color: "var(--color-gold)", marginTop: "2px" }} className="shrink-0 text-sm">
            ▸
          </span>
          <div>
            <div className="text-sm" style={{ color: "var(--color-mist)" }}>
              {d.control}
            </div>
            {d.framework && (
              <div className="text-xs mt-0.5" style={{ color: "var(--color-silver)", opacity: 0.6 }}>
                {d.framework}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
