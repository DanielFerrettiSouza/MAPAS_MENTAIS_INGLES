import Stripe from "stripe";
import type { GrantItem } from "@/lib/grant";

// Checkout do Stripe para a versão em espanhol (/es). Preço base em dólar e preço fixo em cada
// moeda local (aprovados em 26/10): o Stripe cobra o mesmo valor que a página mostra.
export const stripe = () => new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export type EsProduct = { key: GrantItem; lookup: string; name: string; description: string; cents: number; image: string; local: Record<string, number>; grants?: GrantItem[] };

export const ES_PRODUCTS: EsProduct[] = [
  { key: "biblioteca", lookup: "mf_es_metodo_v2", name: "Método Mapas Parlantes", description: "120 mapas mentales de inglés con audio nativo, del A1 al C2, test de nivel, plan de estudio y bonos. Acceso de por vida.", image: "metodo", cents: 2700, local: { mxn: 49900, cop: 8490000, clp: 26990, pen: 8990, eur: 2490 } },
  { key: "kit-viagem", lookup: "mf_es_kit_viaje_v2", name: "Kit Viaje", description: "20 mapas listos para viajar: aeropuerto, migración, hotel, restaurante, compras y más. Con audio nativo.", image: "kit-viaje", cents: 700, local: { mxn: 12900, cop: 2190000, clp: 6990, pen: 2390, eur: 590 } },
  { key: "kit-trabalho", lookup: "mf_es_kit_trabajo_v2", name: "Kit Trabajo", description: "20 mapas listos para el trabajo: reuniones, llamadas, correos, entrevistas y más. Con audio nativo.", image: "kit-trabajo", cents: 700, local: { mxn: 12900, cop: 2190000, clp: 6990, pen: 2390, eur: 590 } },
  // Order bump do checkout (27/10): os dois kits num item só, com desconto. Libera os dois kits.
  { key: "kit-viagem", grants: ["kit-viagem", "kit-trabalho"], lookup: "mf_es_pack_kits_v1", name: "Pack Viaje + Trabajo (40 mapas)", description: "Los 2 kits juntos con descuento: 20 mapas para viajar y 20 para el trabajo, con audio nativo. Acceso de por vida.", image: "pack-kits", cents: 1200, local: { mxn: 21900, cop: 3790000, clp: 11990, pen: 3990, eur: 1090 } },
  { key: "pacote", lookup: "mf_es_paquete5_v2", name: "Paquete 5 mapas con IA", description: "5 mapas nuevos creados con IA sobre los temas que tú elijas, con audio y ejercicios.", image: "paquete", cents: 900, local: { mxn: 16900, cop: 2890000, clp: 8990, pen: 2990, eur: 790 } },
];

// Cria (uma vez) o produto e o preço de cada item e devolve o id do preço pelo lookup_key.
export async function esPriceIds(s: Stripe) {
  const found = await s.prices.list({ lookup_keys: ES_PRODUCTS.map((p) => p.lookup), active: true, limit: 10, expand: ["data.product"] });
  const ids: Record<string, string> = Object.fromEntries(found.data.map((p) => [p.lookup_key!, p.id]));
  // Imagem e descrição de cada produto no checkout (aparecem no Método e nos order bumps). Feito uma vez por produto.
  for (const price of found.data) {
    const prod = price.product as Stripe.Product;
    const def = ES_PRODUCTS.find((x) => x.lookup === price.lookup_key);
    if (def && typeof prod === "object" && (!prod.images?.length || prod.description !== def.description)) {
      await s.products.update(prod.id, { description: def.description, images: [`https://www.mapasfalantes.com.br/es/checkout/${def.image}.png`] });
    }
  }
  for (const p of ES_PRODUCTS) {
    if (ids[p.lookup]) continue;
    const price = await s.prices.create({
      currency: "usd",
      unit_amount: p.cents,
      lookup_key: p.lookup,
      currency_options: Object.fromEntries(Object.entries(p.local).map(([c, v]) => [c, { unit_amount: v }])),
      product_data: { name: p.name, metadata: { mf_item: p.key } },
      metadata: { mf_item: p.key },
    });
    ids[p.lookup] = price.id;
  }
  return ids;
}

export const itemFromLookup = (lookup?: string | null) => ES_PRODUCTS.find((p) => p.lookup === lookup);

// Moeda mostrada na página conforme o país do visitante (header da Vercel); outros países veem dólar.
const COUNTRY_CURRENCY: Record<string, string> = { MX: "mxn", CO: "cop", CL: "clp", PE: "pen", ES: "eur" };
const FORMAT: Record<string, (n: number) => string> = {
  usd: (n) => `US$${n / 100}`,
  mxn: (n) => `$${n / 100} MXN`,
  cop: (n) => `$${(n / 100).toLocaleString("es-CO")} COP`,
  clp: (n) => `$${n.toLocaleString("es-CL")} CLP`,
  pen: (n) => `S/ ${(n / 100).toFixed(2).replace(".", ",")}`,
  eur: (n) => `${(n / 100).toFixed(2).replace(".", ",")} €`,
};
// País escolhido: ?pais= do link (anúncios por país) tem prioridade; senão, a localização do visitante.
export function esCountry(pais: string | null | undefined, ipCountry: string | null | undefined) {
  const p = pais?.toUpperCase();
  return p && COUNTRY_CURRENCY[p] ? p : ipCountry?.toUpperCase() ?? "";
}
export const esCurrency = (country: string) => COUNTRY_CURRENCY[country] ?? "usd";

export function esPriceLabel(country: string | null | undefined, item: GrantItem = "biblioteca") {
  const p = ES_PRODUCTS.find((x) => x.key === item)!;
  const cur = COUNTRY_CURRENCY[country?.toUpperCase() ?? ""];
  return cur ? FORMAT[cur](p.local[cur]) : FORMAT.usd(p.cents);
}
