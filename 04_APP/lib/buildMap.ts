import { generateIllustration, generateMapContent } from "./ai";
import type { MapWithImages } from "./mapSchema";
import type { createSupabaseAdmin } from "./supa/server";

type Admin = ReturnType<typeof createSupabaseAdmin>;

// Sobe a ilustração (data URL) para o Storage e devolve a URL pública.
export async function storeImage(admin: Admin, path: string, dataUrl: string | null) {
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
  if (!match) return null;
  const { error } = await admin.storage
    .from("map-images")
    .upload(path, Buffer.from(match[2], "base64"), { contentType: match[1], upsert: true });
  if (error) {
    console.error("Falha ao salvar imagem:", error.message);
    return null;
  }
  return admin.storage.from("map-images").getPublicUrl(path).data.publicUrl;
}

// Gera o conteúdo e (opcionalmente) a capa ilustrada. Os ramos usam emoji
// para manter o custo baixo; a capa é a única ilustração paga.
export async function buildMap(
  admin: Admin,
  opts: { topic: string; level: string; goal?: string; illustrate: boolean; imagePath: string }
): Promise<MapWithImages> {
  const map = await generateMapContent({ topic: opts.topic, level: opts.level, goal: opts.goal });
  const cover = opts.illustrate ? await generateIllustration(map.cover_prompt) : null;
  const cover_image = await storeImage(admin, `${opts.imagePath}/cover.png`, cover);
  return { ...map, cover_image, branch_images: map.branches.map(() => null) };
}
