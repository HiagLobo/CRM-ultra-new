"use client";
/**
 * `/login` — a porta de entrada do demo ("Já tenho acesso" da landing).
 * Não existe conta com senha: quem já confirmou o e-mail neste navegador escolhe
 * um painel; quem não, entra com o e-mail do cadastro (O9·S2: o `AccessFlow`
 * abre no passo Entrar) ou, na primeira vez, pede o acesso pelo cadastro.
 */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { mockAuth, homeForPerfil } from "@/lib/auth";
import { estaLiberado } from "@/lib/demoAccess";
import { brand } from "@/config/brand";
import EscolhaPainel from "@/components/acesso/EscolhaPainel";
import AccessFlow from "@/components/acesso/AccessFlow";
import { registrarOrigemDaVisita } from "@/lib/origemCampanha";

/** O que a demonstração abre — descrição do produto, não número de mercado. */
const PAINEIS: [string, string][] = [
  ["Corretor", "atendimento e funil"],
  ["CEO", "rede de associados"],
  ["Franquias", "visão da unidade"],
];

export default function LoginPage() {
  const router = useRouter();
  const [liberado, setLiberado] = React.useState(false);
  /** Passo em que o `AccessFlow` abre; `null` = fechado. */
  const [pedindoAcesso, setPedindoAcesso] = React.useState<"entrar" | "dados" | null>(null);

  // quem chega direto no /login por um link de campanha também tem a origem registrada
  React.useEffect(() => {
    registrarOrigemDaVisita();
  }, []);

  // se já estiver logado (e com o demo liberado), vai direto pro painel
  React.useEffect(() => {
    const temAcesso = estaLiberado();
    setLiberado(temAcesso);
    const s = mockAuth.getSession();
    if (s && temAcesso) router.replace(homeForPerfil(s.perfil));
  }, [router]);

  return (
    <div className="login-grid">
      {/* LEFT — apresentação do produto */}
      <div className="photo-panel">
        <div className="bg" />
        <div className="scrim" />
        <div className="hairline" />
        <div style={{ position: "relative", zIndex: 2 }}>
          <img src="/assets/logo-white.svg" alt={brand.nome} style={{ height: 60 }} />
        </div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 480 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 40, lineHeight: 1.12, letterSpacing: "-.02em", margin: 0 }}>
            {brand.tagline}
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,.82)", marginTop: 16 }}>
            Entre na demonstração do {brand.nomeCurto} e explore os painéis com dados fictícios.
          </p>
        </div>
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", columnGap: 40, rowGap: 16, borderTop: "1px solid rgba(255,255,255,.16)", paddingTop: 24 }}>
          {PAINEIS.map(([n, l]) => (
            <div key={n}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 }}>{n}</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.72)", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — entradas da demonstração (O2·S3) */}
      <div className="form-panel">
        <div className="login-card">
          {/* logo também no mobile (o painel da esquerda some) */}
          <Link href="/" style={{ display: "block", marginBottom: 18 }}>
            <img src="/assets/logo.svg" alt={brand.nome} style={{ height: 46 }} />
          </Link>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 25, color: "var(--ink)" }}>
            Entrar na demonstração
          </div>
          {liberado ? (
            <>
              <div style={{ fontSize: 14, color: "var(--gray-500)", marginTop: 6, marginBottom: 20 }}>
                Seu acesso está liberado. Escolha um painel para explorar.
              </div>
              <EscolhaPainel />
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, color: "var(--gray-500)", marginTop: 6, marginBottom: 20 }}>
                Entre com o e-mail do seu cadastro e confirme o código para abrir os três painéis
                (Corretor, CEO com associados e CEO com franquias). Leva menos de um minuto.
              </div>
              <button
                type="button"
                onClick={() => setPedindoAcesso("entrar")}
                className="primary-btn"
                style={{ width: "100%", border: "none", borderRadius: 10, padding: "14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15.5, color: "#fff", background: "var(--purple-primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}
              >
                Entrar com meu e-mail <Icon n="arrow-right" s={19} c="#fff" sw={2.25} />
              </button>
              <div style={{ fontSize: 14, color: "var(--gray-500)", marginTop: 16, textAlign: "center" }}>
                Primeira vez aqui?{" "}
                <button
                  type="button"
                  onClick={() => setPedindoAcesso("dados")}
                  style={{ border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--purple-primary)" }}
                >
                  Pedir acesso ao demo
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {pedindoAcesso && (
        <AccessFlow
          passoInicial={pedindoAcesso}
          aoFechar={() => {
            setPedindoAcesso(null);
            setLiberado(estaLiberado()); // verificou dentro do fluxo? as entradas aparecem
          }}
        />
      )}
    </div>
  );
}
