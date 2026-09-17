import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Partner credits shared by the main page and the concept page footer.
 * Logo colors are preserved — no filters — since the ETS Consult mark is
 * green and the Tierrafino wordmark is black on transparent (it sits on a
 * warm light disc so it stays readable on the dark footer).
 */
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
          <Image
            src="/img/ets-consult.png"
            alt="ETS Consult"
            width={44}
            height={44}
            className="w-11 h-11 object-contain"
          />
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
          <span className="flex w-11 h-11 items-center justify-center rounded-full border border-gold/40 text-gold font-bold text-lg">
            T
          </span>
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
          <span className="flex h-11 items-center justify-center rounded-full bg-[#efece6] px-4">
            <Image
              src="/img/tierrafino.png"
              alt="Tierrafino"
              width={128}
              height={31}
              className="w-32 h-auto"
            />
          </span>
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
