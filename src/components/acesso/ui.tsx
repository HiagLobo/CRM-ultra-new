"use client";
/** Peças de formulário do fluxo de acesso (campo, aviso, botão de envio). As miúdas estão em `pecas.tsx`. */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import { LinkWhatsapp, estiloEntrada } from "./pecas";

/**
 * Tira o DDI 55 de um número colado ou autopreenchido ("+55 81 99999-8888"),
 * que antes era cortado em 11 dígitos e virava um número embaralhado.
 * 13 dígitos só chegam colados. Com 12, pode ser DDI + fixo ("+55 81 3333-4444")
 * ou um dígito a mais digitado num celular de DDD 55 ("(55) 9…"): nesse caso —
 * sem "+" e com o 9 do celular logo após o DDD — quem sobra é o dígito extra.
 */
function semDDI(valor: string, d: string): string {
  if (!d.startsWith("55")) return d;
  if (d.length === 13) return d.slice(2);
  if (d.length === 12 && (valor.includes("+") || d[2] !== "9")) return d.slice(2);
  return d;
}

/** Máscara de telefone BR conforme se digita: (11) 90000-0000 */
export function mascararTelefone(valor: string): string {
  const d = semDDI(valor, valor.replace(/\D/g, "")).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function Campo({
  id,
  label,
  valor,
  aoMudar,
  erro,
  dica,
  style,
  "aria-describedby": descritoPor,
  ...rest
}: {
  id: string;
  label: string;
  valor: string;
  aoMudar: (v: string) => void;
  erro?: string;
  dica?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange">) {
  const idErro = `${id}-erro`;
  // o erro e o que o passo quiser ligar ao campo (ex.: um aviso já na tela) são lidos juntos
  const descricao = [erro ? idErro : "", descritoPor ?? ""].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label
        htmlFor={id}
        style={{ display: "block", fontSize: 13, fontWeight: 600, color: p.g700, marginBottom: 6 }}
      >
        {label}
      </label>
      <input
        id={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        aria-invalid={!!erro}
        aria-describedby={descricao}
        {...rest}
        style={{ ...estiloEntrada(!!erro), ...style }} // o estilo do passo completa o base, não o troca
      />
      {erro ? (
        <div id={idErro} role="alert" style={{ fontSize: 13, color: p.error, marginTop: 6 }}>
          {erro}
        </div>
      ) : dica ? (
        <div style={{ fontSize: 12.5, color: p.g500, marginTop: 6 }}>{dica}</div>
      ) : null}
    </div>
  );
}

export function Aviso({
  tipo,
  id,
  children,
}: {
  tipo: "erro" | "info" | "sucesso";
  /** Para um campo apontar o aviso no `aria-describedby`. */
  id?: string;
  children: React.ReactNode;
}) {
  const cor = tipo === "erro" ? p.error : tipo === "sucesso" ? p.success : p.info;
  const icone = tipo === "erro" ? "alert-triangle" : tipo === "sucesso" ? "check-circle-2" : "help-circle";
  return (
    <div
      id={id}
      role={tipo === "erro" ? "alert" : "status"}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: `${cor}14`,
        border: `1px solid ${cor}55`,
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 14,
        lineHeight: 1.5,
        color: p.ink,
      }}
    >
      <span style={{ flexShrink: 0, marginTop: 1 }}>
        <Ic n={icone} s={17} c={cor} />
      </span>
      {/* e-mail comprido (dica, código enviado) quebra em vez de estourar a largura do celular */}
      <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{children}</span>
    </div>
  );
}

/**
 * Lead recebido, mas o e-mail do código não saiu (O7·S1): diz a verdade e dá uma
 * saída na hora — o WhatsApp da marca — em vez de deixar a pessoa esperando.
 */
export function AvisoSemCodigo({ mensagem }: { mensagem: string }) {
  return (
    <Aviso tipo="info">
      {mensagem}{" "}
      <LinkWhatsapp texto={`Olá! Pedi acesso ao demo do ${brand.nomeCurto} e o código não chegou.`} />
    </Aviso>
  );
}

/**
 * Erro na tela. Com `whatsapp`, o pedido travou antes de gravar (verificação de
 * segurança fora do ar, servidor com problema): sem o link, o contato se perderia.
 */
export function AvisoErro({
  mensagem,
  whatsapp,
  textoWhatsapp = `Olá! Tentei pedir acesso ao demo do ${brand.nomeCurto} e o site não deixou concluir.`,
}: {
  mensagem: string;
  whatsapp?: boolean;
  /** Mensagem pronta do WhatsApp (sem PII) — o passo Entrar conta outra história. */
  textoWhatsapp?: string;
}) {
  return (
    <Aviso tipo="erro">
      {mensagem}
      {whatsapp && (
        <>
          {" "}
          <LinkWhatsapp texto={textoWhatsapp} />
        </>
      )}
    </Aviso>
  );
}

export function BotaoSubmit({
  carregando,
  disabled,
  children,
  ...rest
}: { carregando?: boolean; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className="ds-btnpop"
      {...rest}
      disabled={carregando || disabled} // depois do spread: `disabled={false}` não reabre o botão enviando
      style={{
        width: "100%",
        border: "none",
        borderRadius: 999,
        padding: "14px 24px",
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: 15,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        background: carregando ? p.g500 : p.primary,
        color: "#fff",
        cursor: carregando ? "progress" : "pointer",
        ...rest.style,
      }}
    >
      {carregando ? "Enviando…" : children}
    </button>
  );
}
