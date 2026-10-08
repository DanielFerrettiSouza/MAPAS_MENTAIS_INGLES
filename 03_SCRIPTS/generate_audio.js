// Lê um CSV (nível, tópico, frases) e para cada frase:
// 1. gera o áudio via ElevenLabs (voz nativa britânica)
// 2. sobe o arquivo pro Supabase Storage
// 3. garante a linha em mind_maps (1 por tópico/nível) e insere a linha em mind_map_audio
//
// Uso:
//   npm install
//   cp .env.example .env   (preencher as chaves)
//   node generate_audio.js mapas_A1_exemplo.csv

import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const CSV_PATH = process.argv[2];
if (!CSV_PATH) {
  console.error("Uso: node generate_audio.js <arquivo.csv>");
  process.exit(1);
}

const {
  ELEVENLABS_API_KEY,
  ELEVENLABS_VOICE_ID,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET = "mind-map-audio",
} = process.env;

for (const [name, val] of Object.entries({
  ELEVENLABS_API_KEY,
  ELEVENLABS_VOICE_ID,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
})) {
  if (!val) {
    console.error(`Variável de ambiente faltando: ${name}. Veja .env.example.`);
    process.exit(1);
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function generateSpeech(text) {
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
    throw new Error(`ElevenLabs falhou (${res.status}): ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getOrCreateMindMap({ level, topic, order_index, map_image_filename }) {
  const { data: existing, error: selErr } = await supabase
    .from("mind_maps")
    .select("id")
    .eq("level", level)
    .eq("topic", topic)
    .eq("locale", "it")
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing.id;

  const imageUrl = map_image_filename
    ? `${SUPABASE_URL}/storage/v1/object/public/mind-map-images/${level}/${map_image_filename}`
    : null;

  const { data, error } = await supabase
    .from("mind_maps")
    .insert({
      level,
      topic,
      order_index: Number(order_index) || 0,
      image_url: imageUrl,
      locale: "it",
    })
    .select("id")
    .single();
  if (error) throw error;
  console.log(`  + criado mind_map "${topic}" (${level})`);
  return data.id;
}

async function uploadAudio(mindMapId, phraseText, position) {
  const filename = `${mindMapId}/${position}_${slugify(phraseText)}.mp3`;
  console.log(`    -> gerando áudio: "${phraseText}"`);
  const audioBuffer = await generateSpeech(phraseText);

  const { error: upErr } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(filename, audioBuffer, { contentType: "audio/mpeg", upsert: true });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(filename);

  const { error: insErr } = await supabase.from("mind_map_audio").insert({
    mind_map_id: mindMapId,
    text: phraseText,
    audio_url: pub.publicUrl,
    position: Number(position) || 0,
  });
  if (insErr) throw insErr;
}

async function main() {
  const csvContent = fs.readFileSync(path.resolve(CSV_PATH), "utf-8");
  const rows = parse(csvContent, { columns: true, skip_empty_lines: true });

  console.log(`${rows.length} linhas encontradas em ${CSV_PATH}\n`);

  const mindMapCache = new Map();

  for (const row of rows) {
    const key = `${row.level}::${row.topic}`;
    let mindMapId = mindMapCache.get(key);
    if (!mindMapId) {
      mindMapId = await getOrCreateMindMap(row);
      mindMapCache.set(key, mindMapId);
    }
    await uploadAudio(mindMapId, row.phrase_text, row.phrase_position);
  }

  console.log("\nConcluído. Áudios gerados e catalogados no Supabase.");
}

main().catch((err) => {
  console.error("\nErro:", err.message);
  process.exit(1);
});
