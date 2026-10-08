import { NextResponse } from "next/server";
import { generateIllustration, generateMapContent } from "@/lib/ai";
import type { MapWithImages } from "@/lib/mapSchema";

export const runtime = "nodejs";
export const maxDuration = 120;

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const topic = String(body.topic ?? "").trim().slice(0, 200);
  const level = LEVELS.includes(body.level) ? body.level : "A1";
  const goal = body.goal ? String(body.goal).slice(0, 200) : undefined;

  if (!topic) {
    return NextResponse.json({ error: "Informe um assunto." }, { status: 400 });
  }

  try {
    const map = await generateMapContent({ topic, level, goal });

    // Ilustrações em paralelo: capa + 1 por ramo.
    const [cover_image, ...branch_images] = await Promise.all([
      generateIllustration(map.cover_prompt),
      ...map.branches.map((b) => generateIllustration(b.illustration_prompt)),
    ]);

    const result: MapWithImages = { ...map, cover_image, branch_images };
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Erro ao gerar o mapa.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
