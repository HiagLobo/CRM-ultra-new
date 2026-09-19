"use client";
/**
 * `/` — landing de marketing do CRM Ultra (O2·S1).
 * O portal de imóveis que ficava aqui virou parte do demo, em `/demo/portal`.
 *
 * Todos os CTAs "Acessar CRM" chamam o mesmo `abrirAcesso`, que abre o
 * `AccessFlow` (dados → código → liberado) da O2·S2.
 */
import * as React from "react";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import Recursos from "@/components/landing/Recursos";
import Publico from "@/components/landing/Publico";
import SiteImoveis from "@/components/landing/SiteImoveis";
import Planos from "@/components/landing/Planos";
import Prova from "@/components/landing/Prova";
import CTAFinal from "@/components/landing/CTAFinal";
import LandingFooter from "@/components/landing/LandingFooter";
import AccessFlow from "@/components/acesso/AccessFlow";
import { limpar, PARAM_ACESSO, VALOR_ACESSO_NECESSARIO } from "@/lib/demoAccess";
import { registrarOrigemDaVisita } from "@/lib/origemCampanha";
import { useRevelar } from "@/components/landing/useRevelar";

export default function LandingPage() {
  useRevelar(); // revela as seções conforme entram na tela
  const [acessoAberto, setAcessoAberto] = React.useState(false);
  const [acessoExpirou, setAcessoExpirou] = React.useState(false);
  const abrirAcesso = React.useCallback(() => setAcessoAberto(true), []);
  // o aviso de acesso vencido (e abrir no "Entrar") vale só para a volta do painel:
  // fechou, o próximo "Acessar CRM" abre o cadastro normal (O9·S2)
  const fecharAcesso = React.useCallback(() => {
    setAcessoAberto(false);
    setAcessoExpirou(false);
  }, []);

  /**
   * Origem da campanha (O8·S3): utm/ref do link ou o site de onde a pessoa veio,
   * guardados nesta aba para irem junto do pedido de acesso. Declarado ANTES do
   * efeito abaixo, que pode limpar a query string da URL.
   */
  React.useEffect(() => {
    registrarOrigemDaVisita();
  }, []);

  /**
   * Chegou aqui rebatido de um painel? O gate do servidor recusou o cookie
   * (expirado ou inexistente). Limpa o espelho velho — senão o `/login`
   * continuaria mostrando as 3 entradas — e abre o fluxo já explicando, direto
   * no "Entrar" (O9·S2): quem volta de um painel já tem cadastro.
   */
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get(PARAM_ACESSO) !== VALOR_ACESSO_NECESSARIO) return;
    limpar();
    setAcessoExpirou(true);
    setAcessoAberto(true);
    // tira o parâmetro da URL para não reabrir o modal a cada recarga
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  return (
    <div style={{ background: "#fff" }}>
      <LandingNav onAcessar={abrirAcesso} />
      <Hero onAcessar={abrirAcesso} />
      <Recursos />
      <Publico />
      <SiteImoveis />
      <Planos onAcessar={abrirAcesso} />
      <Prova />
      <CTAFinal onAcessar={abrirAcesso} />
      <LandingFooter />
      {acessoAberto && <AccessFlow aoFechar={fecharAcesso} avisoAcesso={acessoExpirou} />}
    </div>
  );
}
