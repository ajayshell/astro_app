import { useDroppable } from "@dnd-kit/core";
import type { PlanetName } from "../astro/constants";
import { getDignity } from "../astro/dignity";
import { formatDegree } from "../astro/format";
import { PlanetChip } from "./PlanetChip";
import { useI18n } from "../i18n/LanguageContext";

interface Props {
  rasiIndex: number;
  houseNumber?: number | null;
  showHouseNumber?: boolean;
  isAscendant: boolean;
  isAarudom?: boolean;
  // Degrees into rasiIndex's sign (0-30), per the Aarudom degree rule.
  aarudomDegree?: number;
  isUdayam?: boolean;
  // Sidereal longitude Udayam landed on -- formatted the same way as a
  // planet's degree, since it's a full longitude rather than a within-sign
  // value like aarudomDegree.
  udayamLongitude?: number;
  isKavippu?: boolean;
  // Degrees into rasiIndex's sign (0-30], per the Kavippu degree rule
  // (30 - Aarudom's degree).
  kavippuDegree?: number;
  planets: { planet: PlanetName; isRetrograde: boolean; siderealLongitude: number }[];
  className?: string;
  style?: React.CSSProperties;
  draggable?: boolean;
}

export function RasiCell({
  rasiIndex,
  houseNumber = null,
  showHouseNumber = false,
  isAscendant,
  isAarudom = false,
  aarudomDegree,
  isUdayam = false,
  udayamLongitude,
  isKavippu = false,
  kavippuDegree,
  planets,
  className,
  style,
  draggable = true,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `rasi-${rasiIndex}` });
  const { t, rasiLabel, ascendantMarker } = useI18n();

  return (
    <div
      ref={setNodeRef}
      className={`rasi-cell ${isOver ? "rasi-cell-over" : ""} ${className ?? ""}`}
      style={style}
    >
      <div className="rasi-cell-header">
        <span className="rasi-sign-label">{rasiLabel(rasiIndex)}</span>
        {showHouseNumber && houseNumber !== null && <span className="rasi-house-number">H{houseNumber}</span>}
        {isAscendant && <span className="rasi-asc-marker">{ascendantMarker()}</span>}
        {isAarudom && (
          <span className="rasi-aarudom-marker">
            {t("aarudom")}
            {aarudomDegree !== undefined && <span className="rasi-aarudom-degree"> {formatDegree(aarudomDegree)}</span>}
          </span>
        )}
        {isUdayam && (
          <span className="rasi-udayam-marker">
            {t("udayam")}
            {udayamLongitude !== undefined && <span className="rasi-udayam-degree"> {formatDegree(udayamLongitude)}</span>}
          </span>
        )}
        {isKavippu && (
          <span className="rasi-kavippu-marker">
            {t("kavippu")}
            {kavippuDegree !== undefined && <span className="rasi-kavippu-degree"> {formatDegree(kavippuDegree)}</span>}
          </span>
        )}
      </div>
      <div className="rasi-cell-planets">
        {planets.map((p) => (
          <PlanetChip
            key={p.planet}
            planet={p.planet}
            isRetrograde={p.isRetrograde}
            siderealLongitude={p.siderealLongitude}
            dignity={getDignity(p.planet, rasiIndex)}
            draggable={draggable}
          />
        ))}
      </div>
    </div>
  );
}
