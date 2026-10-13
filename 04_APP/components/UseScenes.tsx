// Fotos de cenas de uso do método (estáticas, para a página ficar leve).
// São cenas ilustrativas, não depoimentos: sem nomes nem estrelas.
const SCENES = [
  { img: "/metodo/uso-mariana.jpg", text: "🚌 5 minutos no ônibus, indo pro trabalho" },
  { img: "/metodo/uso-lucas.jpg", text: "🖨️ Baixe e imprima o mapa que quiser" },
  { img: "/metodo/uso-joao.jpg", text: "📚 Tudo organizado por tema e por nível" },
];

export default function UseScenes() {
  return (
    <div className="us-wrap">
      <div className="us-track">
        {SCENES.map((s, i) => (
          <figure key={i} className="us-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.img} alt="" width={440} height={800} loading="lazy" decoding="async" />
            <figcaption>{s.text}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
