// Audiobooks dos assinantes: histórias curtas com áudio de nativo frase a frase.
// Cada um é escrito uma vez (texto em lib/audiobooks/*.json) e o áudio de cada
// frase sai do /api/tts, gerado uma vez e guardado para todos.
import nycA2 from "./audiobooks/nyc-a2.json";

export type Audiobook = {
  id: string;
  title_en: string;
  title_pt: string;
  level: string;
  summary_pt: string;
  sentences: { en: string; pt: string }[];
};

export const AUDIOBOOKS: Audiobook[] = [{ id: "nyc-a2", ...nycA2 }];

// Quem assina qualquer plano pago ouve os audiobooks.
export const canUseAudiobooks = (plan?: string | null) => plan === "essencial" || plan === "fluente" || plan === "professor";
