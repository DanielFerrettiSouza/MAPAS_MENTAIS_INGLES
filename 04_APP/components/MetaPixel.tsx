"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { META_PIXEL_ID, META_PIXEL_ID_ES } from "@/lib/pixel";

// Carrega o Pixel da Meta e envia PageView a cada troca de página.
export default function MetaPixel() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; } // o 1º PageView vai no script
    (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.("track", "PageView");
  }, [pathname]);

  // Versão em espanhol (páginas /es ou cliente com idioma espanhol) usa o pixel próprio.
  const es = pathname?.startsWith("/es") || (typeof document !== "undefined" && document.cookie.includes("mf-lang=es"));
  const id = es ? META_PIXEL_ID_ES : META_PIXEL_ID;
  if (!id) return null;
  return (
    <Script id={`meta-pixel-${id}`} strategy="lazyOnload">{`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${id}');fbq('track','PageView');
`}</Script>
  );
}
