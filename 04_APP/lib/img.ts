// Versão reduzida (WebP, cache longo) de uma imagem do Supabase pelo otimizador do Next.
export function thumb(url: string | null | undefined, w = 384) {
  if (!url || !url.includes(".supabase.co/")) return url ?? undefined;
  return `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=70`;
}
