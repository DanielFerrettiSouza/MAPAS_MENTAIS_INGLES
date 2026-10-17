"use server";

import { createSupabaseAdmin, createSupabaseServer, getCurrentUser, getProfile } from "@/lib/supa/server";
import { canTeach } from "@/lib/teacher";
import { classLinkPath } from "@/lib/share";
import { warmAudio } from "@/lib/tts";
import type { MapWithImages } from "@/lib/mapSchema";

// Cria o link da turma e deixa o áudio do mapa pronto para tocar sem login.
export async function createClassLink(tipo: "meu" | "biblioteca" | "audiobook", id: string): Promise<{ path?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Faça login de novo." };
  if (!canTeach((await getProfile(user.id))?.plan, user.email)) return { error: "O link da turma faz parte do plano Professor." };
  if (tipo !== "audiobook") {
    const { data } = tipo === "meu"
      ? await createSupabaseServer().from("generated_maps").select("data").eq("id", id).maybeSingle()
      : await createSupabaseAdmin().from("library_maps").select("data").eq("slug", id).maybeSingle();
    const map = data?.data as MapWithImages | undefined;
    if (!map) return { error: "Mapa não encontrado." };
    try {
      await warmAudio(createSupabaseAdmin(), [...map.branches.flatMap((b) => b.items.map((i) => i.en)), map.common_mistake.right]);
    } catch {
      return { error: "Não foi possível preparar o áudio agora. Tente de novo em instantes." };
    }
  }
  return { path: classLinkPath(tipo, id) };
}
