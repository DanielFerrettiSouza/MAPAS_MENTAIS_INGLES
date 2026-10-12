import type { ReactNode } from "react";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";
import SourceTracker from "@/components/SourceTracker";

export const metadata = {
  title: "Mapas Falantes",
  description: "Mapas mentais de inglês com áudio nativo, criados por IA em segundos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="facebook-domain-verification" content="x38zcqzks4bc0ihm080vtnliogsl6e" />
        <meta name="facebook-domain-verification" content="60uu2ite08md6ufie2o548tr95jpnd" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amatic+SC:wght@700&family=Caveat:wght@600&family=Patrick+Hand&family=Poppins:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <MetaPixel />
        <SourceTracker />
        {children}
      </body>
    </html>
  );
}
