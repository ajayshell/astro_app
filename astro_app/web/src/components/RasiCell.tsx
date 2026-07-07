import { useDroppable } from "@dnd-kit/core";
import type { PlanetName } from "../astro/constants";
import { PlanetChip } from "./PlanetChip";
import { useI18n } from "../i18n/LanguageContext";

interface Props {
  rasiIndex: number;
  houseNumber: number | null;
  isAscendant: boolean;
  planets: { planet: PlanetName; isRetrograde: boolean }[];
  className?: string;
  style?: React.CSSProperties;
}

export function RasiCell({ rasiIndex, houseNumber, isAscendant, planets, className, style }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `rasi-${rasiIndex}` });
  const { rasiLabel, ascendantMarker } = useI18n();

  return (
    <div
      ref={setNodeRef}
      className={`rasi-cell ${isOver ? "rasi-cell-over" : ""} ${className ?? ""}`}
      style={style}
    >
      <div className="rasi-cell-header">
        <span className="rasi-sign-label">{rasiLabel(rasiIndex)}</span>
        {houseNumber !== null && <span className="rasi-house-number">H{houseNumber}</span>}
        {isAscendant && <span className="rasi-asc-marker">{ascendantMarker()}</span>}
      </div>
      <div className="rasi-cell-planets">
        {planets.map((p) => (
          <PlanetChip key={p.planet} planet={p.planet} isRetrograde={p.isRetrograde} />
        ))}
      </div>
    </div>
  );
}
