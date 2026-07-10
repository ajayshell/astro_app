import { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SouthIndianChart } from "./SouthIndianChart";
import { NorthIndianChart } from "./NorthIndianChart";
import { buildPlacementMap } from "../astro/charts";
import { computeVarga } from "../astro/varga";
import type { VargaKind } from "../astro/varga";
import type { PlanetName } from "../astro/constants";
import type { CenterInfo } from "../astro/format";
import type { ChartResult, PlanetSlot } from "../astro/types";

type ChartStyle = "south" | "north";

interface Props {
  title: string;
  chart: ChartResult;
  vargaKind: VargaKind;
  chartStyle: ChartStyle;
  centerInfo?: CenterInfo;
  showHouseNumber?: boolean;
}

/** A single interactive chart (D1/D9/transit/etc.), with its own drag-and-drop state. */
export function ChartPanel({ title, chart, vargaKind, chartStyle, centerInfo, showHouseNumber }: Props) {
  const [placement, setPlacement] = useState<Record<number, PlanetSlot[]>>({});

  useEffect(() => {
    setPlacement(buildPlacementMap(chart, vargaKind));
  }, [chart, vargaKind]);

  const ascendantRasi =
    vargaKind === "D1" ? chart.ascendantRasi : computeVarga(vargaKind, chart.ascendantSiderealLongitude);

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

  return (
    <div className="chart-panel">
      <h4>{title}</h4>
      <DndContext onDragEnd={handleDragEnd}>
        {chartStyle === "south" ? (
          <SouthIndianChart
            ascendantRasi={ascendantRasi}
            placement={placement}
            centerInfo={centerInfo}
            showHouseNumber={showHouseNumber}
          />
        ) : (
          <NorthIndianChart ascendantRasi={ascendantRasi} placement={placement} showHouseNumber={showHouseNumber} />
        )}
      </DndContext>
    </div>
  );
}
