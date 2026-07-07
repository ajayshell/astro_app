import { useDraggable } from "@dnd-kit/core";
import type { PlanetName } from "../astro/constants";
import type { Dignity } from "../astro/dignity";
import { formatDegree, PLANET_ABBR } from "../astro/format";
import { useI18n } from "../i18n/LanguageContext";

interface Props {
  planet: PlanetName;
  isRetrograde: boolean;
  siderealLongitude: number;
  dignity: Dignity;
}

export function PlanetChip({ planet, isRetrograde, siderealLongitude, dignity }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: planet,
  });
  const { t } = useI18n();

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <span
      ref={setNodeRef}
      style={style}
      className={`planet-chip ${dignity ? `planet-chip-${dignity}` : ""}`}
      {...listeners}
      {...attributes}
    >
      <span className="planet-chip-name-row">
        <span className="planet-chip-name">
          {PLANET_ABBR[planet]}
          {isRetrograde && <sup>R</sup>}
        </span>
        <span className="planet-chip-degree">{formatDegree(siderealLongitude)}</span>
      </span>
      {(dignity || isRetrograde) && (
        <span className="planet-chip-tags">
          {dignity === "exalted" && <span className="planet-chip-tag tag-uccha">{t("uccha")}</span>}
          {dignity === "debilitated" && <span className="planet-chip-tag tag-neecha">{t("neecha")}</span>}
          {isRetrograde && <span className="planet-chip-tag tag-retro">{t("retro")}</span>}
        </span>
      )}
    </span>
  );
}
