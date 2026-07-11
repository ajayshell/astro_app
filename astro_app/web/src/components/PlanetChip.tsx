import { useDraggable } from "@dnd-kit/core";
import type { PlanetName } from "../astro/constants";
import type { Dignity } from "../astro/dignity";
import { degreeParts } from "../astro/format";
import { useI18n } from "../i18n/LanguageContext";

interface Props {
  planet: PlanetName;
  isRetrograde: boolean;
  siderealLongitude: number;
  dignity: Dignity;
  draggable?: boolean;
}

export function PlanetChip({ planet, isRetrograde, siderealLongitude, dignity, draggable = true }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: planet,
    disabled: !draggable,
  });
  const { t, planetAbbr } = useI18n();
  const { deg, minText } = degreeParts(siderealLongitude);

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.6 : 1,
    cursor: draggable ? "grab" : "default",
  };

  return (
    <span
      ref={setNodeRef}
      style={style}
      className="planet-chip"
      {...(draggable ? listeners : {})}
      {...(draggable ? attributes : {})}
    >
      <span className={`planet-chip-name ${dignity ? `planet-chip-${dignity}` : ""}`}>
        {planetAbbr(planet)}
        {isRetrograde && <sup>R</sup>}
      </span>
      <span className="planet-chip-degree">
        {deg}°<span className="planet-chip-minutes">{minText}'</span>
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
