import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supa/server";

// Volta do link de confirmação por e-mail e do login com Google.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/app";
  if (code) await createSupabaseServer().auth.exchangeCodeForSession(code);
  const safeNext = next.startsWith("/") ? next : "/app";
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
