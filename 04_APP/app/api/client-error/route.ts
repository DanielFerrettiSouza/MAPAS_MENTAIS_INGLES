import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createSupabaseAdmin } from "@/lib/supa/server";

export const runtime = "nodejs";

// Recebe os erros que travam o app no navegador do aluno (tela "algo deu errado") e guarda
// em map-images/erros/, para sabermos a causa real (mensagem, página, celular e navegador).
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const cut = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : undefined);
  const erro = {
    quando: new Date().toISOString(),
    mensagem: cut(b.message, 500),
    digest: cut(b.digest, 100),
    pilha: cut(b.stack, 3000),
    pagina: cut(b.url, 300),
    navegador: headers().get("user-agent")?.slice(0, 300),
  };
  console.error("Erro no navegador do aluno:", erro);
  await createSupabaseAdmin()
    .storage.from("map-images")
    .upload(`erros/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`, JSON.stringify(erro), { contentType: "application/json" })
    .catch(() => null);
  return NextResponse.json({ ok: true });
}
