import Image from "next/image";

/**
 * Terrevolution tower mark as the site brand. Fixed top-left; sits inline
 * with the concept page's back-link pill when `badge` is provided.
 */
export default function BrandMark({
  href = "/",
  badge,
}: {
  href?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="absolute top-5 left-6 z-50 flex items-center gap-3">
      <a href={href} aria-label="Terrevolution — accueil" className="shrink-0">
        <Image
          src="/img/terrevolution-mark.png"
          alt="Terrevolution"
          width={33}
          height={45}
          priority
          className="h-11 w-auto drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]"
        />
      </a>
      {badge}
    </div>
  );
}
