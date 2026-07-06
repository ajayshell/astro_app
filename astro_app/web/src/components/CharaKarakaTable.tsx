import type { ChartResult } from "../astro/types";
import { computeCharaKarakas } from "../astro/charaKaraka";
import { formatDegree } from "../astro/format";

export function CharaKarakaTable({ chart }: { chart: ChartResult }) {
  const rows = computeCharaKarakas(chart);

  return (
    <section className="charam-section">
      <h3>Charam (சரம்) — Chara Karakas</h3>
      <table className="charam-table">
        <thead>
          <tr>
            <th>Karaka</th>
            <th>Graha</th>
            <th>Degree in sign</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.karaka}>
              <td>{r.karaka}</td>
              <td>{r.planet}</td>
              <td>{formatDegree(r.degreeInSign)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="pending-note">
        7-karaka scheme (Sun-Saturn, no Rahu/Ketu) -- confirm this matches the intended tradition.
      </p>
    </section>
  );
}
