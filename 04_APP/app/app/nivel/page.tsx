import LevelTest from "@/components/LevelTest";

export const metadata = { title: "Teste de nível · Mapas Falantes" };

export default function LevelTestPage() {
  return (
    <>
      <h1 className="app-hello">Teste de <span className="grad-text">nível</span></h1>
      <p className="app-sub">12 perguntas rápidas, umas 3 minutos. Responda sem consultar: se não souber, toque em “Não sei”.</p>
      <div style={{ height: 16 }} />
      <LevelTest />
    </>
  );
}
