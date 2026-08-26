import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import logoImg from "../../assets/dealpool-logo.png";

interface BrandMarkProps {
  to?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  inverted?: boolean;
  className?: string;
}

const sizes = {
  sm: { img: "h-8 w-8", text: "text-lg" },
  md: { img: "h-10 w-10", text: "text-2xl" },
  lg: { img: "h-14 w-14", text: "text-3xl" },
  xl: { img: "h-20 w-20", text: "text-4xl" },
};

export function BrandMark({
  to = "/",
  size = "md",
  showWordmark = true,
  inverted = false,
  className,
}: BrandMarkProps) {
  const s = sizes[size];
  const content = (
    <span className={cn("inline-flex items-center gap-2.5 group", className)}>
      <img
        src={logoImg}
        alt="DealPool Logo"
        className={cn(
          "shrink-0 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-105",
          s.img
        )}
      />
      {showWordmark && (
        <span
          className={cn(
            "font-display font-black tracking-tight",
            s.text,
            inverted ? "text-white" : "text-[var(--ink)]"
          )}
        >
          DealPool
        </span>
      )}
    </span>
  );

  if (!to) return content;
  return (
    <Link
      to={to}
      className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  );
}

export default BrandMark;
