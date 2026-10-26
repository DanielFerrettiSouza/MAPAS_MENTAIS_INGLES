// Gera a versão em espanhol dos mapas da biblioteca (fase 1 do projeto em espanhol).
// Uso: node scripts/translate-es.mjs a1-01 a2-10 ...  → grava em data/es/<slug>.json (revisão antes de ir ao banco).
// O inglês fica igual (os áudios são reaproveitados); só os campos de apoio mudam para espanhol.
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const anthropic = new Anthropic();

const SYSTEM = `Você adapta mapas mentais de inglês, feitos para brasileiros, para falantes de espanhol (América Latina e Espanha).
Recebe o JSON de um mapa e devolve SOMENTE o JSON adaptado, com exatamente as mesmas chaves e a mesma estrutura.
Regras:
- Os campos terminados em _pt e o campo "pt" passam a conter texto em ESPANHOL neutro (entendido no México, Colômbia, Argentina e Espanha; evite regionalismos e voseo). Não renomeie as chaves.
- NÃO altere nada em inglês: "en", "label_en", "title_en", frases dos exercícios ("sentence"), respostas ("answer"), opções do quiz em inglês, prompts e chaves de ilustração, emojis, nível.
- "common_mistake": troque por um erro REAL e frequente de hispanofalantes nesse tema (wrong/right em inglês, why_pt em espanhol, até 12 palavras). Se o erro original também for típico de hispanofalantes, pode mantê-lo.
- Quiz: traduza question_pt. Se a pergunta depender do português (ex.: comparar com som de letra em português), reescreva para fazer sentido em espanhol, mantendo a alternativa correta no mesmo índice.
- "hint_pt" dos exercícios: dica curta em espanhol entre parênteses.
- Tratamento: nos textos que falam com o aluno (title_pt, summary_pt, tip_pt, why_pt, question_pt, hint_pt, label_pt) use SEMPRE "tú" (Aprende, tu nombre, Ojo). Nas traduções das frases ("pt"), use o tratamento que a situação pede (usted com atendente/desconhecido formal, tú com amigo), igual ao tom do inglês.
- Traduções naturais, como um professor nativo de espanhol escreveria.`;

// Garante que só os campos de apoio mudaram: inglês, respostas, estrutura e índices iguais ao original.
function check(orig, es) {
  const errs = [];
  const same = (a, b, where) => { if (JSON.stringify(a) !== JSON.stringify(b)) errs.push(where); };
  same(orig.title_en, es.title_en, "title_en");
  same(orig.branches.length, es.branches.length, "branches");
  orig.branches.forEach((b, i) => {
    const e = es.branches[i] || { items: [] };
    same(b.label_en, e.label_en, `branch ${i} label_en`);
    same(b.items.map((x) => x.en), e.items.map((x) => x.en), `branch ${i} items en`);
    if (e.items.some((x) => !x.pt)) errs.push(`branch ${i} pt vazio`);
  });
  same(orig.exercises.map((x) => [x.sentence, x.answer]), es.exercises.map((x) => [x.sentence, x.answer]), "exercises");
  // Quiz não tem áudio: as alternativas podem ser adaptadas, mas a quantidade e a resposta certa ficam iguais.
  same(orig.quiz.map((q) => [q.options.length, q.answer_index]), es.quiz.map((q) => [q.options.length, q.answer_index]), "quiz");
  return errs;
}

const outDir = path.join(process.cwd(), "data/es");
fs.mkdirSync(outDir, { recursive: true });

let slugs = process.argv.slice(2);
if (slugs[0] === "--all") {
  const { data } = await supa.from("library_maps").select("slug").order("slug");
  slugs = data.map((r) => r.slug).filter((s) => !fs.existsSync(path.join(outDir, `${s}.json`)) || process.argv.includes("--redo"));
}
for (const slug of slugs) {
  const { data: row, error } = await supa.from("library_maps").select("slug, level, topic, title_pt, data").eq("slug", slug).single();
  if (error) { console.error(slug, error.message); continue; }
  let json, errs = ["sem resposta"];
  for (let tentativa = 0; tentativa < 3 && errs.length; tentativa++) {
  const res = await anthropic.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    system: SYSTEM,
    messages: [{ role: "user", content: `Tema (português): ${row.topic}\nNível: ${row.level}\n\nJSON:\n${JSON.stringify(row.data)}` }],
  });
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try { json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)); errs = check(row.data, json); }
  catch { errs = ["JSON inválido"]; }
  }
  if (errs.length) { console.error("REJEITADO", slug, errs.join("; ")); continue; }
  fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify({ slug, level: row.level, data_es: json }, null, 1));
  console.log("ok", slug, json.title_pt);
}
