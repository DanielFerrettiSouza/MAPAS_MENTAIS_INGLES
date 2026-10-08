"use client";

import { useFormState, useFormStatus } from "react-dom";
import { changePassword, saveProfile, type FormState } from "@/app/app/configuracoes/actions";

const LEVELS = [
  ["A1", "A1 · Iniciante"],
  ["A2", "A2 · Básico"],
  ["B1", "B1 · Intermediário"],
  ["B2", "B2 · Intermediário avançado"],
  ["C1", "C1 · Avançado"],
  ["C2", "C2 · Fluente"],
];
const GOALS = ["Viajar", "Trabalho e carreira", "Filmes, séries e músicas", "Prova ou intercâmbio", "Conversação do dia a dia"];

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button className="primary-btn grad-btn" disabled={pending}>{pending ? "Salvando…" : label}</button>;
}

function Msg({ s }: { s: FormState }) {
  if (s.ok) return <p className="auth-ok">{s.ok}</p>;
  if (s.error) return <p className="auth-msg">{s.error}</p>;
  return null;
}

export function ProfileForm({ name, level, goal }: { name: string; level: string; goal: string }) {
  const [state, action] = useFormState(saveProfile, {});
  return (
    <form action={action} className="settings-card">
      <h3>Seu perfil</h3>
      <label>Nome<input className="field" name="name" defaultValue={name} maxLength={60} required /></label>
      <label>Nível padrão dos mapas
        <select className="field" name="level" defaultValue={level}>
          {LEVELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label>Seu objetivo com o inglês
        <select className="field" name="goal" defaultValue={goal}>
          <option value="">Escolha…</option>
          {GOALS.map((g) => <option key={g}>{g}</option>)}
        </select>
      </label>
      <Msg s={state} />
      <Submit label="Salvar perfil" />
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useFormState(changePassword, {});
  return (
    <form action={action} className="settings-card">
      <h3>Trocar senha</h3>
      <label>Nova senha<input className="field" type="password" name="password" minLength={6} required autoComplete="new-password" /></label>
      <label>Confirme a nova senha<input className="field" type="password" name="confirm" minLength={6} required autoComplete="new-password" /></label>
      <Msg s={state} />
      <Submit label="Trocar senha" />
    </form>
  );
}
