"use client";

import { useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supa/client";

const KEY = "mf_origem";
const UTM_KEY = "mf_utm";
const UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "sck"];

// Guarda de onde a pessoa veio (UTM do anúncio, fbclid ou site de origem) na primeira visita
// e grava no cadastro dela assim que estiver logada — aparece na coluna "Origem" do admin.
function detect(): string {
  const q = new URLSearchParams(window.location.search);
  const utm = [q.get("utm_source"), q.get("utm_campaign"), q.get("utm_content")].filter(Boolean).join(" / ");
  if (utm) return utm;
  if (q.get("fbclid")) return "meta (anúncio)";
  const ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
  if (ref && ref !== window.location.hostname && !/supabase|google\.com|accounts\.google/.test(ref)) return ref;
  return "";
}

export default function SourceTracker() {
  useEffect(() => {
    let saved = "";
    try {
      saved = localStorage.getItem(KEY) ?? "";
      if (!saved) {
        const found = detect();
        if (found) localStorage.setItem(KEY, (saved = `${found} · ${window.location.pathname}`));
      }
    } catch {}
    // Origem do anúncio vai junto para o checkout da Kiwify (aparece em cada venda lá).
    // Guarda a última visita com UTM; ao clicar num link da Kiwify, os parâmetros são acrescentados.
    try {
      const q = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      for (const f of UTM_FIELDS) if (q.get(f)) utm[f] = q.get(f)!;
      if (!utm.utm_source && q.get("fbclid")) utm.utm_source = "facebook";
      if (Object.keys(utm).length) localStorage.setItem(UTM_KEY, JSON.stringify(utm));
    } catch {}
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href*='pay.kiwify.com.br']") as HTMLAnchorElement | null;
      if (!a) return;
      try {
        const utm = JSON.parse(localStorage.getItem(UTM_KEY) ?? "{}") as Record<string, string>;
        const url = new URL(a.href);
        for (const [k, v] of Object.entries(utm)) if (!url.searchParams.has(k)) url.searchParams.set(k, v);
        a.href = url.toString();
      } catch {}
    };
    document.addEventListener("click", onClick, true);
    const supabase = createSupabaseBrowser();
    // Link de "Esqueci minha senha": onde quer que a pessoa caia, leva para criar a senha nova.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") window.location.href = "/app/configuracoes?nova-senha=1";
    });
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      // Só marca "direto" em contas recém-criadas, para não rotular errado quem entrou antes disso existir.
      const novo = !!u && Date.now() - new Date(u.created_at).getTime() < 3600_000;
      if (u && !u.user_metadata?.origem && (saved || novo)) {
        supabase.auth.updateUser({ data: { origem: saved || "direto" } });
      }
    });
    return () => {
      sub.subscription.unsubscribe();
      document.removeEventListener("click", onClick, true);
    };
  }, []);
  return null;
}
