import { isAdmin } from "./admin";

// Recursos do plano Professor (material impresso com o nome dele).
export const canTeach = (plan?: string | null, email?: string | null) => plan === "professor" || isAdmin(email);

type UserLike = { user_metadata?: Record<string, unknown> } | null | undefined;
export const teacherName = (user: UserLike) => String(user?.user_metadata?.teacher_name ?? "");
