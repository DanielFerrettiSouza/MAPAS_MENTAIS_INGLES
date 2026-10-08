// Gera o áudio de uma frase em inglês via ElevenLabs.
// GET /api/tts?text=I%20am  →  audio/mpeg
// No protótipo o áudio é gerado sob demanda e fica em cache no navegador/CDN;
// em produção, salvar no Supabase Storage para não pagar a mesma frase duas vezes.
import { getCurrentUser } from "@/lib/supa/server";

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

  return new Response(res.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
