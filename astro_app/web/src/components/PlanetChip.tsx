import { useDraggable } from "@dnd-kit/core";
import type { PlanetName } from "../astro/constants";
import { PLANET_ABBR } from "../astro/format";

interface Props {
  planet: PlanetName;
  isRetrograde: boolean;
}

export function PlanetChip({ planet, isRetrograde }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: planet,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <span ref={setNodeRef} style={style} className="planet-chip" {...listeners} {...attributes}>
      {PLANET_ABBR[planet]}
      {isRetrograde && <sup>R</sup>}
    </span>
  );
}
