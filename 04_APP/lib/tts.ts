import { createHash } from "node:crypto";
import { createSupabaseAdmin } from "./supa/server";

type Admin = ReturnType<typeof createSupabaseAdmin>;

// Cada frase é gerada UMA vez na ElevenLabs e guardada no Storage; as próximas
// vezes (de qualquer pessoa) saem do Storage, sem custo.
export function audioUrl(admin: Admin, text: string) {
  const voice = process.env.ELEVENLABS_VOICE_ID?.trim() ?? "";
  const path = `audio/${createHash("sha1").update(`${voice}|${text}`).digest("hex")}.mp3`;
  return { path, url: admin.storage.from("map-images").getPublicUrl(path).data.publicUrl };
}

export async function isCached(admin: Admin, text: string) {
  const res = await fetch(audioUrl(admin, text).url, { method: "HEAD" }).catch(() => null);
  return !!res?.ok;
}

// Gera o áudio na ElevenLabs e guarda. Devolve o mp3 ou lança o erro da ElevenLabs.
export async function generateAudio(admin: Admin, text: string) {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  const voice = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (!key || !voice) throw new Error("ElevenLabs não configurado");
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  });
  if (!res.ok) throw new Error(`ElevenLabs falhou (${res.status}): ${await res.text()}`);
  const audio = Buffer.from(await res.arrayBuffer());
  const { error } = await admin.storage.from("map-images").upload(audioUrl(admin, text).path, audio, { contentType: "audio/mpeg", upsert: true });
  if (error) console.error("Falha ao guardar áudio:", error.message);
  return audio;
}

// Deixa o áudio de várias frases pronto (para tocar sem login, ex.: link da turma).
export async function warmAudio(admin: Admin, texts: string[]) {
  for (const t of Array.from(new Set(texts))) {
    if (!(await isCached(admin, t))) await generateAudio(admin, t);
  }
}
