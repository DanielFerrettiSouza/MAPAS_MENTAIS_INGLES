"use client";

import { useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supa/client";

const KEY = "mf_origem";

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
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      // Só marca "direto" em contas recém-criadas, para não rotular errado quem entrou antes disso existir.
      const novo = !!u && Date.now() - new Date(u.created_at).getTime() < 3600_000;
      if (u && !u.user_metadata?.origem && (saved || novo)) {
        supabase.auth.updateUser({ data: { origem: saved || "direto" } });
      }
    });
  }, []);
  return null;
}
