import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Mappe Parlanti",
  description: "L'inglese che vedi E che senti — mappe mentali con audio nativo integrato.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amatic+SC:wght@700&family=Caveat:wght@600&family=Patrick+Hand&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
