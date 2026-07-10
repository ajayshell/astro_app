import type { PlanetName } from "../astro/constants";
import type { CenterInfo } from "../astro/format";
import { houseOfRasi } from "../astro/charts";
import { SOUTH_INDIAN_GRID_POSITIONS } from "../astro/southIndianGrid";
import { RasiCell } from "./RasiCell";

interface Props {
  ascendantRasi: number;
  placement: Record<number, { planet: PlanetName; isRetrograde: boolean }[]>;
  centerInfo?: CenterInfo;
  showHouseNumber?: boolean;
  draggable?: boolean;
}

export function SouthIndianChart({ ascendantRasi, placement, centerInfo, showHouseNumber, draggable }: Props) {
  return (
    <div className="south-indian-grid">
      {centerInfo && (
        <div className="south-indian-center" style={{ gridRow: "2 / span 2", gridColumn: "2 / span 2" }}>
          <span>{centerInfo.date}</span>
          <span>{centerInfo.time}</span>
          <span>{centerInfo.place}</span>
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
