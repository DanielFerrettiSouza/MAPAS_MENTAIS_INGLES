import Link from "next/link";
import ListenButton from "@/components/ListenButton";
import MindMapView from "@/components/MindMapView";
import type { MapWithImages } from "@/lib/mapSchema";
import sample from "@/data/es/a2-10.json";
import LevelExplorer from "@/components/LevelExplorer";
import { headers } from "next/headers";
import { BONUS } from "@/lib/bonus";
import { esPriceLabel, esCountry } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata = { title: "Método Mapas Parlantes — aprende inglés del A1 al C2" };

// Página de venta en español (anuncios de América Latina y España). Compra por Stripe (/api/stripe/checkout).

const STACK = [
  "🧭 Test de nivel + plan de estudio según tu objetivo",
  "📚 120 mapas mentales listos, del A1 al C2",
  "🔊 Audio nativo en todas las frases",
  "✏️ Ejercicio y repaso en cada mapa",
  "🎁 Bono #1 · 500 frases más usadas con audio",
  "🎁 Bono #2 · 100 verbos esenciales con audio",
  "🎁 Bono #3 · 150 expresiones y jerga con audio",
  "✨ Bono #4 · 3 mapas a tu medida con IA, sobre el tema que quieras",
];

const BONUS_CARDS = [
  { n: 1, key: "frases", ico: "💬", title: "500 frases más usadas", text: "Organizadas por situación: viaje, trabajo, restaurante, conversación. Toca y escucha cada una." },
  { n: 2, key: "verbos", ico: "⚡", title: "100 verbos esenciales", text: "Los verbos que aparecen en toda conversación, con ejemplo y audio." },
  { n: 3, key: "expressoes", ico: "😎", title: "150 expresiones y jerga", text: "Cómo hablan de verdad los nativos en las series y en la calle, explicado en español." },
] as const;

const SAMPLE_PHRASES = ["Here is my passport.", "I have one bag to check.", "I'd like a window seat.", "Is this carry-on okay?"];

function Cta({ big, price, checkout }: { big?: boolean; price?: string; checkout?: string }) {
  return (
    <div className="mt-cta">
      <a href={big ? checkout : "#oferta"} className="primary-btn grad-btn" style={big ? { fontSize: 19, padding: "18px 34px" } : undefined}>
        {big ? `Quiero el Método por ${price} →` : "Quiero el Método →"}
      </a>
      <span className="fine">🔒 Pago único · acceso de por vida · 7 días de garantía</span>
    </div>
  );
}

export default function MetodoEsPage({ searchParams }: { searchParams: { pais?: string } }) {
  const country = esCountry(searchParams.pais, headers().get("x-vercel-ip-country"));
  const PRICE = esPriceLabel(country);
  const CHECKOUT = `/api/stripe/checkout${country ? `?pais=${country.toLowerCase()}` : ""}`;
  return (
    <>
      <header className="site-nav"><div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
        <strong>🔊 Mapas Parlantes</strong>
        <a href="#oferta" className="primary-btn grad-btn" style={{ padding: "8px 16px" }}>Quiero el Método</a>
      </div></header>
      <main>
        <section className="wrap hero">
          <div>
            <span className="eyebrow">MÉTODO MAPAS FALANTES · DEL A1 AL C2</span>
            <h1>120 mapas mentales de inglés <span className="grad-text">que hablan.</span></h1>
            <p className="lead">
              Toca cualquier frase y escucha la pronunciación de un nativo. Un test de nivel te dice por dónde empezar
              y tu plan de estudio te guía semana a semana, con ejercicio y repaso en cada mapa.
            </p>
            <ul className="metodo-list">
              <li>🧭 Test de nivel, plan de estudio y seguimiento del progreso</li>
              <li>📚 120 mapas listos del A1 al C2, con audio nativo y ejercicios</li>
              <li>🎁 Bonos: 500 frases, 100 verbos y 150 expresiones con audio</li>
              <li>✨ 3 mapas con IA incluidos, sobre el tema que quieras</li>
            </ul>
            <Cta />
          </div>
        </section>

        <section className="section">
          <div className="wrap" style={{ textAlign: "center" }}>
            <span className="eyebrow">🔊 Dale play</span>
            <h2 className="big-title">Un mapa que <span className="grad-text">te habla.</span></h2>
            <p className="mt-sub">Este es el mapa “En el aeropuerto”, nivel A2. Toca el botón y escucha la pronunciación de un nativo.</p>
            <ListenButton phrases={SAMPLE_PHRASES} label="Toca para escuchar" />
            <div style={{ textAlign: "left", marginTop: 28 }}>
              <MindMapView map={sample.data_es as unknown as MapWithImages} preview lang="es" />
            </div>
            <p className="fine" style={{ marginTop: 12 }}>👆 Este es un mapa real del método: toca ▶ en cualquier frase y haz el mini ejercicio.</p>
            <Cta />
          </div>
        </section>

        <section className="section">
          <div className="wrap" style={{ textAlign: "center" }}>
            <span className="eyebrow">Organización del método</span>
            <h2 className="big-title">120 mapas, de cero a <span className="grad-text">avanzado.</span></h2>
            <p className="mt-sub">Divididos por los niveles oficiales (A1 a C2). Empiezas en tu nivel y subes a tu ritmo.</p>
            <LevelExplorer lang="es" />
            <Cta />
          </div>
        </section>

        <section className="section mt-bonus">
          <div className="wrap" style={{ textAlign: "center" }}>
            <span className="eyebrow">Bonos incluidos</span>
            <h2 className="big-title">También te llevas <span className="grad-text">4 bonos.</span></h2>
            <p className="mt-sub">Todo con audio nativo y liberado junto con el método, en el mismo acceso.</p>
            <div className="mt-bonus-grid">
              {BONUS_CARDS.map((b) => (
                <div key={b.key} className="mt-bonus-card">
                  <span className="mt-bonus-tag">BONO #{b.n}</span>
                  <div className="mt-bonus-ico">{b.ico}</div>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                  <ul>{BONUS[b.key].sections[0].items.slice(0, 3).map((i) => <li key={i.en}><b>{i.en}</b></li>)}</ul>
                  <span className="mt-incl">✓ INCLUIDO</span>
                </div>
              ))}
              <div className="mt-bonus-card">
                <span className="mt-bonus-tag">BONO #4</span>
                <div className="mt-bonus-ico">✨</div>
                <h3>3 mapas a tu medida con IA</h3>
                <p>Tu viaje, tu entrevista, tu serie favorita: escribe el tema y recibe un mapa organizado, con audio, en segundos.</p>
                <ul><li><b>“Entrevista de trabajo en TI”</b></li><li><b>“Viaje a Orlando con niños”</b></li><li><b>“Jerga de Friends”</b></li></ul>
                <span className="mt-incl">✓ INCLUIDO</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap" style={{ textAlign: "center" }}>
            <span className="eyebrow">Para quién es</span>
            <h2 className="big-title">Hecho para quien quiere <span className="grad-text">hablar.</span></h2>
            <div className="mt-who">
              <div><span>🌱</span><h3>Empiezas desde cero</h3><p>Un camino listo, desde el A1, con traducción en todo. Sin memorizar reglas.</p></div>
              <div><span>⏰</span><h3>Tienes poco tiempo</h3><p>Un mapa toma 5 minutos. Puedes estudiar en el bus, en la fila, en el descanso.</p></div>
              <div><span>🗣️</span><h3>Te trabas al hablar</h3><p>Escuchas cada frase, la repites en voz alta y entrenas la pronunciación correcta.</p></div>
            </div>
          </div>
        </section>

        <section className="section" id="oferta">
          <div className="wrap">
            <div className="mt-offer">
              <span className="eyebrow">Todo lo que recibes</span>
              <ul>{STACK.map((s) => <li key={s}>{s}</li>)}</ul>
              <div className="mt-price">
                <em className="mt-inst">{PRICE}</em>
                <span className="mt-or">pago único</span>
                <span>acceso de por vida</span>
              </div>
              <a href={CHECKOUT} className="primary-btn grad-btn" style={{ width: "100%", textAlign: "center", display: "block", fontSize: 19, padding: "18px 20px" }}>Quiero el Método por {PRICE} →</a>
              <p className="guarantee-note">🔒 Pago seguro con Stripe · tarjeta</p>
            </div>
            <div className="mt-guarantee">
              <span>🛡️</span>
              <div>
                <h3>Garantía incondicional de 7 días</h3>
                <p>Entra, estudia, escucha los mapas. Si no es para ti, pide el reembolso en hasta 7 días y te devolvemos el 100%. Sin preguntas.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap" style={{ textAlign: "center" }}>
            <span className="eyebrow">Entrega inmediata</span>
            <h2 className="big-title">Cómo lo recibes</h2>
            <div className="mt-who">
              <div><span>1</span><h3>Pago aprobado</h3><p>Con tarjeta, en segundos.</p></div>
              <div><span>2</span><h3>Crea tu cuenta</h3><p>Usa el mismo correo de la compra. Todo aparece liberado.</p></div>
              <div><span>3</span><h3>Estudia donde quieras</h3><p>Celular, tablet o computadora. Descarga los mapas en imagen para imprimir.</p></div>
            </div>
          </div>
        </section>

        <section className="section faq">
          <div className="wrap" style={{ maxWidth: 820 }}>
            <h2 className="big-title">Preguntas frecuentes</h2>
            <details><summary>¿Es una suscripción? ¿Hay mensualidad?</summary><p>No. Pagas una sola vez y tienes acceso para siempre al método, a los mapas y a los bonos.</p></details>
            <details><summary>¿En qué moneda pago?</summary><p>En México, Colombia, Chile, Perú y España pagas en tu moneda local, con el mismo valor que ves en esta página. En otros países, en dólares.</p></details>
            <details><summary>¿Necesito saber inglés para empezar?</summary><p>No. El método empieza en el A1 y todo mapa tiene traducción al español.</p></details>
            <details><summary>¿El audio es real?</summary><p>Sí. Cada frase tiene un botón que reproduce la pronunciación de un nativo estadounidense.</p></details>
            <details><summary>¿Puedo estudiar desde el celular?</summary><p>Sí. Funciona en celular, tablet y computadora, y puedes descargar los mapas en imagen.</p></details>
            <details><summary>¿Cómo recibo el acceso?</summary><p>Después del pago, crea tu cuenta con el mismo correo de la compra. Todo aparece liberado.</p></details>
            <details><summary>¿Y si no me gusta?</summary><p>Tienes 7 días de garantía. Pide el reembolso dentro del plazo y te devolvemos el 100%.</p></details>
            <details><summary>¿Reemplaza un curso de inglés?</summary><p>Es un método de estudio y repaso para usar todos los días. No promete fluidez mágica: funciona para quien practica un poco cada día.</p></details>
          </div>
        </section>

        <section className="final-cta">
          <div className="wrap">
            <h2 className="big-title">Empieza hoy. <span className="grad-text">5 minutos al día.</span></h2>
            <ul className="mt-final-list">{STACK.map((s) => <li key={s}>{s}</li>)}</ul>
            <Cta big price={PRICE} checkout={CHECKOUT} />
          </div>
        </section>
      </main>
      <footer className="site-footer">© {new Date().getFullYear()} Mapas Parlantes · <Link href="/es/privacidad">Privacidad</Link> · <Link href="/es/terminos">Términos</Link></footer>
    </>
  );
}
