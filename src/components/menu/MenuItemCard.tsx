import { cn } from "@/lib/cn";
import type { MenuItemSeed } from "@/data/menu-appleton";

const TAG_LABELS: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  glutenFree: "GF",
};

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  vegetarian: { bg: "#DCFCE7", text: "#166534" },
  vegan: { bg: "#D1FAE5", text: "#065F46" },
  glutenFree: { bg: "#FEF9C3", text: "#713F12" },
};

interface MenuItemCardProps {
  item: MenuItemSeed;
  id?: string;
  highlighted?: boolean;
}

export default function MenuItemCard({ item, id, highlighted }: MenuItemCardProps) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-xl p-5 transition-all duration-300",
        highlighted && "ring-2 ring-offset-2"
      )}
      style={{
        backgroundColor: "white",
        border: "1px solid rgba(0,0,0,0.07)",
        ...(highlighted
          ? { ringColor: "var(--color-gold)", boxShadow: "0 0 0 2px var(--color-gold)" }
          : {}),
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className="font-heading text-base font-semibold leading-tight"
              style={{ color: "var(--color-ink)" }}
            >
              {item.name}
            </h3>
            {item.isFanFavorite && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: "var(--color-teal)", color: "white" }}
              >
                Fan Favorite
              </span>
            )}
            {item.isStaffPick && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: "var(--color-gold)", color: "var(--color-ink)" }}
              >
                Staff Pick
              </span>
            )}
          </div>

          {item.description && (
            <p
              className="mt-1.5 text-sm leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              {item.description}
            </p>
          )}

          {/* Dietary tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => {
                const colors = TAG_COLORS[tag];
                return colors ? (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {TAG_LABELS[tag] ?? tag}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Price */}
        <span
          className="flex-shrink-0 font-heading text-base font-bold"
          style={{ color: "var(--color-teal)" }}
        >
          {item.price}
        </span>
      </div>
    </div>
  );
}
