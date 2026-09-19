"use client";
/**
 * Passo 1 — dados do corretor + consentimento (LGPD).
 * Valida no client com o MESMO Zod da rota (`LeadInputSchema`), então o que
 * passa aqui passa lá: telefone vira E.164, o e-mail vem em minúsculas e o
 * CRECI chega na forma canônica ("CRECI-PE 12.345-F" → "PE 12345-F").
 * O texto do consentimento é o mesmo que o servidor carimba no registro.
 *
 * Anti-robô (O7·S1): campo-isca sempre; Turnstile quando a chave pública veio no
 * build. Se o lead foi gravado mas o e-mail não saiu, a tela diz isso com
 * honestidade e oferece o WhatsApp — o formulário continua preenchido para
 * tentar de novo.
 *
 * Origem (O8·S3): a campanha que a landing guardou nesta aba vai junto do pedido.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { LeadInputSchema, TEXTO_CONSENTIMENTO } from "@/features/lead/schema";
import { EXEMPLO_CRECI } from "@/features/lead/creci";
import { lerOrigemGuardada } from "@/lib/origemCampanha";
import { solicitarAcesso, type DadosSolicitacao } from "./api";
import { Campo, AvisoErro, AvisoSemCodigo, BotaoSubmit, mascararTelefone } from "./ui";
import { CampoIsca, WidgetTurnstile, SITE_KEY_TURNSTILE, MENSAGEM_AGUARDE_TURNSTILE } from "./AntiRobo";

type Campos = Record<string, string[] | undefined>;
/** Aviso geral da tela; `whatsapp` quando o pedido travou sem gravar (ver `AvisoErro`). */
type AvisoGeral = { mensagem: string; whatsapp?: boolean };

export default function StepDados({
  aoEnviar,
}: {
  /** Chamado no sucesso: o fluxo guarda os dados (para reenvio) e vai ao passo do código. */
  aoEnviar: (dados: DadosSolicitacao, codigoDev?: string) => void;
}) {
  const [email, setEmail] = React.useState("");
  const [telefone, setTelefone] = React.useState("");
  const [creci, setCreci] = React.useState("");
  const [consentimento, setConsentimento] = React.useState(false);
  const [erros, setErros] = React.useState<Campos>({});
  const [avisoGeral, setAvisoGeral] = React.useState<AvisoGeral | null>(null);
  const [semCodigo, setSemCodigo] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(false);
  const [isca, setIsca] = React.useState("");
  const [tokenTurnstile, setTokenTurnstile] = React.useState<string | null>(null);
  const [versaoTurnstile, setVersaoTurnstile] = React.useState(0);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (carregando) return;
    setAvisoGeral(null);
    setSemCodigo(null);

    const parsed = LeadInputSchema.safeParse({ email, telefone, creci, consentimento });
    if (!parsed.success) {
      setErros(parsed.error.flatten().fieldErrors);
      return;
    }
    setErros({});
    if (SITE_KEY_TURNSTILE && !tokenTurnstile) {
      setAvisoGeral({ mensagem: MENSAGEM_AGUARDE_TURNSTILE });
      return;
    }
    setCarregando(true);

    // origem da campanha (O8·S3): lida no envio — no clique, nunca no render
    const origem = lerOrigemGuardada();
    const dados: DadosSolicitacao = {
      email: parsed.data.email,
      telefone: parsed.data.telefone,
      creci: parsed.data.creci,
      consentimento: true,
      ...(origem ? { origem } : {}),
    };
    const r = await solicitarAcesso(dados, { website: isca, turnstileToken: tokenTurnstile ?? undefined });
    setCarregando(false);

    if (r.status === "enviado") return aoEnviar(dados, r.codigoDev);
    // o token do Turnstile é de uso único: qualquer outra resposta pede um novo
    if (SITE_KEY_TURNSTILE) {
      setTokenTurnstile(null);
      setVersaoTurnstile((v) => v + 1);
    }
    if (r.status === "recebido_sem_codigo") return setSemCodigo(r.mensagem);
    if (r.status === "invalido") {
      setErros(r.campos ?? {});
      setAvisoGeral({ mensagem: r.mensagem });
      return;
    }
    setAvisoGeral({ mensagem: r.mensagem, whatsapp: "whatsapp" in r && r.whatsapp });
  }

  const erro = (campo: string) => erros[campo]?.[0];

  return (
    <form onSubmit={enviar} noValidate style={{ display: "grid", gap: 16 }}>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700, margin: 0 }}>
        Enviamos um código para o seu e-mail e liberamos o demo do {brand.nomeCurto} na hora.
      </p>

      {semCodigo && <AvisoSemCodigo mensagem={semCodigo} />}
      {avisoGeral && <AvisoErro {...avisoGeral} />}

      <Campo
        id="acesso-email"
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@imobiliaria.com.br"
        valor={email}
        aoMudar={setEmail}
        erro={erro("email")}
        autoFocus
      />
      <Campo
        id="acesso-telefone"
        label="Telefone (WhatsApp)"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder="(11) 90000-0000"
        valor={telefone}
        aoMudar={(v) => setTelefone(mascararTelefone(v))}
        erro={erro("telefone")}
      />
      <Campo
        id="acesso-creci"
        label="CRECI"
        placeholder={EXEMPLO_CRECI}
        valor={creci}
        aoMudar={setCreci}
        erro={erro("creci")}
        dica="Usamos para confirmar que você atua no mercado imobiliário."
      />

      <div>
        <label
          htmlFor="acesso-consentimento"
          style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, lineHeight: 1.55, color: p.g700, cursor: "pointer" }}
        >
          <input
            id="acesso-consentimento"
            type="checkbox"
            checked={consentimento}
            onChange={(e) => setConsentimento(e.target.checked)}
            aria-invalid={!!erro("consentimento")}
            style={{ marginTop: 2, width: 17, height: 17, accentColor: p.primary, flexShrink: 0 }}
          />
          <span>
            {TEXTO_CONSENTIMENTO}{" "}
            <a
              href="/privacidade"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()} // abrir a política não marca a caixa
              style={{ color: p.primary, fontWeight: 600, whiteSpace: "nowrap" }}
            >
              Ler a política
            </a>
          </span>
        </label>
        {erro("consentimento") && (
          <div role="alert" style={{ fontSize: 13, color: p.error, marginTop: 6 }}>
            {erro("consentimento")}
          </div>
        )}
      </div>

      <CampoIsca valor={isca} aoMudar={setIsca} />
      {SITE_KEY_TURNSTILE && (
        <WidgetTurnstile key={versaoTurnstile} siteKey={SITE_KEY_TURNSTILE} aoMudarToken={setTokenTurnstile} />
      )}

      <BotaoSubmit carregando={carregando}>{semCodigo ? "Tentar enviar de novo" : "Receber código"}</BotaoSubmit>
    </form>
  );
}
