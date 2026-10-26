import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import type { MapWithImages } from "@/lib/mapSchema";

// Idioma da interface: espanhol para quem se cadastrou por /es (cookie ou cadastro); senão português.
export type Lang = "pt" | "es";
export function getLang(user?: User | null): Lang {
  if (user?.user_metadata?.lang === "es") return "es";
  return cookies().get("mf-lang")?.value === "es" ? "es" : "pt";
}

// Texto curto nas duas línguas: tr(lang, "português", "español").
export const tr = (lang: Lang, pt: string, es: string) => (lang === "es" ? es : pt);

// Mapa da biblioteca traduzido (data/es/<slug>.json); sem tradução, fica o original.
export async function localizedMap(slug: string, map: MapWithImages, lang: Lang): Promise<MapWithImages> {
  if (lang !== "es") return map;
  try {
    const f = (await import(`@/data/es/${slug}.json`)).default as { data_es: MapWithImages };
    return { ...map, ...f.data_es, cover_image: map.cover_image, branch_images: map.branch_images };
  } catch {
    return map;
  }
}
