import { isAdmin } from "./admin";
import { LIBRARY_PLANS } from "./curriculum";

// Biblioteca e plano de estudos: planos Fluente e Professor (e o dono).
export function canUseLibrary(plan?: string | null, email?: string | null) {
  return LIBRARY_PLANS.includes(plan ?? "") || isAdmin(email);
}
