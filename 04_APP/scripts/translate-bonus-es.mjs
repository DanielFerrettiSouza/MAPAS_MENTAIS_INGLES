// Traduz os bônus (frases, verbos, expressões) para espanhol: só title, theme, pt e ex_pt.
// O inglês fica igual (os áudios são reaproveitados). Grava em data/es/bonus/<nome>.json.
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();
const SYSTEM = `Você traduz material de estudo de inglês feito para brasileiros para falantes de espanhol (América Latina e Espanha).
Recebe um JSON e devolve SOMENTE o JSON com a mesma estrutura, mesmas chaves e mesma ordem.
- Traduza para espanhol neutro (sem regionalismos nem voseo) apenas os campos "title", "theme", "pt" e "ex_pt".
- NÃO altere "en" nem "ex_en". Campos vazios continuam vazios.
- Nas gírias e expressões, dê o equivalente natural em espanhol, não a tradução literal.`;

const outDir = path.join(process.cwd(), "data/es/bonus");
fs.mkdirSync(outDir, { recursive: true });

for (const name of ["verbos", "expressoes", "frases"]) {
  const src = JSON.parse(fs.readFileSync(`lib/bonus/${name}.json`, "utf8"));
  const out = { ...src, sections: [] };
  // Uma seção por chamada: respostas menores e mais seguras.
  for (const sec of src.sections) {
    let done = null;
    for (let t = 0; t < 3 && !done; t++) {
      const res = await anthropic.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 16000,
        output_config: { effort: "low" },
        system: SYSTEM,
        messages: [{ role: "user", content: JSON.stringify(sec) }],
      });
      const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
      try {
        const j = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
        const ok = j.items?.length === sec.items.length && j.items.every((it, i) => it.en === sec.items[i].en && it.ex_en === sec.items[i].ex_en && it.pt);
        if (ok) done = j;
      } catch {}
    }
    if (!done) throw new Error(`falhou: ${name} / ${sec.theme}`);
    out.sections.push(done);
    console.log("ok", name, done.theme);
  }
  if (out.title) {
    const r = await anthropic.messages.create({ model: "claude-opus-5-5", max_tokens: 200, output_config: { effort: "low" }, messages: [{ role: "user", content: `Traduza para espanhol neutro, responda só a tradução: ${src.title}` }] });
    out.title = r.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  }
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(out, null, 1));
}
