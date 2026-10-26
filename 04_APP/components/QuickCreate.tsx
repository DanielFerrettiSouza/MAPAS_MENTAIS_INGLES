"use client";

import { useRouter } from "next/navigation";
import { IconSparkles } from "./Icons";

// Sem créditos: vai para os planos. Com créditos: abre a página de criar mapa.
export default function QuickCreate({ credits, lang = "pt" }: { credits: number; lang?: "pt" | "es" }) {
  const router = useRouter();
  return (
    <button
      className="qa pink"
      onClick={() => {
        router.push(credits <= 0 && lang !== "es" ? "/app/planos" : "/app/criar");
      }}
    >
      <IconSparkles /> {lang === "es" ? "Crear mapa" : "Criar mapa"}
    </button>
  );
}
