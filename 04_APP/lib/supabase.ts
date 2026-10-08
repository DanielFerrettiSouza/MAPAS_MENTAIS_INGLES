import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente público (anon key) — usado nas telas de leitura de mapas/áudio.
// A escrita de progresso do usuário passa pela auth do Supabase (link mágico), não por essa chave.
// Criado só quando usado, para o build (e o gerador por IA) funcionar sem Supabase configurado.
let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return client;
}

// Idiomas de vitrine suportados. Cada um vira um caminho: /it, /fr, /pt...
// (não subdomínio — assim funciona hoje no domínio grátis da Vercel, sem precisar comprar domínio)
export const SUPPORTED_LOCALES = ["it", "fr", "pt", "de"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type MindMap = {
  id: string;
  level: Level;
  topic: string;
  order_index: number;
  image_url: string | null;
  locale: string;
};

export type MindMapAudio = {
  id: string;
  mind_map_id: string;
  text: string;
  audio_url: string;
  position: number;
};

export async function getLevelCounts(locale: string): Promise<Record<Level, number>> {
  const { data, error } = await db()
    .from("mind_maps")
    .select("level")
    .eq("locale", locale);
  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.level] = (counts[row.level] ?? 0) + 1;
  }
  return counts as Record<Level, number>;
}

export async function getMapsByLevel(locale: string, level: Level): Promise<MindMap[]> {
  const { data, error } = await db()
    .from("mind_maps")
    .select("*")
    .eq("locale", locale)
    .eq("level", level)
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getMapById(id: string): Promise<MindMap | null> {
  const { data, error } = await db()
    .from("mind_maps")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAudioForMap(mindMapId: string): Promise<MindMapAudio[]> {
  const { data, error } = await db()
    .from("mind_map_audio")
    .select("*")
    .eq("mind_map_id", mindMapId)
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
