// Depoimentos reais de pessoas que testaram o método (com autorização do dono).
const ITEMS = [
  {
    name: "Lucas",
    text: "Mano, aquele bônus dos mapas com IA salvou minha vida. Pedi um mapa focado na minha entrevista de emprego pra área de TI e treinei o áudio ontem à noite...",
  },
  {
    name: "João",
    text: "Excelente material. Eu tinha muita dificuldade com verbos, mas ver tudo organizado no mapa mental clareou muito a mente. Recomendo.",
  },
];

export default function Testimonials() {
  return (
    <div className="tm-grid">
      {ITEMS.map((t) => (
        <figure key={t.name} className="tm-card">
          <div className="tm-stars" aria-label="5 estrelas">★★★★★</div>
          <blockquote>“{t.text}”</blockquote>
          <figcaption>
            <span className="tm-avatar">{t.name[0]}</span>
            <span><b>{t.name}</b><small>Testou o Método</small></span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
