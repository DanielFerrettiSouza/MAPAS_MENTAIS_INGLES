"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin, createSupabaseServer, getCurrentUser } from "@/lib/supa/server";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export type FormState = { ok?: string; error?: string };

export async function saveProfile(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Faça login de novo." };

  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const level = String(form.get("level") ?? "");
  const goal = String(form.get("goal") ?? "").trim().slice(0, 120);
  if (!name) return { error: "Informe seu nome." };

  // Nome fica no perfil (escrita só pelo servidor); nível e objetivo nos dados do usuário.
  const { error: e1 } = await createSupabaseAdmin().from("profiles").update({ name }).eq("id", user.id);
  const { error: e2 } = await createSupabaseServer().auth.updateUser({
    data: { level: LEVELS.includes(level) ? level : "A1", goal },
  });
  if (e1 || e2) return { error: "Não foi possível salvar. Tente de novo." };

  revalidatePath("/app", "layout");
  return { ok: "Salvo!" };
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (password.length < 6) return { error: "A senha precisa ter pelo menos 6 caracteres." };
  if (password !== confirm) return { error: "As senhas não conferem." };
  const { error } = await createSupabaseServer().auth.updateUser({ password });
  if (error) return { error: "Não foi possível trocar a senha. Saia e entre de novo e tente outra vez." };
  return { ok: "Senha alterada!" };
}
