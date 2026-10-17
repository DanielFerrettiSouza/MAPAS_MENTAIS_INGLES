// Audiobooks dos assinantes: histórias curtas com áudio de nativo frase a frase.
// Cada um é escrito e narrado uma vez (lib/audiobooks/*.json + áudio no Storage).
import nycA2 from "./audiobooks/nyc-a2.json";

export type Audiobook = {
  id: string;
  title_en: string;
  title_pt: string;
  level: string;
  summary_pt: string;
  audio: string; // história inteira num áudio só
  sentences: { en: string; pt: string; t: number }[]; // t = segundo em que a frase começa
};

export const AUDIOBOOKS: Audiobook[] = [{ id: "nyc-a2", ...nycA2 }];

// Quem assina qualquer plano pago ouve os audiobooks.
export const canUseAudiobooks = (plan?: string | null) => plan === "essencial" || plan === "fluente" || plan === "professor";
