"use client";
/**
 * `/admin/login` — a porta do painel de leads. Só senha (um admin, sem cadastro).
 * A senha nunca é logada nem guardada; sai daqui direto para o `POST` e some.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";

export default function AdminLoginPage() {
  const router = useRouter();
  const [senha, setSenha] = React.useState("");
  const [mostrar, setMostrar] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(false);
  const [entrou, setEntrou] = React.useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (carregando) return;
    setErro(null);
    setCarregando(true);

    let res: Response;
    try {
      res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
    } catch {
      setCarregando(false);
      setErro("não deu para falar com o servidor. Verifique sua conexão.");
      return;
    }
    setCarregando(false);
    setSenha(""); // não deixa a senha no estado depois do envio

    if (res.ok) {
      setEntrou(true); // confirma antes de navegar (o push troca a tela inteira)
      router.push("/admin");
      return;
    }
    if (res.status === 429) {
      setErro("muitas tentativas. Aguarde alguns minutos e tente de novo.");
      return;
    }
    setErro("senha incorreta.");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: p.page,
        padding: 20,
      }}
    >
      {entrou ? (
        <div
          style={{
            width: "min(400px, 100%)",
            background: "#fff",
            borderRadius: 18,
            border: `1px solid ${p.g300}`,
            boxShadow: "0 18px 44px rgba(28,26,34,.08)",
            padding: 30,
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${p.success}1A`, display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <Ic n="check-circle-2" s={28} c={p.success} />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 21, margin: "0 0 8px", color: p.ink }}>
            Sessão iniciada
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: p.g700, margin: 0 }}>
            Você está autenticado por 12 horas. Abrindo o painel de leads…
          </p>
        </div>
      ) : (
      <form
        onSubmit={entrar}
        style={{
          width: "min(400px, 100%)",
          background: "#fff",
          borderRadius: 18,
          border: `1px solid ${p.g300}`,
          boxShadow: "0 18px 44px rgba(28,26,34,.08)",
          padding: 30,
          boxSizing: "border-box",
        }}
      >
        <img src="/assets/logo.svg" alt={brand.nome} style={{ height: 44, marginBottom: 20 }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, margin: "0 0 6px", color: p.ink }}>
          Painel de leads
        </h1>
        <p style={{ fontSize: 14, color: p.g500, margin: "0 0 22px" }}>
          Área restrita. Entre com a senha de administrador.
        </p>

        {erro && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: `${p.error}14`,
              border: `1px solid ${p.error}55`,
              borderRadius: 10,
              padding: "11px 13px",
              fontSize: 13.5,
              color: p.ink,
              marginBottom: 16,
            }}
          >
            <Ic n="alert-triangle" s={16} c={p.error} /> {erro}
          </div>
        )}

        <label
          htmlFor="admin-senha"
          style={{ display: "block", fontSize: 13, fontWeight: 600, color: p.g700, marginBottom: 6 }}
        >
          Senha
        </label>
        <div style={{ position: "relative", marginBottom: 20 }}>
          <input
            id="admin-senha"
            type={mostrar ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            autoFocus
            placeholder="••••••••"
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontFamily: "var(--font-body)",
              fontSize: 15,
              padding: "12px 44px 12px 14px",
              border: `1.5px solid ${p.g300}`,
              borderRadius: 10,
              outline: "none",
              color: p.ink,
            }}
          />
          <button
            type="button"
            aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
            onClick={() => setMostrar((s) => !s)}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 6 }}
          >
            <Ic n={mostrar ? "eye-off" : "eye"} s={18} c={p.g500} />
          </button>
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="ds-btnpop"
          style={{
            width: "100%",
            border: "none",
            borderRadius: 10,
            padding: "14px",
            cursor: carregando ? "progress" : "pointer",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 15,
            color: "#fff",
            background: carregando ? p.g500 : p.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
          }}
        >
          {carregando ? "Entrando…" : "Entrar"}
          {!carregando && <Ic n="arrow-right" s={18} c="#fff" />}
        </button>
      </form>
      )}
    </div>
  );
}
