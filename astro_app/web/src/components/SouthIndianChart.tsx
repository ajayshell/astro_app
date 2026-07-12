import type { PlanetSlot } from "../astro/types";
import type { CenterInfo } from "../astro/format";
import { houseOfRasi } from "../astro/charts";
import { SOUTH_INDIAN_GRID_POSITIONS } from "../astro/southIndianGrid";
import { RasiCell } from "./RasiCell";
import { useI18n } from "../i18n/LanguageContext";

interface Props {
  ascendantRasi: number;
  placement: Record<number, PlanetSlot[]>;
  centerInfo?: CenterInfo;
  showHouseNumber?: boolean;
  draggable?: boolean;
}

export function SouthIndianChart({ ascendantRasi, placement, centerInfo, showHouseNumber, draggable }: Props) {
  const { weekdayName } = useI18n();
  const dayPlace = centerInfo
    ? [centerInfo.dayIndex !== null ? weekdayName(centerInfo.dayIndex) : null, centerInfo.place].filter(Boolean).join(", ")
    : "";

  return (
    <div className="south-indian-grid">
      {centerInfo && (
        <div className="south-indian-center" style={{ gridRow: "2 / span 2", gridColumn: "2 / span 2" }}>
          <span>{centerInfo.date}</span>
          <span>{centerInfo.time}</span>
          <span>{dayPlace}</span>
        </div>
      )}
      {SOUTH_INDIAN_GRID_POSITIONS.map(({ rasi, row, col }) => (
        <RasiCell
          key={rasi}
          rasiIndex={rasi}
          houseNumber={houseOfRasi(rasi, ascendantRasi)}
          showHouseNumber={showHouseNumber}
          isAscendant={rasi === ascendantRasi}
          planets={placement[rasi] ?? []}
          style={{ gridRow: row, gridColumn: col }}
          draggable={draggable}
        />
      ))}
    </div>
  );
}
