import type { PlanetName } from "../astro/constants";
import { RasiCell } from "./RasiCell";

interface Props {
  ascendantRasi: number;
  placement: Record<number, { planet: PlanetName; isRetrograde: boolean }[]>;
}

// House layout goes clockwise from the top (house 1), matching the common
// North Indian convention -- sanity-checked with an Aries ascendant (where
// natural sign order Aries..Pisces should read clockwise starting top).
// Still worth a final visual confirmation from the astrologer; flipping the
// direction is a one-line change to HOUSE_ANCHORS order if it's ever wrong.
const HOUSE_ANCHORS: { house: number; x: number; y: number }[] = [
  { house: 1, x: 200, y: 60 },
  { house: 2, x: 300, y: 40 },
  { house: 3, x: 350, y: 130 },
  { house: 4, x: 340, y: 200 },
  { house: 5, x: 350, y: 270 },
  { house: 6, x: 300, y: 360 },
  { house: 7, x: 200, y: 340 },
  { house: 8, x: 100, y: 360 },
  { house: 9, x: 50, y: 270 },
  { house: 10, x: 60, y: 200 },
  { house: 11, x: 50, y: 130 },
  { house: 12, x: 100, y: 40 },
];

export function NorthIndianChart({ ascendantRasi, placement }: Props) {
  return (
    <div className="north-indian-wrap">
      <svg viewBox="0 0 400 400" className="north-indian-svg">
        <rect x={0} y={0} width={400} height={400} fill="none" stroke="currentColor" strokeWidth={2} />
        <line x1={0} y1={0} x2={400} y2={400} stroke="currentColor" strokeWidth={1.5} />
        <line x1={400} y1={0} x2={0} y2={400} stroke="currentColor" strokeWidth={1.5} />
        <polygon points="200,0 400,200 200,400 0,200" fill="none" stroke="currentColor" strokeWidth={1.5} />
      </svg>
      <div className="north-indian-overlay">
        {HOUSE_ANCHORS.map(({ house, x, y }) => {
          const rasi = (ascendantRasi + house - 1) % 12;
          return (
            <RasiCell
              key={house}
              rasiIndex={rasi}
              isAscendant={house === 1}
              planets={placement[rasi] ?? []}
              className="rasi-cell-diamond"
              style={{ left: `${(x / 400) * 100}%`, top: `${(y / 400) * 100}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
