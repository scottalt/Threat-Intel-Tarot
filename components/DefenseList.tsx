"use client";

import type { Defense } from "@/data/types";

function frameworkUrl(fw: string): string | null {
  if (fw.startsWith("NIST CSF")) return "https://www.nist.gov/cyberframework";
  if (fw.startsWith("NIST SSDF")) return "https://csrc.nist.gov/Projects/ssdf";
  if (fw.startsWith("NIST SP")) return "https://csrc.nist.gov/publications/sp";
  if (fw.startsWith("CIS Control")) return "https://www.cisecurity.org/controls/cis-controls-list/";
  if (fw.startsWith("ICS-CERT")) return "https://www.cisa.gov/resources-tools/resources/ics-cert";
  return null;
}

export function DefenseList({ defenses }: { defenses: Defense[] }) {
  return (
    <ul className="space-y-2">
      {defenses.map((d, i) => (
        <li key={i} className="flex items-start gap-2"
          style={{ animation: `defense-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) ${i * 55}ms both` }}>
          <span style={{ color: "var(--color-gold)", marginTop: "2px" }} className="shrink-0 text-sm">
            ▸
          </span>
          <div>
            <div className="text-sm" style={{ color: "var(--color-mist)" }}>
              {d.control}
            </div>
            {d.framework && (() => {
              const url = frameworkUrl(d.framework);
              return url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs mt-0.5 inline-block transition-opacity hover:opacity-100"
                  style={{
                    color: "var(--color-gold)",
                    opacity: 0.45,
                    textDecoration: "none",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {d.framework} ↗
                </a>
              ) : (
                <div className="text-xs mt-0.5" style={{ color: "var(--color-silver)", opacity: 0.6 }}>
                  {d.framework}
                </div>
              );
            })()}
          </div>
        </li>
      ))}
    </ul>
  );
}
