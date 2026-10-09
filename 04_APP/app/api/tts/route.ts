// Gera o áudio de uma frase em inglês via ElevenLabs.
// GET /api/tts?text=I%20am  →  audio/mpeg
// Cada frase é gerada UMA vez na ElevenLabs e guardada no Storage; as próximas
// vezes (de qualquer pessoa) saem do Storage, sem custo.
import { createHash } from "node:crypto";
import { createSupabaseAdmin, getCurrentUser } from "@/lib/supa/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const text = new URL(req.url).searchParams.get("text")?.trim().slice(0, 300);
  if (!text) return new Response("Parâmetro text obrigatório", { status: 400 });
  if (!(await getCurrentUser())) return new Response("Faça login para ouvir o áudio.", { status: 401 });

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY?.trim();
  const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
    return new Response("ElevenLabs não configurado", { status: 500 });
  }

  const admin = createSupabaseAdmin();
  const key = createHash("sha1").update(`${ELEVENLABS_VOICE_ID}|${text}`).digest("hex");
  const path = `audio/${key}.mp3`;
  const publicUrl = admin.storage.from("map-images").getPublicUrl(path).data.publicUrl;
  const cached = await fetch(publicUrl, { method: "HEAD" }).catch(() => null);
  if (cached?.ok) return Response.redirect(publicUrl, 302);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );
  if (!res.ok) {
    // Mostra o motivo que a ElevenLabs devolveu (voz inválida, plano, créditos...).
    const detail = await res.text();
    console.error(`ElevenLabs falhou (${res.status}):`, detail);
    return new Response(`ElevenLabs falhou (${res.status}): ${detail}`, { status: 502 });
  }

  const audio = Buffer.from(await res.arrayBuffer());
  const { error } = await admin.storage
    .from("map-images")
    .upload(path, audio, { contentType: "audio/mpeg", upsert: true });
  if (error) console.error("Falha ao guardar áudio:", error.message);

  return new Response(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
