// Quem pode ver o painel /app/admin. Configure ADMIN_EMAILS na Vercel (separados por vírgula).
const DEFAULT = "dfsza10@gmail.com,mapasmentaisfalantes@gmail.com";

export function isAdmin(email?: string | null) {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? DEFAULT).split(",").map((e) => e.trim().toLowerCase());
  return list.includes(email.toLowerCase());
}
