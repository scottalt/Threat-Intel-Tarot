import type { TTP } from "@/data/types";

export function TTPBadge({ ttp, index = 0 }: { ttp: TTP; index?: number }) {
  return (
    <div
      className="flex items-start gap-2 py-1"
      style={{
        animation: "badge-slide 0.35s ease-out both",
        animationDelay: `${index * 45}ms`,
      }}
    >
      <span
        className="shrink-0 text-xs font-mono px-1.5 py-0.5 rounded mt-0.5"
        style={{
          background: "rgba(201,168,76,0.15)",
          color: "var(--color-gold-bright)",
          border: "1px solid rgba(201,168,76,0.3)",
        }}
      >
        {ttp.techniqueId}
      </span>
      <div className="min-w-0">
        <div className="text-sm" style={{ color: "var(--color-mist)" }}>
          {ttp.name}
        </div>
        <div
          className="text-xs"
          style={{ color: "var(--color-silver)", opacity: 0.7 }}
        >
          {ttp.tactic}
        </div>
      </div>
    </div>
  );
}
