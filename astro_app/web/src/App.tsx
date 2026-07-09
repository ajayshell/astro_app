import { useMemo, useState } from "react";
import { BirthForm } from "./components/BirthForm";
import { ChartPanel } from "./components/ChartPanel";
import { DashaTable } from "./components/DashaTable";
import { CharaKarakaTable } from "./components/CharaKarakaTable";
import type { BirthInput, ChartResult } from "./astro/types";
import { computeChart, computeTransitChart } from "./astro/charts";
import { computeVimshottariDasha } from "./astro/dasha";
import type { DashaPeriod } from "./astro/dasha";
import { IMPLEMENTED_VARGAS, PENDING_VARGAS } from "./astro/varga";
import type { VargaKind } from "./astro/varga";
import { formatBirthSummary, formatDegree } from "./astro/format";
import { useI18n } from "./i18n/LanguageContext";
import type { Language } from "./i18n/translations";
import "./App.css";

type ChartStyle = "south" | "north";
type ViewMode = "overview" | "explore";

function App() {
  const { language, setLanguage, t, rasiLabel, rasiFullName, planetName, nakshatraName } = useI18n();
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [chart, setChart] = useState<ChartResult | null>(null);
  const [chartStyle, setChartStyle] = useState<ChartStyle>("south");
  const [vargaKind, setVargaKind] = useState<VargaKind>("D1");
  const [view, setView] = useState<ViewMode>("overview");

  const transitChart = useMemo(() => {
    if (!birthInput) return null;
    return computeTransitChart(birthInput);
  }, [birthInput]);

  const centerInfo = useMemo(() => (birthInput ? formatBirthSummary(birthInput) : undefined), [birthInput]);

  const dasha: DashaPeriod[] = useMemo(() => {
    if (!chart) return [];
    const moon = chart.planets.find((p) => p.planet === "Moon");
    if (!moon) return [];
    return computeVimshottariDasha(moon.siderealLongitude, chart.birthUtc);
  }, [chart]);

  function handleBirthSubmit(input: BirthInput) {
    setVargaKind("D1");
    setBirthInput(input);
    setChart(computeChart(input));
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        <label className="language-toggle">
          {t("language")}
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
          </select>
        </label>
      </div>

      <header>
        <h1>{birthInput?.name ?? "Aj"}{t("horoscopeTitleSuffix")}</h1>
        <p className="subtitle">{t("subtitle")}</p>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <BirthForm onSubmit={handleBirthSubmit} />

          {chart && (
            <div className="controls">
              <label>
                {t("chartStyle")}
                <select value={chartStyle} onChange={(e) => setChartStyle(e.target.value as ChartStyle)}>
                  <option value="south">{t("southIndian")}</option>
                  <option value="north">{t("northIndian")}</option>
                </select>
              </label>

              <label>
                {t("view")}
                <select value={view} onChange={(e) => setView(e.target.value as ViewMode)}>
                  <option value="overview">{t("overviewOption")}</option>
                  <option value="explore">{t("exploreOption")}</option>
                </select>
              </label>

              {view === "explore" && (
                <label>
                  {t("divisionalChart")}
                  <select value={vargaKind} onChange={(e) => setVargaKind(e.target.value as VargaKind)}>
                    {IMPLEMENTED_VARGAS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                        {k === "D1" && " (Rasi)"}
                        {k === "D9" && " (Navamsa)"}
                        {k === "D10" && " (Dashamsa)"}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <p className="pending-note">
                {t("pendingSignOff")}: {PENDING_VARGAS.join(", ")}
              </p>
            </div>
          )}

          {chart && (
            <div className="summary">
              <h3>{t("computedValues")}</h3>
              <p>{t("ayanamsa")}: {formatDegree(chart.ayanamsa)}</p>
              <p>
                {t("ascendant")}: {rasiFullName(chart.ascendantRasi)} {formatDegree(chart.ascendantSiderealLongitude)}
              </p>
              <table className="planet-table">
                <thead>
                  <tr>
                    <th>{t("graha")}</th>
                    <th>{t("sign")}</th>
                    <th>{t("degree")}</th>
                    <th>{t("nakshatra")}</th>
                    <th>{t("pada")}</th>
                  </tr>
                </thead>
                <tbody>
                  {chart.planets.map((p) => (
                    <tr key={p.planet}>
                      <td>{planetName(p.planet)}{p.isRetrograde && " (R)"}</td>
                      <td>{rasiLabel(p.rasi)}</td>
                      <td>{formatDegree(p.siderealLongitude)}</td>
                      <td>{nakshatraName(p.nakshatra)}</td>
                      <td>{p.nakshatraPada}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </aside>

        <main className="chart-area">
          {chart ? (
            <>
              {view === "overview" ? (
                <div className="chart-panel-grid">
                  <ChartPanel
                    title={t("rasiD1")}
                    chart={chart}
                    vargaKind="D1"
                    chartStyle={chartStyle}
                    centerInfo={centerInfo}
                  />
                  <ChartPanel
                    title={t("navamsaD9")}
                    chart={chart}
                    vargaKind="D9"
                    chartStyle={chartStyle}
                    centerInfo={centerInfo}
                  />
                  {transitChart && (
                    <ChartPanel
                      title={t("transit")}
                      chart={transitChart}
                      vargaKind="D1"
                      chartStyle={chartStyle}
                      centerInfo={centerInfo}
                    />
                  )}
                </div>
              ) : (
                <ChartPanel
                  title={vargaKind}
                  chart={chart}
                  vargaKind={vargaKind}
                  chartStyle={chartStyle}
                  centerInfo={centerInfo}
                />
              )}
              <p className="hint">{t("dragHint")}</p>

              <CharaKarakaTable chart={chart} />

              <section className="dasha-section">
                <h3>{t("dashaTitle")}</h3>
                <DashaTable periods={dasha} />
              </section>
            </>
          ) : (
            <p className="placeholder">{t("enterBirthDetails")}</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
