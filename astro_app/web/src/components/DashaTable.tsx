import { useState } from "react";
import type { DashaPeriod } from "../astro/dasha";
import { useI18n } from "../i18n/LanguageContext";

function fmt(d: Date): string {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const LEVEL_KEYS = ["dashaLevel", "bhuktiLevel", "antharamLevel"] as const;

function Row({ period, depth }: { period: DashaPeriod; depth: number }) {
  const [open, setOpen] = useState(false);
  const { t, planetName } = useI18n();
  const hasChildren = period.subPeriods.length > 0;
  const levelKey = LEVEL_KEYS[Math.min(depth, LEVEL_KEYS.length - 1)];

  return (
    <>
      <tr className={`dasha-row depth-${depth}`}>
        <td>
          {hasChildren && (
            <button type="button" className="dasha-toggle" onClick={() => setOpen(!open)}>
              {open ? "−" : "+"}
            </button>
          )}
          <span className="dasha-level-tag">{t(levelKey)}</span>
          {planetName(period.lord)}
        </td>
        <td>{fmt(period.start)}</td>
        <td>{fmt(period.end)}</td>
      </tr>
      {open &&
        period.subPeriods.map((s) => (
          <Row key={`${s.lord}-${s.start.getTime()}`} period={s} depth={depth + 1} />
        ))}
    </>
  );
}

export function DashaTable({ periods }: { periods: DashaPeriod[] }) {
  const { t } = useI18n();
  return (
    <table className="dasha-table">
      <thead>
        <tr>
          <th>{t("dashaLordHeader")}</th>
          <th>{t("start")}</th>
          <th>{t("end")}</th>
        </tr>
      </thead>
      <tbody>
        {periods.map((p) => (
          <Row key={`${p.lord}-${p.start.getTime()}`} period={p} depth={0} />
        ))}
      </tbody>
    </table>
  );
}
