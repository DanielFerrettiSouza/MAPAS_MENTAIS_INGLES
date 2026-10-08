import Link from "next/link";
import { getLevelCounts } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { SUPPORTED_LOCALES } from "@/lib/supabase";

const LEVELS = [
  { code: "A1", name: "Fondazione" },
  { code: "A2", name: "Costruzione" },
  { code: "B1", name: "Indipendente" },
  { code: "B2", name: "Naturale" },
  { code: "C1", name: "Avanzato" },
  { code: "C2", name: "Padronanza" },
] as const;

export const revalidate = 0;

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!(SUPPORTED_LOCALES as readonly string[]).includes(params.locale)) notFound();
  const counts = await getLevelCounts(params.locale);

  return (
    <main className="container">
      <h1>Mappe Parlanti</h1>
      <p style={{ color: "var(--muted)" }}>
        Scegli il tuo livello. Tocca una mappa e ascolta la pronuncia nativa
        di ogni parola e frase.
      </p>

      <div className="level-grid">
        {LEVELS.map((lvl) => (
          <Link
            key={lvl.code}
            href={`/${params.locale}/level/${lvl.code}`}
            className="level-card"
          >
            <strong>{lvl.code}</strong>
            <span>{lvl.name}</span>
            <span> · {counts[lvl.code] ?? 0} mappe</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
