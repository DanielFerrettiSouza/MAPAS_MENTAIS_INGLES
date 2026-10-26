import { INK_STYLE, generateIllustration, generateMapContent } from "./ai";
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

// Banco de ilustrações reaproveitáveis: cada conceito ("birthday cake") vira um
// arquivo ink/<conceito>.png e é usado por todos os mapas. Só desenha o que falta.
async function inkImage(admin: Admin, key: string, prompt: string, allowGenerate: boolean) {
  const slug = key
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  if (!slug) return null;
  const path = `ink/${slug}.png`;
  const url = admin.storage.from("map-images").getPublicUrl(path).data.publicUrl;
  const head = await fetch(url, { method: "HEAD", cache: "no-store" }).catch(() => null);
  if (head?.ok) return url;
  if (!allowGenerate) return null;
  return storeImage(admin, path, await generateIllustration(prompt, INK_STYLE));
}

// Quantas ilustrações novas um mapa grátis pode desenhar (o resto vem do banco).
const FREE_NEW_IMAGES = 2;

type Wanted = { key: string; prompt: string };

function wantedImages(map: { cover_key: string; cover_prompt: string; branches: { illustration_key: string; illustration_prompt: string }[] }): Wanted[] {
  return [
    { key: map.cover_key, prompt: map.cover_prompt },
    ...map.branches.map((b) => ({ key: b.illustration_key, prompt: b.illustration_prompt })),
  ];
}

// Gera o conteúdo e as ilustrações no estilo gravura. Plano pago desenha tudo o
// que faltar no banco; grátis desenha no máximo FREE_NEW_IMAGES (capa primeiro).
// Com defer, só usa o que já está no banco e devolve em `pending` o que falta
// desenhar (feito depois por finishImages, sem segurar a pessoa esperando).
export async function buildMap(
  admin: Admin,
  opts: { topic: string; level: string; goal?: string; lang?: "pt" | "es"; illustrate: boolean; imagePath: string; defer?: boolean; notebook?: boolean }
): Promise<MapWithImages> {
  const map = await generateMapContent({ topic: opts.topic, level: opts.level, goal: opts.goal, lang: opts.lang });
  const wanted = wantedImages(map);
  // Caderno (mapas criados pelos alunos): não desenha nada novo, só reaproveita o banco; o resto vira emoji.
  let budget = opts.notebook ? 0 : opts.illustrate ? Infinity : FREE_NEW_IMAGES;
  // Primeiro tenta o banco (sem gerar); depois desenha as que faltam, dentro do limite.
  const cached = await Promise.all(wanted.map((w) => inkImage(admin, w.key, w.prompt, false)));
  const pending: number[] = [];
  const images = await Promise.all(
    wanted.map((w, i) => {
      if (cached[i]) return cached[i];
      if (budget <= 0) return null;
      budget -= 1;
      if (opts.defer) {
        pending.push(i);
        return null;
      }
      return inkImage(admin, w.key, w.prompt, true);
    })
  );
  if (opts.notebook) return { ...map, cover_image: images[0], branch_images: images.slice(1) };
  return { ...map, style: "ink", cover_image: images[0], branch_images: images.slice(1), pending };
}

// Desenha as ilustrações que ficaram pendentes e devolve o mapa atualizado.
export async function finishImages(admin: Admin, map: MapWithImages): Promise<MapWithImages> {
  const wanted = wantedImages(map);
  const done = await Promise.all((map.pending ?? []).map((i) => inkImage(admin, wanted[i].key, wanted[i].prompt, true)));
  const cover_image = map.cover_image;
  const branch_images = [...map.branch_images];
  let cover = cover_image;
  (map.pending ?? []).forEach((i, k) => {
    if (i === 0) cover = done[k];
    else branch_images[i - 1] = done[k];
  });
  return { ...map, cover_image: cover, branch_images, pending: [] };
}
