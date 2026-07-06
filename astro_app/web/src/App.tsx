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
import { formatDegree, RASI_ABBR } from "./astro/format";
import "./App.css";

type ChartStyle = "south" | "north";
type ViewMode = "overview" | "explore";

function App() {
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [chart, setChart] = useState<ChartResult | null>(null);
  const [chartStyle, setChartStyle] = useState<ChartStyle>("south");
  const [vargaKind, setVargaKind] = useState<VargaKind>("D1");
  const [view, setView] = useState<ViewMode>("overview");

  const transitChart = useMemo(() => {
    if (!birthInput) return null;
    return computeTransitChart(birthInput);
  }, [birthInput]);

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
      <header>
        <h1>{birthInput?.name ?? "Aj"}&rsquo;s Horoscope</h1>
        <p className="subtitle">South Indian Horoscope &mdash; for astrologer review</p>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <BirthForm onSubmit={handleBirthSubmit} />

          {chart && (
            <div className="controls">
              <label>
                Chart style
                <select value={chartStyle} onChange={(e) => setChartStyle(e.target.value as ChartStyle)}>
                  <option value="south">South Indian</option>
                  <option value="north">North Indian</option>
                </select>
              </label>

              <label>
                View
                <select value={view} onChange={(e) => setView(e.target.value as ViewMode)}>
                  <option value="overview">Overview (D1 + D9 + Transit)</option>
                  <option value="explore">Explore a single divisional chart</option>
                </select>
              </label>

              {view === "explore" && (
                <label>
                  Divisional chart
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
                Pending astrologer sign-off: {PENDING_VARGAS.join(", ")}
              </p>
            </div>
          )}

          {chart && (
            <div className="summary">
              <h3>Computed values</h3>
              <p>Ayanamsa (Lahiri, approx.): {formatDegree(chart.ayanamsa)}</p>
              <p>
                Ascendant: {RASI_ABBR[chart.ascendantRasi]} {formatDegree(chart.ascendantSiderealLongitude)}
              </p>
              <table className="planet-table">
                <thead>
                  <tr><th>Graha</th><th>Sign</th><th>Degree</th><th>Nakshatra</th><th>Pada</th></tr>
                </thead>
                <tbody>
                  {chart.planets.map((p) => (
                    <tr key={p.planet}>
                      <td>{p.planet}{p.isRetrograde && " (R)"}</td>
                      <td>{RASI_ABBR[p.rasi]}</td>
                      <td>{formatDegree(p.siderealLongitude)}</td>
                      <td>{p.nakshatra + 1}</td>
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
                  <ChartPanel title="Rasi (D1)" chart={chart} vargaKind="D1" chartStyle={chartStyle} />
                  <ChartPanel title="Navamsa (D9)" chart={chart} vargaKind="D9" chartStyle={chartStyle} />
                  {transitChart && (
                    <ChartPanel title="Transit (Gochara)" chart={transitChart} vargaKind="D1" chartStyle={chartStyle} />
                  )}
                </div>
              ) : (
                <ChartPanel title={vargaKind} chart={chart} vargaKind={vargaKind} chartStyle={chartStyle} />
              )}
              <p className="hint">Drag a planet chip into another house to test alternate placements.</p>

              <CharaKarakaTable chart={chart} />

              <section className="dasha-section">
                <h3>Vimshottari Dasha (Moon-nakshatra based)</h3>
                <DashaTable periods={dasha} />
              </section>
            </>
          ) : (
            <p className="placeholder">Enter birth details to generate a chart.</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
