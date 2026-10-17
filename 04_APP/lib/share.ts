import { createHmac, timingSafeEqual } from "node:crypto";

// Link da turma (plano Professor): /turma/<tipo>/<id>/<chave>. A chave é uma
// assinatura do próprio site, então ninguém consegue montar link para outro mapa.
const sign = (tipo: string, id: string) =>
  createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").update(`turma|${tipo}|${id}`).digest("base64url").slice(0, 16);

export const classLinkPath = (tipo: string, id: string) => `/turma/${tipo}/${encodeURIComponent(id)}/${sign(tipo, id)}`;

export function validClassLink(tipo: string, id: string, k: string) {
  const a = Buffer.from(sign(tipo, id)), b = Buffer.from(k);
  return a.length === b.length && timingSafeEqual(a, b);
}
