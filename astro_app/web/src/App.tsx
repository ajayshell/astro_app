import { useEffect, useMemo, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { BirthForm } from "./components/BirthForm";
import { SouthIndianChart } from "./components/SouthIndianChart";
import { NorthIndianChart } from "./components/NorthIndianChart";
import { DashaTable } from "./components/DashaTable";
import type { BirthInput, ChartResult } from "./astro/types";
import { computeChart } from "./astro/charts";
import { computeVimshottariDasha } from "./astro/dasha";
import type { DashaPeriod } from "./astro/dasha";
import { computeVarga, IMPLEMENTED_VARGAS, PENDING_VARGAS } from "./astro/varga";
import type { VargaKind } from "./astro/varga";
import type { PlanetName } from "./astro/constants";
import { formatDegree, RASI_ABBR } from "./astro/format";
import "./App.css";

type PlanetSlot = { planet: PlanetName; isRetrograde: boolean };
type ChartStyle = "south" | "north";

function App() {
  const [chart, setChart] = useState<ChartResult | null>(null);
  const [chartStyle, setChartStyle] = useState<ChartStyle>("south");
  const [vargaKind, setVargaKind] = useState<VargaKind>("D1");
  const [placement, setPlacement] = useState<Record<number, PlanetSlot[]>>({});

  useEffect(() => {
    if (!chart) return;
    const next: Record<number, PlanetSlot[]> = {};
    for (const p of chart.planets) {
      const rasi = vargaKind === "D1" ? p.rasi : p.vargas[vargaKind];
      next[rasi] = next[rasi] ?? [];
      next[rasi].push({ planet: p.planet, isRetrograde: p.isRetrograde });
    }
    setPlacement(next);
  }, [chart, vargaKind]);

  const ascendantRasiForVarga = useMemo(() => {
    if (!chart) return 0;
    return vargaKind === "D1" ? chart.ascendantRasi : computeVarga(vargaKind, chart.ascendantSiderealLongitude);
  }, [chart, vargaKind]);

  const dasha: DashaPeriod[] = useMemo(() => {
    if (!chart) return [];
    const moon = chart.planets.find((p) => p.planet === "Moon");
    if (!moon) return [];
    return computeVimshottariDasha(moon.siderealLongitude, chart.birthUtc);
  }, [chart]);

  function handleBirthSubmit(input: BirthInput) {
    setVargaKind("D1");
    setChart(computeChart(input));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const planet = active.id as PlanetName;
    const targetRasi = Number(String(over.id).replace("rasi-", ""));

    setPlacement((prev) => {
      let movedEntry: PlanetSlot | undefined;
      const cleared: Record<number, PlanetSlot[]> = {};
      for (const [rasiKey, slots] of Object.entries(prev)) {
        const rasi = Number(rasiKey);
        cleared[rasi] = slots.filter((s) => {
          if (s.planet === planet) {
            movedEntry = s;
            return false;
          }
          return true;
        });
      }
      if (!movedEntry) return prev;
      cleared[targetRasi] = [...(cleared[targetRasi] ?? []), movedEntry];
      return cleared;
    });
  }

  const ChartComponent = chartStyle === "south" ? SouthIndianChart : NorthIndianChart;

  return (
    <div className="app-shell">
      <header>
        <h1>South Indian Horoscope</h1>
        <p className="subtitle">Vedic birth-chart prototype &mdash; for astrologer review</p>
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
              <DndContext onDragEnd={handleDragEnd}>
                <ChartComponent ascendantRasi={ascendantRasiForVarga} placement={placement} />
              </DndContext>
              <p className="hint">Drag a planet chip into another house to test alternate placements.</p>

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
