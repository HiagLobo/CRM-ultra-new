"use client";
/**
 * Passo 1 — dados do corretor + consentimento (LGPD).
 * Valida no client com o MESMO Zod da rota (`LeadInputSchema`), então o que
 * passa aqui passa lá: telefone vira E.164 e o e-mail vem em minúsculas.
 * O texto do consentimento é o mesmo que o servidor carimba no registro.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { LeadInputSchema, TEXTO_CONSENTIMENTO } from "@/features/lead/schema";
import { solicitarAcesso, type DadosSolicitacao } from "./api";
import { Campo, Aviso, BotaoSubmit, mascararTelefone } from "./ui";

type Campos = Record<string, string[] | undefined>;

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
  const [avisoGeral, setAvisoGeral] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (carregando) return;
    setAvisoGeral(null);

    const parsed = LeadInputSchema.safeParse({ email, telefone, creci, consentimento });
    if (!parsed.success) {
      setErros(parsed.error.flatten().fieldErrors);
      return;
    }
    setErros({});
    setCarregando(true);

    const dados: DadosSolicitacao = {
      email: parsed.data.email,
      telefone: parsed.data.telefone,
      creci: parsed.data.creci,
      consentimento: true,
    };
    const r = await solicitarAcesso(dados);
    setCarregando(false);

    if (r.status === "enviado") return aoEnviar(dados, r.codigoDev);
    if (r.status === "invalido") {
      setErros(r.campos ?? {});
      setAvisoGeral(r.mensagem);
      return;
    }
    setAvisoGeral(r.mensagem);
  }

  const erro = (campo: string) => erros[campo]?.[0];

  return (
    <form onSubmit={enviar} noValidate style={{ display: "grid", gap: 16 }}>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700, margin: 0 }}>
        Enviamos um código para o seu e-mail e liberamos o demo do {brand.nomeCurto} na hora.
      </p>

      {avisoGeral && <Aviso tipo="erro">{avisoGeral}</Aviso>}

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
        placeholder="SP 12345"
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

      <BotaoSubmit carregando={carregando}>Receber código</BotaoSubmit>
    </form>
  );
}
