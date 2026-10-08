"use client";

import { useRouter } from "next/navigation";
import { IconSparkles } from "./Icons";

// Sem créditos: vai para os planos. Com créditos: leva o cursor ao campo do assunto.
export default function QuickCreate({ credits }: { credits: number }) {
  const router = useRouter();
  return (
    <button
      className="qa pink"
      onClick={() => {
        if (credits <= 0) return router.push("/app/planos");
        const input = document.getElementById("topic-input") as HTMLInputElement | null;
        input?.scrollIntoView({ behavior: "smooth", block: "center" });
        input?.focus();
      }}
    >
      <IconSparkles /> Criar mapa
    </button>
  );
}
