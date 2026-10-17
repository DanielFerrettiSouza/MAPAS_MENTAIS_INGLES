// Publica no app os posts orgânicos diários (09_POSTS_ORGANICOS/<data>_<tema>/slideN.jpg).
// Sobe os slides (sem o último, que é o CTA do Instagram) para o Storage em posts/<pasta>/
// e atualiza posts/index.json, que a página /app/mapa-do-dia lê.
// Uso: node scripts/sync-posts.mjs   (lê as chaves do .env.local)
import { readFileSync, readdirSync, existsSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const APP = new URL("..", import.meta.url).pathname;
for (const line of readFileSync(join(APP, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^(\w+)="?(.*?)"?$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const POSTS = join(APP, "..", "09_POSTS_ORGANICOS");
const store = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY).storage.from("map-images");

// "# 20261017-1 — tipo a (X ou Y?): SAY ou TELL?" → "SAY ou TELL?"
function titleOf(folder, dir) {
  let t = readFileSync(join(folder, "roteiro.md"), "utf8").split("\n")[0].replace(/^#\s*/, "");
  t = t.slice(t.indexOf(" — ") + 3);
  if (t.includes("): ")) t = t.slice(t.indexOf("): ") + 3);
  t = t.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return t || dir.slice(11).replace(/-/g, " ");
}

const { data: cur } = await store.download("posts/index.json");
const index = cur ? JSON.parse(await cur.text()) : [];
for (const p of index) if (existsSync(join(POSTS, p.id, "roteiro.md"))) p.title = titleOf(join(POSTS, p.id), p.id);
const done = new Set(index.map((p) => p.id));
const tmp = mkdtempSync(join(tmpdir(), "posts-"));

for (const dir of readdirSync(POSTS).filter((d) => /^\d{4}-\d{2}-\d{2}_/.test(d)).sort()) {
  const folder = join(POSTS, dir);
  if (done.has(dir) || !existsSync(join(folder, "roteiro.md"))) continue;
  const slides = readdirSync(folder).filter((f) => /^slide\d+\.jpe?g$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)));
  if (slides.length < 3) continue;
  const title = titleOf(folder, dir);
  const urls = [];
  for (const s of slides.slice(0, -1)) {
    const out = join(tmp, `${dir}-${s}`);
    execFileSync("sips", ["-Z", "1080", "-s", "format", "jpeg", "-s", "formatOptions", "80", join(folder, s), "--out", out], { stdio: "ignore" });
    const path = `posts/${dir}/${s.replace(/\.jpeg$/, ".jpg")}`;
    const { error } = await store.upload(path, readFileSync(out), { contentType: "image/jpeg", upsert: true });
    if (error) throw new Error(`${path}: ${error.message}`);
    urls.push(store.getPublicUrl(path).data.publicUrl);
  }
  index.push({ id: dir, date: dir.slice(0, 10), title, slides: urls });
  console.log("publicado:", dir, `(${urls.length} slides)`, title);
}
index.sort((a, b) => b.id.localeCompare(a.id));
await store.upload("posts/index.json", JSON.stringify(index, null, 2), { contentType: "application/json", upsert: true, cacheControl: "60" });
console.log("total no app:", index.length);
