// Faixa de fotos girando (direita → esquerda) com cenas de uso do método.
// São cenas ilustrativas, não depoimentos: sem nomes nem estrelas.
const SCENES = [
  { img: "/metodo/uso-mariana.jpg", text: "🚌 5 minutos no ônibus, indo pro trabalho" },
  { img: "/metodo/uso-lucas.jpg", text: "🖨️ Baixe e imprima o mapa que quiser" },
  { img: "/metodo/uso-joao.jpg", text: "📚 Tudo organizado por tema e por nível" },
];

export default function UseScenes() {
  const row = [...SCENES, ...SCENES, ...SCENES];
  return (
    <div className="us-wrap" aria-hidden>
      <div className="us-track">
        {[...row, ...row].map((s, i) => (
          <figure key={i} className="us-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.img} alt="" loading="lazy" />
            <figcaption>{s.text}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
