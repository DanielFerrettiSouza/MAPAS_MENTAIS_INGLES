// Gera o áudio de uma frase em inglês via ElevenLabs.
// GET /api/tts?text=I%20am  →  audio/mpeg
import { createSupabaseAdmin, getCurrentUser } from "@/lib/supa/server";
import { QUIZ_PHRASES } from "@/lib/quizFunnel";
import { SAMPLE_MAP_SLUG } from "@/lib/library";
import { audioUrl, generateAudio, isCached } from "@/lib/tts";

export const runtime = "nodejs";

// Frases do mapa de amostra da página /metodo também tocam sem login.
async function inSampleMap(admin: ReturnType<typeof createSupabaseAdmin>, text: string) {
  const { data } = await admin.from("library_maps").select("data").eq("slug", SAMPLE_MAP_SLUG).maybeSingle();
  return !!data && JSON.stringify(data.data).includes(JSON.stringify(text).slice(1, -1));
}

export async function GET(req: Request) {
  const text = new URL(req.url).searchParams.get("text")?.trim().slice(0, 300);
  if (!text) return new Response("Parâmetro text obrigatório", { status: 400 });

  const admin = createSupabaseAdmin();
  // Áudio já guardado toca para qualquer um (mapa de amostra, link da turma).
  if (await isCached(admin, text)) return Response.redirect(audioUrl(admin, text).url, 302);
  // Gerar áudio novo exige login, exceto as frases do quiz.
  if (!QUIZ_PHRASES.has(text) && !(await getCurrentUser()) && !(await inSampleMap(admin, text))) {
    return new Response("Faça login para ouvir o áudio.", { status: 401 });
  }

  try {
    const audio = await generateAudio(admin, text);
    return new Response(audio, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=31536000, immutable" } });
  } catch (e) {
    console.error(String(e));
    return new Response(String(e instanceof Error ? e.message : e), { status: 502 });
  }
}
