import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { Flame, LoaderCircle, LockKeyhole, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AdminAuth({ children, onBack }: { children: ReactNode; onBack: () => void }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true); setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    if (authError) setError("E-mail ou senha inválidos.");
    setSubmitting(false);
  }

  if (checking) return <div className="admin-auth"><LoaderCircle className="auth-spinner" /><span>Verificando acesso...</span></div>;
  if (!session) return <div className="admin-auth"><form className="admin-login" onSubmit={login}>
    <div className="admin-login-brand"><span><Flame size={25} /></span><div><strong>Braseira Pizza</strong><small>Acesso administrativo</small></div></div>
    <div className="admin-login-icon"><LockKeyhole /></div><h1>Entrar no painel</h1><p>Use a conta administrativa cadastrada no Supabase.</p>
    <label>E-mail<input name="email" type="email" autoComplete="email" required placeholder="seu@email.com" /></label>
    <label>Senha<input name="password" type="password" autoComplete="current-password" required placeholder="Sua senha" /></label>
    {error && <span className="admin-login-error" role="alert">{error}</span>}
    <button className="primary" type="submit" disabled={submitting}>{submitting ? "Entrando..." : "Entrar"}</button>
    <button className="admin-back" type="button" onClick={onBack}>Voltar ao cardápio</button>
  </form></div>;

  return <>{children}<button className="admin-signout" onClick={() => supabase?.auth.signOut()} title="Sair do painel"><LogOut size={17} /> Sair</button></>;
}
