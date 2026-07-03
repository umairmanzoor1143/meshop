import Image from "next/image";
import { tileColor, tileMark } from "@/lib/placeholder";
import { cn } from "@/lib/utils";

// Renders a product/category image into a parent with `position: relative` and a
// fixed aspect ratio. `fit="contain"` shows the whole image (products are line
// illustrations that must not be cropped); `fit="cover"` fills the frame.
// Falls back to a deterministic letter tile when there is no resolved image URL.
export function ProductImage({
  src,
  alt,
  seed,
  sizes = "(max-width: 768px) 50vw, 25vw",
  className,
  fit = "cover",
  priority,
}: {
  src?: string | null;
  alt: string;
  seed?: string;
  sizes?: string;
  className?: string;
  fit?: "cover" | "contain";
  priority?: boolean;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          fit === "contain" ? "object-contain p-4 sm:p-6" : "object-cover object-center",
          className
        )}
      />
    );
  }
  return (
    <div
      className="absolute inset-0 flex items-center justify-center select-none"
      style={{ backgroundColor: tileColor(seed ?? alt) }}
      aria-hidden="true"
    >
      <span className="font-serif text-5xl font-normal text-brand-ink/25">{tileMark(alt)}</span>
    </div>
  );
}
