import { isAdmin } from "./admin";
import { CURRICULUM, LIBRARY_PLANS } from "./curriculum";

type UserLike = { email?: string | null; app_metadata?: Record<string, unknown> } | null | undefined;

// Biblioteca e plano de estudos: planos Fluente e Professor, quem comprou a
// biblioteca vitalícia (app_metadata.library, gravado pelo webhook) e o dono.
export function canUseLibrary(plan?: string | null, user?: UserLike) {
  return LIBRARY_PLANS.includes(plan ?? "") || user?.app_metadata?.library === true || isAdmin(user?.email);
}

// Amostra grátis: os 3 primeiros mapas do A1 ficam abertos para todos.
export const FREE_LIBRARY_SLUGS = CURRICULUM.filter((t) => t.level === "A1").slice(0, 3).map((t) => t.slug);
