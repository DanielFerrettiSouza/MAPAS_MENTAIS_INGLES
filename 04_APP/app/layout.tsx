import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Mappe Parlanti",
  description: "L'inglese che vedi E che senti — mappe mentali con audio nativo integrato.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
