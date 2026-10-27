"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin, createSupabaseServer, getCurrentUser } from "@/lib/supa/server";
import { getLang, tr } from "@/lib/lang";
import { cookies } from "next/headers";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export type FormState = { ok?: string; error?: string };

export async function saveProfile(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  const lang = getLang(user);
  if (!user) return { error: tr(lang, "Faça login de novo.", "Inicia sesión de nuevo.") };

  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const level = String(form.get("level") ?? "");
  const goal = String(form.get("goal") ?? "").trim().slice(0, 120);
  if (!name) return { error: tr(lang, "Informe seu nome.", "Escribe tu nombre.") };

  // Nome fica no perfil (escrita só pelo servidor); nível e objetivo nos dados do usuário.
  const { error: e1 } = await createSupabaseAdmin().from("profiles").update({ name }).eq("id", user.id);
  const { error: e2 } = await createSupabaseServer().auth.updateUser({
    data: { level: LEVELS.includes(level) ? level : "A1", goal },
  });
  if (e1 || e2) return { error: tr(lang, "Não foi possível salvar. Tente de novo.", "No se pudo guardar. Inténtalo de nuevo.") };

  revalidatePath("/app", "layout");
  return { ok: tr(lang, "Salvo!", "¡Guardado!") };
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const lang = getLang(await getCurrentUser());
  if (password.length < 6) return { error: tr(lang, "A senha precisa ter pelo menos 6 caracteres.", "La contraseña debe tener al menos 6 caracteres.") };
  if (password !== confirm) return { error: tr(lang, "As senhas não conferem.", "Las contraseñas no coinciden.") };
  const { error } = await createSupabaseServer().auth.updateUser({ password });
  if (error) return { error: tr(lang, "Não foi possível trocar a senha. Saia e entre de novo e tente outra vez.", "No se pudo cambiar la contraseña. Sal, entra de nuevo e inténtalo otra vez.") };
  return { ok: tr(lang, "Senha alterada!", "¡Contraseña cambiada!") };
}

// Idioma do app: fica gravado na conta (vale em qualquer aparelho) e no cookie.
export async function setLanguage(lang: "pt" | "es") {
  const user = await getCurrentUser();
  if (!user || (lang !== "pt" && lang !== "es")) return;
  await createSupabaseServer().auth.updateUser({ data: { lang } });
  cookies().set("mf-lang", lang, { path: "/", maxAge: 31536000, sameSite: "lax" });
  revalidatePath("/app", "layout");
}

// Nome que sai no topo do material impresso (plano Professor).
export async function saveTeacherName(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  const lang = getLang(user);
  if (!user) return { error: tr(lang, "Faça login de novo.", "Inicia sesión de nuevo.") };
  const teacher_name = String(form.get("teacher_name") ?? "").trim().slice(0, 80);
  const { error } = await createSupabaseServer().auth.updateUser({ data: { teacher_name } });
  if (error) return { error: tr(lang, "Não foi possível salvar. Tente de novo.", "No se pudo guardar. Inténtalo de nuevo.") };
  return { ok: "Salvo! Seu nome vai sair no material impresso." };
}
