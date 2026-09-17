import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Partner credits shared by the main page and the concept page footer.
 * All three logos render in an identical slot — same light disc, same box,
 * object-contain — so no mark outweighs the others. Colors are preserved
 * (no filters): ETS Consult green, Terrevolution orange, Tierrafino black.
 */
function LogoSlot({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  return (
    <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#efece6]">
      <Image src={src} alt={alt} width={96} height={96} sizes={sizes} className="max-h-9 w-auto max-w-[56px] object-contain" />
    </span>
  );
}

export default function PartnerCredits({ dict }: { dict: Dictionary }) {
  return (
    <div className="mt-10 md:mt-12 border-t border-sand/10 pt-8">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 md:gap-14">
        {/* Bureau d'étude */}
        <a
          href="https://www.etsconsult.ma/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 opacity-80 transition-opacity hover:opacity-100"
        >
          <LogoSlot src="/img/ets-consult.png" alt="ETS Consult" sizes="64px" />
          <span className="text-left">
            <span className="block text-[9px] tracking-[0.25em] uppercase text-sand/40">
              {dict.footer.bureauEtude}
            </span>
            <span className="block text-sm font-medium text-sand/80 transition-colors group-hover:text-gold">
              ETS Consult
            </span>
          </span>
        </a>

        {/* Maître d'ouvrage */}
        <a
          href="https://terrevolution.ma"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 opacity-80 transition-opacity hover:opacity-100"
        >
          <LogoSlot src="/img/terrevolution.png" alt="Terrevolution" sizes="64px" />
          <span className="text-left">
            <span className="block text-[9px] tracking-[0.25em] uppercase text-sand/40">
              {dict.footer.maitreOuvrage}
            </span>
            <span className="block text-sm font-medium text-sand/80 transition-colors group-hover:text-gold">
              Terrevolution
            </span>
          </span>
        </a>

        {/* Partenaire */}
        <a
          href="https://tierrafino.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 opacity-80 transition-opacity hover:opacity-100"
        >
          <LogoSlot src="/img/tierrafino.png" alt="Tierrafino" sizes="64px" />
          <span className="text-left">
            <span className="block text-[9px] tracking-[0.25em] uppercase text-sand/40">
              {dict.footer.partenaire}
            </span>
            <span className="block text-sm font-medium text-sand/80 transition-colors group-hover:text-gold">
              Tierrafino
            </span>
          </span>
        </a>
      </div>
    </div>
  );
}
