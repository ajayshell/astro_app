import { useState } from "react";
import type { DashaPeriod } from "../astro/dasha";
import { useI18n } from "../i18n/LanguageContext";

function fmt(d: Date): string {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function Row({ period, depth }: { period: DashaPeriod; depth: number }) {
  const [open, setOpen] = useState(false);
  const { planetName } = useI18n();
  const hasChildren = period.antardashas.length > 0;

  return (
    <>
      <tr className={`dasha-row depth-${depth}`}>
        <td>
          {hasChildren && (
            <button type="button" className="dasha-toggle" onClick={() => setOpen(!open)}>
              {open ? "−" : "+"}
            </button>
          )}
          {planetName(period.lord)}
        </td>
        <td>{fmt(period.start)}</td>
        <td>{fmt(period.end)}</td>
      </tr>
      {open && period.antardashas.map((a) => <Row key={`${a.lord}-${a.start.getTime()}`} period={a} depth={depth + 1} />)}
    </>
  );
}

export function DashaTable({ periods }: { periods: DashaPeriod[] }) {
  const { t } = useI18n();
  return (
    <table className="dasha-table">
      <thead>
        <tr>
          <th>{t("lordMahadasha")}</th>
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
