"use client";
/**
 * Passo 1 — cadastro: nome, e-mail, WhatsApp, CRECI (Estado + Número) e
 * consentimento (LGPD). Valida no client com os MESMOS schemas da rota
 * (`cadastro.ts`), então o que passa aqui passa lá: nome sem espaços sobrando,
 * telefone em E.164, e-mail minúsculo e CRECI canônico com UF ("PE 12345-F").
 * O texto do consentimento é o mesmo que o servidor carimba no registro.
 *
 * Anti-robô (O7·S1): campo-isca sempre; Turnstile quando a chave pública veio no
 * build. Se o lead foi gravado mas o e-mail não saiu, a tela diz isso com
 * honestidade e oferece o WhatsApp — o formulário continua preenchido.
 *
 * Origem (O8·S3): a campanha que a landing guardou nesta aba vai junto do pedido.
 *
 * Cadastro único (O9·S2): "Já tenho cadastro" leva ao passo Entrar; WhatsApp ou
 * CRECI de outro cadastro (409) viram um aviso com a saída. Os campos moram no
 * fluxo (`AccessFlow`), só em memória: voltam preenchidos ao corrigir os dados.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import { lerOrigemGuardada } from "@/lib/origemCampanha";
import { solicitarAcesso, type DadosSolicitacao } from "./api";
import {
  ID_CAMPO,
  comTelefone,
  comUf,
  errosPorCampo,
  primeiroCampoComErro,
  validarCadastro,
  type ErrosCadastro,
  type FormCadastro,
} from "./cadastro";
import { Campo, AvisoErro, AvisoSemCodigo, BotaoSubmit, BotaoTexto, mascararTelefone } from "./ui";
import { PecasAntiRobo, useAntiRobo, MENSAGEM_AGUARDE_TURNSTILE } from "./AntiRobo";
import { AvisoRepetido, type Repetido } from "./AvisosCadastro";
import CampoCreci from "./CampoCreci";
import CampoConsentimento from "./CampoConsentimento";

/** Aviso geral da tela; `whatsapp` quando o pedido travou sem gravar (ver `AvisoErro`). */
type AvisoGeral = { mensagem: string; whatsapp?: boolean };

export default function StepDados({
  form,
  aoMudarForm,
  aoEnviado,
  aoGravadoSemCodigo,
  aoIrParaEntrar,
}: {
  form: FormCadastro;
  aoMudarForm: (form: FormCadastro) => void;
  /** Código enviado: o fluxo guarda os dados (para reenvio e `verify`) e vai ao passo do código. */
  aoEnviado: (dados: DadosSolicitacao, existente: boolean, codigoDev?: string) => void;
  /** 202: o cadastro foi gravado sem código — é desta pessoa, não "já tinha cadastro". */
  aoGravadoSemCodigo: (email: string) => void;
  aoIrParaEntrar: (opcoes: { email?: string; dica?: string | null }) => void;
}) {
  const [consentimento, setConsentimento] = React.useState(false);
  const [erros, setErros] = React.useState<ErrosCadastro>({});
  const [avisoGeral, setAvisoGeral] = React.useState<AvisoGeral | null>(null);
  const [repetido, setRepetido] = React.useState<Repetido | null>(null);
  const [semCodigo, setSemCodigo] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(false);
  const antiRobo = useAntiRobo();
  const refAvisos = React.useRef<HTMLDivElement>(null);

  // aviso novo: o foco (e a rolagem) vai até ele — no celular, o topo do formulário sai da tela
  React.useEffect(() => {
    if (avisoGeral || repetido || semCodigo) refAvisos.current?.focus();
  }, [avisoGeral, repetido, semCodigo]);

  function mostrarErros(novos: ErrosCadastro) {
    setErros(novos);
    const primeiro = primeiroCampoComErro(novos);
    if (primeiro) document.getElementById(ID_CAMPO[primeiro])?.focus();
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (carregando) return;
    setAvisoGeral(null);
    setRepetido(null);
    setSemCodigo(null);

    const validacao = validarCadastro(form, consentimento);
    if (!validacao.ok) return mostrarErros(validacao.erros);
    setErros({});
    if (antiRobo.aguardando) return setAvisoGeral({ mensagem: MENSAGEM_AGUARDE_TURNSTILE });
    setCarregando(true);

    // origem da campanha (O8·S3): lida no envio — no clique, nunca no render
    const origem = lerOrigemGuardada();
    const dados: DadosSolicitacao = { ...validacao.dados, ...(origem ? { origem } : {}) };
    const r = await solicitarAcesso(dados, antiRobo.sinais);
    setCarregando(false);

    if (r.status === "enviado") return aoEnviado(dados, r.existente, r.codigoDev);
    antiRobo.renovar(); // o token do Turnstile é de uso único: qualquer outra resposta pede um novo
    if (r.status === "recebido_sem_codigo") {
      aoGravadoSemCodigo(dados.email);
      return setSemCodigo(r.mensagem);
    }
    if (r.status === "telefone_em_uso") return setRepetido({ tipo: "telefone", dica: r.dica });
    if (r.status === "creci_em_uso") return setRepetido({ tipo: "creci" });
    if (r.status === "invalido") {
      const naTela = errosPorCampo(r.campos, form);
      // erro num campo que a tela não tem: aviso geral, para não ficar sem resposta
      return primeiroCampoComErro(naTela) ? mostrarErros(naTela) : setAvisoGeral({ mensagem: r.mensagem });
    }
    setAvisoGeral({ mensagem: r.mensagem, whatsapp: "whatsapp" in r && r.whatsapp });
  }

  const mudar = (campo: "nome" | "email" | "numero") => (valor: string) => aoMudarForm({ ...form, [campo]: valor });

  return (
    <form onSubmit={enviar} noValidate style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700, margin: 0 }}>
          Enviamos um código para o seu e-mail e liberamos o demo do {brand.nomeCurto} na hora.
        </p>
        <BotaoTexto
          onClick={() => aoIrParaEntrar({ email: form.email })}
          style={{ fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6, justifySelf: "start" }}
        >
          Já tenho cadastro <Ic n="arrow-right" s={15} c={p.primary} />
        </BotaoTexto>
      </div>

      {(semCodigo || avisoGeral || repetido) && (
        <div ref={refAvisos} tabIndex={-1} style={{ display: "grid", gap: 12, outline: "none" }}>
          {semCodigo && <AvisoSemCodigo mensagem={semCodigo} />}
          {avisoGeral && <AvisoErro {...avisoGeral} />}
          {repetido && <AvisoRepetido repetido={repetido} aoEntrar={(dica) => aoIrParaEntrar({ dica })} />}
        </div>
      )}

      <Campo
        id={ID_CAMPO.nome}
        label="Nome completo"
        autoComplete="name"
        placeholder="Nome e sobrenome"
        valor={form.nome}
        aoMudar={mudar("nome")}
        erro={erros.nome}
        autoFocus
      />
      <Campo
        id={ID_CAMPO.email}
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@imobiliaria.com.br"
        valor={form.email}
        aoMudar={mudar("email")}
        erro={erros.email}
      />
      <Campo
        id={ID_CAMPO.telefone}
        label="WhatsApp (com DDD)"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder="(11) 90000-0000"
        valor={form.telefone}
        aoMudar={(v) => aoMudarForm(comTelefone(form, mascararTelefone(v)))}
        erro={erros.telefone}
      />
      <CampoCreci
        uf={form.uf}
        numero={form.numero}
        erroUf={erros.uf}
        erroNumero={erros.numero}
        aoMudarUf={(uf) => aoMudarForm(comUf(form, uf))}
        aoMudarNumero={mudar("numero")}
      />

      <CampoConsentimento marcado={consentimento} aoMudar={setConsentimento} erro={erros.consentimento} />

      <PecasAntiRobo antiRobo={antiRobo} />

      <BotaoSubmit carregando={carregando}>{semCodigo ? "Tentar enviar de novo" : "Receber código"}</BotaoSubmit>
    </form>
  );
}
