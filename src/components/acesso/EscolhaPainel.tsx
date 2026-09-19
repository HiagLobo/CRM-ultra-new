"use client";
/**
 * As três entradas da demonstração (O2·S3). Usada no fim do fluxo de acesso e
 * na tela de login. Clicar entra como a persona fictícia do perfil e abre o
 * painel — nenhum dado real por trás, tudo mock.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { entrarComoDemo, homeForPerfil } from "@/lib/auth";
import type { Perfil } from "@/types";

/**
 * Uma entrada abre um painel (entrando como a persona do perfil) **ou** leva a
 * uma rota aberta — caso do site de divulgação, que é público por natureza e
 * não precisa de sessão.
 */
type Entrada = { icone: string; titulo: string; descricao: string } & (
  | { tipo: "painel"; perfil: Perfil }
  | { tipo: "rota"; destino: string }
);

const ENTRADAS: Entrada[] = [
  {
    tipo: "painel",
    perfil: "corretor",
    icone: "user-round",
    titulo: "Painel do Corretor",
    descricao: "Funil, atendimento, agenda, Radar de captação e comissões.",
  },
  {
    tipo: "painel",
    perfil: "ceo",
    icone: "building-2",
    titulo: "CEO com associados",
    descricao: "Corretores associados, curadoria, financeiro, jurídico e fechamentos.",
  },
  {
    tipo: "painel",
    perfil: "franqueado",
    icone: "globe",
    titulo: "CEO com franquias",
    descricao: "Visão da unidade, time, assentos e indicação de corretores.",
  },
  {
    tipo: "rota",
    destino: "/demo/portal",
    icone: "building",
    titulo: "Site de divulgação",
    descricao: "O site público que sua imobiliária ganha: vitrine, busca, favoritos e comparação.",
  },
];

export default function EscolhaPainel({ aoEscolher }: { aoEscolher?: () => void }) {
  const router = useRouter();
  const [indo, setIndo] = React.useState<string | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  function entrar(entrada: Entrada) {
    if (indo) return;
    setErro(null);

    // rota aberta (site de divulgação): não precisa de persona
    if (entrada.tipo === "rota") {
      setIndo(entrada.titulo);
      aoEscolher?.();
      router.push(entrada.destino);
      return;
    }

    const sessao = entrarComoDemo(entrada.perfil);
    if (!sessao) {
      setErro("não foi possível abrir este painel. Tente novamente.");
      return;
    }
    setIndo(entrada.titulo);
    aoEscolher?.();
    router.push(homeForPerfil(entrada.perfil));
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {erro && (
        <div role="alert" style={{ fontSize: 13, color: p.error }}>
          {erro}
        </div>
      )}
      {ENTRADAS.map((e) => (
        <button
          key={e.titulo}
          type="button"
          onClick={() => entrar(e)}
          disabled={!!indo}
          className="ds-btnpop"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            textAlign: "left",
            width: "100%",
            background: "#fff",
            border: `1.5px solid ${indo === e.titulo ? p.primary : p.g300}`,
            borderRadius: 14,
            padding: "14px 16px",
            cursor: indo ? "progress" : "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: p.lilac1,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Ic n={e.icone} s={20} c={p.primary} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontWeight: 700, fontSize: 15, color: p.ink }}>{e.titulo}</span>
            <span style={{ display: "block", fontSize: 13, color: p.g500, marginTop: 2, lineHeight: 1.45 }}>
              {e.descricao}
            </span>
          </span>
          <Ic n="arrow-right" s={18} c={p.primary} />
        </button>
      ))}
    </div>
  );
}
