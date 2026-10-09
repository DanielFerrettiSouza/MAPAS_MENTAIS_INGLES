"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudyToggle({ slug, done }: { slug: string; done: boolean }) {
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
      {on ? "✓ Estudado (desmarcar)" : "Marcar como estudado"}
    </button>
  );
}
