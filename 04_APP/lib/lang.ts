import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import type { MapWithImages } from "@/lib/mapSchema";
import type { MfEvent, MfEventAny } from "@/lib/klaviyo";

// Idioma da interface. Manda o idioma gravado na conta (cadastro por /es ou escolha em Configurações);
// sem escolha na conta, vale o cookie de onde a pessoa entrou (/es/entrar ou /entrar); padrão português.
export type Lang = "pt" | "es";
export function getLang(user?: User | null): Lang {
  const saved = user?.user_metadata?.lang;
  if (saved === "es" || saved === "pt") return saved;
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

// Eventos do Klaviyo: clientes em espanhol recebem eventos "MF ES …", que só disparam os fluxos em espanhol.
export const kEvent = (lang: Lang, name: MfEvent): MfEventAny => (lang === "es" ? (name.replace(/^MF /, "MF ES ") as MfEventAny) : name);
