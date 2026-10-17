// Aula pronta da semana (plano Professor): um audiobook + um mapa da biblioteca
// sobre o mesmo tema + roteiro curto. A folha e o link da turma usam o que já existe.
export type Aula = {
  id: string;
  semana: string;
  titulo: string;
  nivel: string;
  audiobook: string; // id em lib/audiobooks
  mapa: string; // slug em library_maps
  roteiro: string[];
};

export const AULAS: Aula[] = [
  {
    id: "s1-viagem",
    semana: "Semana 1",
    titulo: "Primeira viagem: do aeroporto à cidade",
    nivel: "A2",
    audiobook: "nyc-a2",
    mapa: "a2-10",
    roteiro: [
      "Aquecimento (5 min): pergunte quem já viajou de avião e o que foi mais difícil.",
      "Audiobook (10 min): toque “Ana's First Day in New York” sem tradução; depois de novo com tradução.",
      "Mapa “No aeroporto” (15 min): ouça as frases, a turma repete em voz alta.",
      "Atividade impressa (15 min): exercícios e revisão; corrija com o gabarito.",
      "Para casa: mande o link da turma para ouvirem a história de novo.",
    ],
  },
];
