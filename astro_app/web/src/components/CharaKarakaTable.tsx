import type { ChartResult } from "../astro/types";
import { computeCharaKarakas } from "../astro/charaKaraka";
import { formatDegree } from "../astro/format";
import { useI18n } from "../i18n/LanguageContext";

export function CharaKarakaTable({ chart }: { chart: ChartResult }) {
  const rows = computeCharaKarakas(chart);
  const { t, planetName, karakaName } = useI18n();

  return (
    <section className="charam-section">
      <h3>{t("charamTitle")}</h3>
      <table className="charam-table">
        <thead>
          <tr>
            <th>{t("karaka")}</th>
            <th>{t("graha")}</th>
            <th>{t("degreeInSign")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.karaka}>
              <td>{karakaName(r.karakaIndex)}</td>
              <td>{planetName(r.planet)}</td>
              <td>{formatDegree(r.degreeInSign)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="pending-note">{t("charamNote")}</p>
    </section>
  );
}
