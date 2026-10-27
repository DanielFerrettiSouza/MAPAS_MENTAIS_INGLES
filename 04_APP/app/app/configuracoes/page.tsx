import Link from "next/link";
import { LanguageForm, PasswordForm, ProfileForm, TeacherForm } from "@/components/SettingsForms";
import { canTeach, teacherName } from "@/lib/teacher";
import { getCurrentUser, getProfile } from "@/lib/supa/server";
import { planName } from "@/lib/plans";
import { getLang, tr } from "@/lib/lang";

export const dynamic = "force-dynamic";

export default async function Settings({ searchParams }: { searchParams: { "nova-senha"?: string } }) {
  const user = (await getCurrentUser())!;
  const profile = await getProfile(user.id);
  const meta = (user.user_metadata ?? {}) as { level?: string; goal?: string };
  const lang = getLang(user);
  const es = lang === "es";
  const usesPassword = user.app_metadata?.provider === "email";

  return (
    <>
      <h1 className="app-hello">{tr(lang, "Configurações", "Configuración")}</h1>
      <p className="app-sub">{user.email}</p>
      <div className="settings-grid">
        <ProfileForm name={profile?.name ?? ""} level={meta.level ?? "A1"} goal={meta.goal ?? ""} lang={lang} />
        <div className="settings-card">
          <h3>{tr(lang, "Seu plano", "Tu plan")}</h3>
          {es ? (<>
            <p style={{ margin: 0 }}><b>Método Mapas Parlantes</b> · acceso de por vida</p>
            <p style={{ color: "var(--muted)", margin: 0 }}>{profile?.credits ?? 0} mapas con IA restantes</p>
          </>) : (<>
          <p style={{ margin: 0 }}>Plano <b>{planName(profile?.plan ?? "free")}</b></p>
          <p style={{ color: "var(--muted)", margin: 0 }}>{profile?.credits ?? 0} mapas restantes</p>
          <Link href="/app/planos" className="primary-btn grad-btn">Trocar de plano</Link>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
            Para cancelar a assinatura, use o link do e-mail de compra da Kiwify.
          </p>
          </>)}
        </div>
        {searchParams["nova-senha"] && (
          <p className="auth-ok" style={{ margin: 0 }}>{tr(lang, "Pronto, você entrou pelo link do e-mail. Crie sua nova senha abaixo. 👇", "Listo, entraste con el enlace del correo. Crea tu nueva contraseña abajo. 👇")}</p>
        )}
        {!usesPassword && (
          <p style={{ color: "var(--muted)", margin: 0 }}>{tr(lang, "Você entra com a sua conta Google. Se quiser, pode criar uma senha também para entrar com e-mail.", "Entras con tu cuenta de Google. Si quieres, también puedes crear una contraseña para entrar con tu correo.")}</p>
        )}
        {canTeach(profile?.plan, user.email) && <TeacherForm name={teacherName(user)} />}
        <LanguageForm lang={lang} />
        <PasswordForm lang={lang} />
        <div className="settings-card">
          <h3>{tr(lang, "Sua conta", "Tu cuenta")}</h3>
          <p style={{ color: "var(--muted)", margin: 0 }}>{tr(lang, "Você está conectado como", "Estás conectado como")} <b style={{ color: "var(--text)" }}>{user.email}</b>.</p>
          <form action="/auth/sair" method="post">
            <button className="secondary-btn">{tr(lang, "Sair da conta", "Cerrar sesión")}</button>
          </form>
        </div>
      </div>
    </>
  );
}
