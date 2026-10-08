import Link from "next/link";
import { PasswordForm, ProfileForm } from "@/components/SettingsForms";
import { getCurrentUser, getProfile } from "@/lib/supa/server";
import { planName } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function Settings() {
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  const meta = (user.user_metadata ?? {}) as { level?: string; goal?: string };
  const usesPassword = user.app_metadata?.provider === "email";

  return (
    <>
      <h1 className="app-hello">Configurações</h1>
      <p className="app-sub">{user.email}</p>
      <div className="settings-grid">
        <ProfileForm name={profile?.name ?? ""} level={meta.level ?? "A1"} goal={meta.goal ?? ""} />
        <div className="settings-card">
          <h3>Seu plano</h3>
          <p style={{ margin: 0 }}>Plano <b>{planName(profile?.plan ?? "free")}</b></p>
          <p style={{ color: "var(--muted)", margin: 0 }}>{profile?.credits ?? 0} mapas restantes</p>
          <Link href="/app/planos" className="primary-btn grad-btn">Trocar de plano</Link>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
            Para cancelar a assinatura, use o link do e-mail de compra da Kiwify.
          </p>
        </div>
        {usesPassword ? (
          <PasswordForm />
        ) : (
          <div className="settings-card">
            <h3>Acesso</h3>
            <p style={{ color: "var(--muted)", margin: 0 }}>Você entra com a sua conta Google. Não há senha para trocar aqui.</p>
          </div>
        )}
      </div>
    </>
  );
}
