"use client";

import { useRouter } from "next/navigation";
import { IconSparkles } from "./Icons";

// Sem créditos: vai para os planos. Com créditos: abre a página de criar mapa.
export default function QuickCreate({ credits }: { credits: number }) {
  const router = useRouter();
  return (
    <button
      className="qa pink"
      onClick={() => {
        router.push(credits <= 0 ? "/app/planos" : "/app/criar");
      }}
    >
      <IconSparkles /> Criar mapa
    </button>
  );
}
