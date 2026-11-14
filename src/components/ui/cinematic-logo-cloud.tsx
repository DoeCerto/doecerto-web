"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type LogoCloudClient = {
  name: string;
  slug?: string;
  src?: string; 
  text?: boolean;
  className?: string;
  nameClassName?: string;
  invertDark?: boolean;
};

export interface CinematicLogoCloudProps {
  clients: LogoCloudClient[];
  className?: string;
  eyebrow?: React.ReactNode | string;
  description?: string;
}

export function CinematicLogoCloud({
  clients,
  className,
  eyebrow = "Apoiadores oficiais e parceiros do DoeCerto",
}: CinematicLogoCloudProps) {

   const renderClient = (client: LogoCloudClient, size: "lg" | "sm" = "lg") => {
    if (client.text) {
      return (
        <span
          className={cn(
            size === "lg"
              ? "text-xl font-bold text-zinc-900 dark:text-white"
              : "text-sm font-semibold text-zinc-700 dark:text-zinc-300",
            client.className,
          )}
        >
          {client.name}
        </span>
      );
    }
    
    if (client.src) {
      return (
        <img
          src={client.src}
          alt={client.name}
          className={cn(
            "w-auto object-contain", 
            client.className 
          )}
          loading="lazy"
        />
      );
    }

    return (
      <img
        src={`https://cdn.simpleicons.org/${client.slug}`}
        alt={client.name}
        className={cn(
          size === "lg" ? "h-6 w-auto" : "h-5 w-auto",
          client.invertDark && "dark:invert",
          client.className 
        )}
        loading="lazy"
      />
    );
  };

  return (
    <div
      className={cn(
        "w-full bg-white py-12 md:py-24",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* TROCAMOS lg: POR xl: - Só fica lado a lado em telas maiores que 1280px */}
        <div className="flex flex-col xl:flex-row items-center justify-center gap-8 xl:gap-12">
          
          {/* TROCAMOS lg: POR xl: */}
          <div className="xl:text-right text-center max-w-[280px] shrink-0">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-zinc-600 leading-loose">
              {eyebrow}
            </p>
          </div>

          {/* TROCAMOS lg: POR xl: - Linha divisória acompanha a mudança */}
          <div className="hidden xl:block w-px h-20 bg-zinc-300"></div>
          <div className="block xl:hidden h-px w-24 bg-zinc-300"></div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.2 } }, 
              hidden: {},
            }}
            // TROCAMOS lg: POR xl: no espaçamento
            className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-8 md:gap-10 xl:gap-12 transition-all flex-1 w-full"
          >
            {clients.map((brand) => (
              <motion.div
                key={brand.name}
                variants={{
                  hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="flex shrink-0 items-center justify-center p-2"
              >
                {renderClient(brand)}
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export default CinematicLogoCloud;