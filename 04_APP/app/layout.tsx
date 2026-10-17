import type { ReactNode } from "react";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";
import SourceTracker from "@/components/SourceTracker";
import { Amatic_SC, Caveat, Patrick_Hand, Poppins } from "next/font/google";

// Fontes servidas pelo próprio site (sem bloquear a renderização com o Google Fonts).
// Poppins com "optional": o texto do topo aparece de primeira, sem trocar de fonte depois (isso atrasava o LCP).
const poppins = Poppins({ weight: ["400", "600", "700", "800"], subsets: ["latin"], display: "optional", preload: false, variable: "--font-poppins" });
const amatic = Amatic_SC({ weight: "700", subsets: ["latin"], display: "swap", preload: false, variable: "--nb-amatic" });
const caveat = Caveat({ weight: "600", subsets: ["latin"], display: "swap", preload: false, variable: "--nb-caveat" });
const hand = Patrick_Hand({ weight: "400", subsets: ["latin"], display: "swap", preload: false, variable: "--nb-hand" });

export const metadata = {
  title: "Mapas Falantes",
  description: "Mapas mentais de inglês com áudio nativo, criados por IA em segundos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${amatic.variable} ${caveat.variable} ${hand.variable}`}>
      <head>
        <meta name="facebook-domain-verification" content="x38zcqzks4bc0ihm080vtnliogsl6e" />
        <meta name="facebook-domain-verification" content="60uu2ite08md6ufie2o548tr95jpnd" />
      </head>
      <body>
        <MetaPixel />
        <SourceTracker />
        {children}
      </body>
    </html>
  );
}
