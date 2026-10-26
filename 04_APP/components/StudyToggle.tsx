"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudyToggle({ slug, done, lang = "pt" }: { slug: string; done: boolean; lang?: "pt" | "es" }) {
  const t = (pt: string, es: string) => (lang === "es" ? es : pt);
  const [on, setOn] = useState(done);
  const router = useRouter();
  return (
    <button
      className={on ? "secondary-btn" : "primary-btn grad-btn"}
      onClick={async () => {
        setOn(!on);
        await fetch("/api/study", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, done: !on }) });
        router.refresh();
      }}
    >
      {on ? t("✓ Estudado (desmarcar)", "✓ Estudiado (desmarcar)") : t("Marcar como estudado", "Marcar como estudiado")}
    </button>
  );
}
