"use client";

import { FormEvent, useEffect, useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/admin/api/session", { cache: "no-store" }).then((response) => {
      if (response.ok) window.location.replace("/admin");
    });
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("Verificando acesso...");
    try {
      const response = await fetch("/admin/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível entrar");
      setStatus("Acesso liberado. Abrindo painel...");
      window.location.replace("/admin");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível entrar");
      setBusy(false);
    }
  }

  return (
    <main className="admin-login-shell">
      <a className="admin-login-back" href="/">← Voltar ao site</a>
      <section className="admin-login-card">
        <div className="admin-login-brand">
          <img src="/images/brand/cds-car-logo.png" alt="CDS Car Intermediações" />
          <span>Ambiente seguro</span>
        </div>
        <div className="admin-login-heading">
          <span>Painel administrativo</span>
          <h1>Gestão do estoque CDS Car.</h1>
          <p>Entre com a senha administrativa para atualizar veículos, imagens e destaques do site.</p>
        </div>
        <form onSubmit={submit}>
          <label htmlFor="admin-password">Senha de acesso</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            minLength={12}
            required
            autoFocus
          />
          <button type="submit" disabled={busy}>{busy ? "Entrando..." : "Entrar no painel"}</button>
          <p className="admin-login-status" role="status">{status}</p>
        </form>
        <small>O acesso é protegido e a sessão expira automaticamente.</small>
      </section>
    </main>
  );
}
