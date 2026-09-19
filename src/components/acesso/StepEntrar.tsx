"use client";
/**
 * Passo "Entrar" (O9·S2) — quem já tem cadastro pede o código só com o e-mail
 * (`POST /api/lead/entrar`), com a mesma isca e o mesmo Turnstile do cadastro.
 *
 * - E-mail sem cadastro → aviso + "Quero me cadastrar" (volta ao cadastro com
 *   o e-mail já preenchido).
 * - Envio fora do ar (503) → aviso honesto + WhatsApp da marca.
 * - Veio de um WhatsApp repetido → mostra a dica do e-mail mascarado.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { EntrarSchema } from "@/features/lead/schema";
import { entrarComEmail } from "./apiEntrar";
import { Aviso, AvisoErro, BotaoSubmit, BotaoTexto, Campo } from "./ui";
import { PecasAntiRobo, useAntiRobo, MENSAGEM_AGUARDE_TURNSTILE } from "./AntiRobo";
import { AvisoSemCadastro } from "./AvisosCadastro";
import { WHATSAPP_ENTRAR_SEM_CODIGO } from "./mensagens";

const ID_EMAIL = "acesso-entrar-email";

type AvisoEntrar = { tipo: "sem_cadastro" } | { tipo: "erro"; mensagem: string; whatsapp?: boolean; envio?: boolean };

export default function StepEntrar({
  emailInicial,
  dica,
  aoEnviado,
  aoCadastrar,
}: {
  emailInicial: string;
  /** E-mail mascarado do dono do WhatsApp que a pessoa tentou cadastrar. */
  dica: string | null;
  aoEnviado: (email: string, codigoDev?: string) => void;
  /** Ir ao cadastro levando o e-mail digitado aqui. */
  aoCadastrar: (email: string) => void;
}) {
  const [email, setEmail] = React.useState(emailInicial);
  const [erro, setErro] = React.useState<string | undefined>();
  const [aviso, setAviso] = React.useState<AvisoEntrar | null>(null);
  const [carregando, setCarregando] = React.useState(false);
  const antiRobo = useAntiRobo();
  const refAviso = React.useRef<HTMLDivElement>(null);

  // aviso novo: o foco (e a rolagem) vai até ele
  React.useEffect(() => {
    if (aviso) refAviso.current?.focus();
  }, [aviso]);

  function mostrarErro(mensagem: string) {
    setErro(mensagem);
    document.getElementById(ID_EMAIL)?.focus();
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (carregando) return;
    setAviso(null);

    const parsed = EntrarSchema.safeParse({ email });
    if (!parsed.success) return mostrarErro(parsed.error.flatten().fieldErrors.email?.[0] ?? "e-mail inválido");
    setErro(undefined);
    if (antiRobo.aguardando) return setAviso({ tipo: "erro", mensagem: MENSAGEM_AGUARDE_TURNSTILE });
    setCarregando(true);
    const r = await entrarComEmail(parsed.data.email, antiRobo.sinais);
    setCarregando(false);

    if (r.status === "enviado") return aoEnviado(parsed.data.email, r.codigoDev);
    antiRobo.renovar(); // token de uso único
    if (r.status === "sem_cadastro") return setAviso({ tipo: "sem_cadastro" });
    if (r.status === "envio_indisponivel") return setAviso({ tipo: "erro", mensagem: r.mensagem, whatsapp: true, envio: true });
    if (r.status === "invalido" && r.campos?.email?.[0]) return mostrarErro(r.campos.email[0]);
    setAviso({ tipo: "erro", mensagem: r.mensagem, whatsapp: "whatsapp" in r && r.whatsapp });
  }

  return (
    <form onSubmit={enviar} noValidate style={{ display: "grid", gap: 16 }}>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700, margin: 0 }}>
        Digite o e-mail do seu cadastro. Enviamos um código para você entrar — sem senha.
      </p>

      {dica && (
        <Aviso tipo="info">
          O WhatsApp que você digitou tem cadastro com <strong>{dica}</strong>. Entre com esse e-mail.
        </Aviso>
      )}

      {aviso && (
        <div ref={refAviso} tabIndex={-1} style={{ outline: "none" }}>
          {aviso.tipo === "sem_cadastro" ? (
            <AvisoSemCadastro aoCadastrar={() => aoCadastrar(email)} />
          ) : (
            <AvisoErro
              mensagem={aviso.mensagem}
              whatsapp={aviso.whatsapp}
              {...(aviso.envio ? { textoWhatsapp: WHATSAPP_ENTRAR_SEM_CODIGO } : {})}
            />
          )}
        </div>
      )}

      <Campo
        id={ID_EMAIL}
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@imobiliaria.com.br"
        valor={email}
        aoMudar={setEmail}
        erro={erro}
        autoFocus
      />

      <PecasAntiRobo antiRobo={antiRobo} />

      <BotaoSubmit carregando={carregando}>Receber código</BotaoSubmit>

      <p style={{ fontSize: 13.5, color: p.g700, margin: 0, textAlign: "center" }}>
        Ainda não tem cadastro? <BotaoTexto onClick={() => aoCadastrar(email)}>Cadastre-se</BotaoTexto>
      </p>
    </form>
  );
}
