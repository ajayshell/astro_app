import { useState } from "react";
import type { DashaPeriod } from "../astro/dasha";

function fmt(d: Date): string {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function Row({ period, depth }: { period: DashaPeriod; depth: number }) {
  const [open, setOpen] = useState(false);
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
          {period.lord}
        </td>
        <td>{fmt(period.start)}</td>
        <td>{fmt(period.end)}</td>
      </tr>
      {open && period.antardashas.map((a) => <Row key={`${a.lord}-${a.start.getTime()}`} period={a} depth={depth + 1} />)}
    </>
  );
}

export function DashaTable({ periods }: { periods: DashaPeriod[] }) {
  return (
    <table className="dasha-table">
      <thead>
        <tr>
          <th>Lord (Mahadasha)</th>
          <th>Start</th>
          <th>End</th>
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
