import React from "react";
import { Link } from "react-router-dom";
import { Deal } from "../../types";
import { CategoryBadge } from "../common/CategoryBadge";
import { StatusBadge } from "../common/StatusBadge";
import { ArrowRight, Star, MapPin, Send } from "lucide-react";
import { DEFAULT_CATEGORY_IMAGES } from "../../lib/categoryImages";
import { sanitizeUrl } from "../../lib/sanitize";

interface DealCardProps {
  deal: Deal;
  isSelected?: boolean;
  isHovered?: boolean;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  onOpenOffer?: (deal: Deal) => void;
}

export function DealCard({
  deal,
  isSelected,
  isHovered,
  onHover,
  onSelect,
  onOpenOffer,
}: DealCardProps) {
  const fallbackUrl = DEFAULT_CATEGORY_IMAGES[deal.category] || DEFAULT_CATEGORY_IMAGES["Other"];
  const imageUrl = sanitizeUrl(deal.image_url, fallbackUrl);

  return (
    <div
      id={`deal-card-${deal.id}`}
      onMouseEnter={() => onHover && onHover(deal.id)}
      onMouseLeave={() => onHover && onHover(null)}
      onClick={() => onSelect && onSelect(deal.id)}
      className={`group bg-[var(--surface)] border rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xl hover:-translate-y-1 ${
        isSelected
          ? "border-[var(--ink)] ring-2 ring-[var(--ink)]/30 shadow-lg -translate-y-1"
          : isHovered
          ? "border-[var(--ink)]/80 shadow-md -translate-y-1"
          : "border-[var(--line)] hover:border-[var(--ink)]/40"
      }`}
    >
      <div>
        {/* Item Image Header */}
        <div className="relative h-44 w-full overflow-hidden bg-[var(--paper)]">
          <img
            src={imageUrl}
            alt={deal.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-black/35 pointer-events-none" />

          {/* Category Badge Overlaid Top-Left */}
          <div className="absolute top-3 left-3 z-10">
            <CategoryBadge category={deal.category} />
          </div>

          {/* Status Badge Top-Right */}
          <div className="absolute top-3 right-3 z-10">
            <StatusBadge status={deal.status} />
          </div>

          {/* Distance & Location Overlaid Bottom */}
          <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center justify-between text-white text-xs font-semibold">
            <div className="flex items-center gap-1.5 drop-shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[170px] text-[11px]">
                {deal.distance_km !== undefined ? `${deal.distance_km} km away` : deal.address || "Nearby"}
              </span>
            </div>

            <div className="bg-black/75 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-zinc-200">
              {deal.radius_km}km radar
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Title */}
          <h4 className="font-bold text-base text-[var(--ink)] group-hover:opacity-80 transition-opacity line-clamp-1 tracking-tight leading-snug">
            {deal.title}
          </h4>

          {/* Description */}
          <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed font-normal">
            {deal.description}
          </p>

          {/* Creator Profile Mini Row */}
          {deal.creator && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {deal.creator.profile_photo ? (
                  <img
                    src={deal.creator.profile_photo}
                    alt={deal.creator.username}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-[var(--line)] shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[var(--line)]/50 text-[var(--ink)] text-[10px] font-bold flex items-center justify-center shrink-0">
                    {deal.creator.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-semibold text-[var(--ink)] truncate text-[11px]">
                  {deal.creator.username}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span>{deal.creator.avg_rating?.toFixed(1) || "5.0"}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Meta: Budget Range & Action CTA */}
      <div className="px-5 py-3.5 bg-[var(--surface)] border-t border-[var(--line)] flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider block">
            Budget Range
          </span>
          <span className="text-base font-extrabold text-[var(--ink)]">
            ₹{deal.budget_min}
            {deal.budget_max > deal.budget_min ? ` – ₹${deal.budget_max}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenOffer && deal.status === "open" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenOffer(deal);
              }}
              className="px-3 py-1.5 rounded-full bg-[var(--ink)] text-[var(--paper)] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs hover:opacity-90"
            >
              <Send className="w-3 h-3" />
              <span>Offer</span>
            </button>
          )}

          <Link
            to={`/deals/${deal.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-full bg-[var(--surface)] border border-[var(--line)] group-hover:border-[var(--ink)] group-hover:bg-[var(--ink)] text-[var(--muted)] group-hover:text-[var(--paper)] transition-all shadow-2xs"
            title="View Full Need & Offers"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DealCard;
