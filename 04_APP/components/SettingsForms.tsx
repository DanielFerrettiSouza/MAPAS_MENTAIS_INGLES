"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveTeacherName, changePassword, saveProfile, type FormState } from "@/app/app/configuracoes/actions";

const LEVELS = [
  ["A1", "A1 · Iniciante"],
  ["A2", "A2 · Básico"],
  ["B1", "B1 · Intermediário"],
  ["B2", "B2 · Intermediário avançado"],
  ["C1", "C1 · Avançado"],
  ["C2", "C2 · Fluente"],
];
const GOALS = ["Viajar", "Trabalho e carreira", "Filmes, séries e músicas", "Prova ou intercâmbio", "Conversação do dia a dia"];
// Versão em espanhol: o valor salvo continua em português (é ele que define os temas do plano).
const GOALS_ES = ["Viajar", "Trabajo y carrera", "Películas, series y música", "Exámenes o intercambio", "Conversación del día a día"];
const LEVELS_ES = ["Principiante", "Básico", "Intermedio", "Intermedio alto", "Avanzado", "Fluido"];
type L = { lang?: "pt" | "es" };
const tt = (lang: L["lang"], pt: string, es: string) => (lang === "es" ? es : pt);

function Submit({ label, lang }: { label: string } & L) {
  const { pending } = useFormStatus();
  return <button className="primary-btn grad-btn" disabled={pending}>{pending ? tt(lang, "Salvando…", "Guardando…") : label}</button>;
}

function Msg({ s }: { s: FormState }) {
  if (s.ok) return <p className="auth-ok">{s.ok}</p>;
  if (s.error) return <p className="auth-msg">{s.error}</p>;
  return null;
}

export function ProfileForm({ name, level, goal, lang }: { name: string; level: string; goal: string } & L) {
  const [state, action] = useFormState(saveProfile, {});
  return (
    <form action={action} className="settings-card">
      <h3>{tt(lang, "Seu perfil", "Tu perfil")}</h3>
      <label>{tt(lang, "Nome", "Nombre")}<input className="field" name="name" defaultValue={name} maxLength={60} required /></label>
      <label>{tt(lang, "Nível padrão dos mapas", "Nivel predeterminado de los mapas")}
        <select className="field" name="level" defaultValue={level}>
          {LEVELS.map(([v, l], i) => <option key={v} value={v}>{lang === "es" ? `${v} · ${LEVELS_ES[i]}` : l}</option>)}
        </select>
      </label>
      <label>{tt(lang, "Seu objetivo com o inglês", "Tu objetivo con el inglés")}
        <select className="field" name="goal" defaultValue={goal}>
          <option value="">{tt(lang, "Escolha…", "Elige…")}</option>
          {GOALS.map((g, i) => <option key={g} value={g}>{lang === "es" ? GOALS_ES[i] : g}</option>)}
        </select>
      </label>
      <Msg s={state} />
      <Submit label={tt(lang, "Salvar perfil", "Guardar perfil")} lang={lang} />
    </form>
  );
}

export function TeacherForm({ name }: { name: string }) {
  const [state, action] = useFormState(saveTeacherName, {});
  return (
    <form action={action} className="settings-card">
      <h3>🏷️ Material para a turma</h3>
      <p style={{ color: "var(--muted)", margin: 0 }}>Esse nome sai no topo de tudo o que você imprimir para os alunos.</p>
      <label>Nome no material<input className="field" name="teacher_name" defaultValue={name} maxLength={80} placeholder="Ex.: Prof. Ana Souza · English School" /></label>
      <Msg s={state} />
      <Submit label="Salvar nome" />
    </form>
  );
}

export function PasswordForm({ lang }: L = {}) {
  const [state, action] = useFormState(changePassword, {});
  return (
    <form action={action} className="settings-card">
      <h3>{tt(lang, "Trocar senha", "Cambiar contraseña")}</h3>
      <label>{tt(lang, "Nova senha", "Nueva contraseña")}<input className="field" type="password" name="password" minLength={6} required autoComplete="new-password" /></label>
      <label>{tt(lang, "Confirme a nova senha", "Confirma la nueva contraseña")}<input className="field" type="password" name="confirm" minLength={6} required autoComplete="new-password" /></label>
      <Msg s={state} />
      <Submit label={tt(lang, "Trocar senha", "Cambiar contraseña")} lang={lang} />
    </form>
  );
}
