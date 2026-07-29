import { ChevronRight } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";
import type { TitleItem } from "@/types";

export function MediaRow({
  id,
  eyebrow,
  title,
  items,
  description,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  items: TitleItem[];
  description?: string;
}) {
  if (!items.length) return null;

  return (
    <section className="mediaSection" id={id}>
      <div className="sectionHeading">
        <div>
          {eyebrow ? <span className="sectionEyebrow">{eyebrow}</span> : null}
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <button className="viewAll">View all <ChevronRight size={17} /></button>
      </div>
      <div className="mediaRail">
        {items.map((item, index) => (
          <MovieCard key={`${item.media_type}-${item.id}`} item={item} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}
