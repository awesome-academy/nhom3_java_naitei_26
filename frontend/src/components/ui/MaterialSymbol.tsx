import { cn } from "@/lib/utils";

interface MaterialSymbolProps {
  icon: string;
  size?: number;
  className?: string;
}

/**
 * Renders a Material Symbols ligature without exposing the icon name as UI text.
 * Category icons come from the API as Material Symbols names (for example,
 * `restaurant` or `home`).
 */
export default function MaterialSymbol({ icon, size = 22, className }: MaterialSymbolProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined", className)}
      style={{ fontSize: `${size}px` }}
    >
      {icon}
    </span>
  );
}
