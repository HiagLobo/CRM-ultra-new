"use client";
/**
 * `/privacidade` — Política de Privacidade.
 *
 * O texto descreve **fielmente o que o sistema faz hoje**: quais dados são
 * coletados, por quê, por quanto tempo e como exercer os direitos. Essa é a
 * parte técnica, e ela está correta.
 *
 * A identificação do controlador sai de `brand.empresa` — trocar lá troca aqui.
 * O que continua fora do meu alcance é a **revisão por um advogado**: descrever
 * o sistema é engenharia, redigir documento legal não é.
 */
import * as React from "react";
import Link from "next/link";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import { TEXTO_CONSENTIMENTO, EXPIRACAO_CODIGO_MIN } from "@/features/lead/schema";

const ATUALIZADA_EM = "19 de setembro de 2026";

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 34 }}>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 20,
          color: p.ink,
          margin: "0 0 10px",
        }}
      >
        {titulo}
      </h2>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: p.g700 }}>{children}</div>
    </section>
  );
}

export default function PrivacidadePage() {
  // o aviso de rascunho some quando os dados jurídicos existem; a revisão
  // por advogado continua sendo responsabilidade de quem publica
  const faltaPreencher = !brand.empresa.cnpj;

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div className="ds-pad" style={{ maxWidth: 780, margin: "0 auto", padding: "48px 32px 80px" }}>
        <Link
          href="/"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, color: p.primary, textDecoration: "none", fontWeight: 600 }}
        >
          <Ic n="arrow-left" s={16} c={p.primary} /> Voltar
        </Link>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(28px, 4vw, 38px)",
            letterSpacing: "-.02em",
            color: p.ink,
            margin: "22px 0 8px",
          }}
        >
          Política de Privacidade
        </h1>
        <p style={{ fontSize: 14, color: p.g500, margin: 0 }}>
          {brand.nome} · atualizada em {ATUALIZADA_EM}
        </p>

        {faltaPreencher && (
          <div
            role="status"
            style={{
              marginTop: 24,
              background: `${p.warning}14`,
              border: `1px solid ${p.warning}66`,
              borderRadius: 12,
              padding: "14px 16px",
              fontSize: 14,
              lineHeight: 1.6,
              color: p.ink,
            }}
          >
            <strong>Falta a identificação do controlador.</strong> Preencha{" "}
            <code>brand.empresa</code> em <code>src/config/brand.ts</code> antes de publicar.
          </div>
        )}

        <Secao titulo="1. Quem trata seus dados">
          <p style={{ margin: 0 }}>
            O responsável pelo tratamento dos seus dados é a{" "}
            <strong>{brand.empresa.razaoSocial}</strong>, inscrita no CNPJ{" "}
            <strong>{brand.empresa.cnpj}</strong>
            {brand.contato.endereco ? `, com sede em ${brand.contato.endereco}` : ""} — responsável
            pelo desenvolvimento e pela operação do {brand.nome} ({brand.dominio}).
          </p>
          <p style={{ margin: "12px 0 0" }}>
            Fale com a gente pelo e-mail{" "}
            <a href={`mailto:${brand.contato.email}`} style={{ color: p.primary, fontWeight: 600 }}>
              {brand.contato.email}
            </a>{" "}
            ou pelo telefone {brand.contato.telefone}.
          </p>
        </Secao>

        <Secao titulo="2. Quais dados coletamos e por quê">
          <p style={{ marginTop: 0 }}>
            Para liberar o acesso à demonstração, coletamos apenas o necessário:
          </p>
          <ul style={{ margin: "10px 0 0", paddingLeft: 20, display: "grid", gap: 8 }}>
            <li>
              <strong>Nome completo</strong> — saber com quem estamos falando.
            </li>
            <li>
              <strong>E-mail</strong> — enviar o código de verificação e falar com você sobre o produto.
            </li>
            <li>
              <strong>Telefone</strong> — contato comercial.
            </li>
            <li>
              <strong>CRECI e o estado do conselho</strong> — confirmar que você atua no mercado
              imobiliário. A conferência é feita por uma pessoa da nossa equipe na consulta pública do
              conselho regional, e anotamos o resultado junto do seu cadastro.
            </li>
            <li>
              <strong>Data e hora do último acesso à demonstração</strong> — saber se o acesso está sendo
              usado.
            </li>
            <li>
              <strong>Data, hora e endereço IP do consentimento</strong> — prova de que a autorização
              foi dada, como a LGPD exige.
            </li>
            <li>
              <strong>Origem do link</strong> — se você chegou por um anúncio, post ou link de
              parceiro, registramos junto do pedido de acesso o identificador da campanha (os
              parâmetros <code>utm</code> e <code>ref</code> do link) e/ou o domínio do site de onde você veio,
              para sabermos quais divulgações funcionam. Até o envio do pedido, isso fica só na aba do
              navegador em que você abriu o site (não é cookie) e some quando ela é fechada.
            </li>
          </ul>
          <p style={{ marginBottom: 0 }}>
            Não usamos cookies de rastreamento nem compartilhamos seus dados com anunciantes. Os dados
            que aparecem dentro da demonstração são <strong>fictícios</strong> — nenhum cliente,
            imóvel ou negócio real.
          </p>
        </Secao>

        <Secao titulo="3. Base legal">
          <p style={{ margin: 0 }}>
            O tratamento se apoia no seu <strong>consentimento</strong> (art. 7º, I da LGPD), dado ao
            marcar a caixa no formulário de acesso. O texto aceito é exatamente este:
          </p>
          <blockquote
            style={{
              margin: "12px 0 0",
              padding: "12px 16px",
              background: p.lilac1,
              borderLeft: `3px solid ${p.primary}`,
              borderRadius: 8,
              fontSize: 14.5,
              color: p.ink,
            }}
          >
            {TEXTO_CONSENTIMENTO}
          </blockquote>
        </Secao>

        <Secao titulo="4. Com quem compartilhamos">
          <p style={{ margin: 0 }}>
            Apenas com fornecedores necessários para o serviço funcionar: o provedor de envio de
            e-mail (para entregar seu código) e o provedor de hospedagem e banco de dados (onde o
            registro fica guardado). Eles tratam os dados sob nossa instrução e não podem usá-los para
            outra finalidade. Não vendemos dados.
          </p>
        </Secao>

        <Secao titulo="5. Por quanto tempo guardamos">
          <p style={{ margin: 0 }}>
            Enquanto durar o interesse comercial ou até você pedir a exclusão — o que vier primeiro. O
            código de verificação vale <strong>{EXPIRACAO_CODIGO_MIN} minutos</strong>, é guardado apenas como resumo
            criptográfico (nunca em texto legível) e é descartado assim que usado.
          </p>
        </Secao>

        <Secao titulo="6. Seus direitos">
          <p style={{ marginTop: 0 }}>
            A LGPD (art. 18) garante a você, entre outros: confirmar se tratamos seus dados, acessá-los,
            corrigi-los, <strong>pedir a eliminação</strong> e revogar o consentimento a qualquer
            momento.
          </p>
          <p style={{ marginBottom: 0 }}>
            Para exercer qualquer um deles, escreva para{" "}
            <a href={`mailto:${brand.contato.email}`} style={{ color: p.primary, fontWeight: 600 }}>
              {brand.contato.email}
            </a>
            . A exclusão apaga o registro por completo — contato, consentimento e histórico — e você
            pode pedir acesso de novo depois, se quiser.
          </p>
        </Secao>

        <Secao titulo="7. Segurança">
          <p style={{ margin: 0 }}>
            O acesso ao painel administrativo é protegido por senha e sessão assinada; os dados
            trafegam por conexão criptografada; o código de verificação expira, tem tentativas
            limitadas e é guardado apenas como resumo criptográfico. Seus dados de contato nunca são
            gravados em registros de log da aplicação.
          </p>
        </Secao>

        <Secao titulo="8. Mudanças nesta política">
          <p style={{ margin: 0 }}>
            Se algo mudar, atualizamos esta página e a data acima. Alterações relevantes na finalidade
            do tratamento serão comunicadas por e-mail.
          </p>
        </Secao>

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${p.g100}`, fontSize: 14, color: p.g500 }}>
          Dúvidas sobre esta política?{" "}
          <a href={`mailto:${brand.contato.email}`} style={{ color: p.primary, fontWeight: 600 }}>
            {brand.contato.email}
          </a>
        </div>
      </div>
    </div>
  );
}
