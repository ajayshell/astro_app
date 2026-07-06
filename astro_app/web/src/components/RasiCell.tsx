import { useDroppable } from "@dnd-kit/core";
import type { PlanetName } from "../astro/constants";
import { PlanetChip } from "./PlanetChip";

interface Props {
  rasiIndex: number;
  signLabel: string;
  houseNumber: number | null;
  isAscendant: boolean;
  planets: { planet: PlanetName; isRetrograde: boolean }[];
  className?: string;
  style?: React.CSSProperties;
}

export function RasiCell({ rasiIndex, signLabel, houseNumber, isAscendant, planets, className, style }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `rasi-${rasiIndex}` });

  return (
    <div
      ref={setNodeRef}
      className={`rasi-cell ${isOver ? "rasi-cell-over" : ""} ${className ?? ""}`}
      style={style}
    >
      <div className="rasi-cell-header">
        <span className="rasi-sign-label">{signLabel}</span>
        {houseNumber !== null && <span className="rasi-house-number">H{houseNumber}</span>}
        {isAscendant && <span className="rasi-asc-marker">Asc</span>}
      </div>
      <div className="rasi-cell-planets">
        {planets.map((p) => (
          <PlanetChip key={p.planet} planet={p.planet} isRetrograde={p.isRetrograde} />
        ))}
      </div>
    </div>
  );
}
