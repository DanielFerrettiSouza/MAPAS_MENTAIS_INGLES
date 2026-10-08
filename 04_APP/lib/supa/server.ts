import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options?: CookieOptions };
import { createClient } from "@supabase/supabase-js";

export function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// Cliente com a sessão do usuário logado (lê/grava os cookies de login).
export function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: CookieToSet[]) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Chamado de um Server Component: o middleware renova os cookies.
          }
        },
      },
    }
  );
}

// Cliente com poderes de administrador — só no servidor (gastar crédito, salvar mapa).
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function getCurrentUser() {
  if (!supabaseConfigured()) return null;
  const { data } = await createSupabaseServer().auth.getUser();
  return data.user;
}

export type Profile = { id: string; name: string | null; plan: string; credits: number };

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await createSupabaseServer()
    .from("profiles")
    .select("id, name, plan, credits")
    .eq("id", userId)
    .maybeSingle();
  return data;
}
