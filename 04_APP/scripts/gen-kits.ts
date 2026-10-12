// Gera os mapas dos kits temáticos (uma vez). Rodar: npx tsx --env-file=.env.local scripts/gen-kits.ts
import { createClient } from "@supabase/supabase-js";
import { buildMap } from "../lib/buildMap";
import { KITS, kitSlug } from "../lib/kits";

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

async function main() {
  const { data: done } = await admin.from("library_maps").select("slug").like("slug", "kit-%");
  const have = new Set((done ?? []).map((d) => d.slug));
  const jobs = KITS.flatMap((k) => k.topics.map(([topic, level], i) => ({ slug: kitSlug(k.id, i), topic, level }))).filter((j) => !have.has(j.slug));
  console.log(`faltam ${jobs.length}`);
  const run = async () => {
    for (let j = jobs.shift(); j; j = jobs.shift()) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map = await buildMap(admin as any, { topic: j.topic, level: j.level, illustrate: true, imagePath: `library/${j.slug}` });
        const { error } = await admin.from("library_maps").upsert({ slug: j.slug, level: j.level, topic: j.topic, title_pt: map.title_pt, data: map });
        console.log(error ? `ERRO ${j.slug}: ${error.message}` : `ok ${j.slug} ${j.topic}`);
      } catch (e) {
        console.log(`ERRO ${j.slug}: ${e instanceof Error ? e.message : e}`);
      }
    }
  };
  await Promise.all([run(), run(), run()]);
}
main();
