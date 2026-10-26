import LevelTest from "@/components/LevelTest";
import { getCurrentUser } from "@/lib/supa/server";
import { getLang, tr } from "@/lib/lang";

export const metadata = { title: "Teste de nível · Mapas Falantes" };

export default async function LevelTestPage() {
  const lang = getLang(await getCurrentUser());
  return (
    <>
      <h1 className="app-hello">{tr(lang, "Teste de", "Test de")} <span className="grad-text">{tr(lang, "nível", "nivel")}</span></h1>
      <p className="app-sub">{tr(lang, "12 perguntas rápidas, umas 3 minutos. Responda sem consultar: se não souber, toque em “Não sei”.", "12 preguntas rápidas, unos 3 minutos. Responde sin consultar: si no sabes, toca “No sé”.")}</p>
      <div style={{ height: 16 }} />
      <LevelTest lang={lang} />
    </>
  );
}
