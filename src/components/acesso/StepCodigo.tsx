"use client";
/**
 * Passo 2 — conferir o código de 6 dígitos.
 * Cada motivo de falha da O1 vira um texto e um caminho de saída: código errado
 * → tentar de novo; expirado ou tentativas esgotadas → reenviar; rate-limit →
 * esperar. Reenviar tem espera própria para não gastar o limite de 3/30min à toa.
 * Reenvio sem e-mail (O7·S1): o contato já está salvo; a tela diz que o código
 * novo não saiu e que um anterior ainda no prazo continua valendo.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { EXPIRACAO_CODIGO_MIN } from "@/features/lead/schema";
import { verificarCodigo, solicitarAcesso, type DadosSolicitacao } from "./api";
import { Campo, Aviso, AvisoSemCodigo, BotaoSubmit } from "./ui";
import { WidgetTurnstile, SITE_KEY_TURNSTILE, MENSAGEM_AGUARDE_TURNSTILE } from "./AntiRobo";
import { liberar } from "@/lib/demoAccess";

/** Espera entre reenvios (o limite real é do servidor: 3 envios / 30 min). */
const ESPERA_REENVIO_S = 60;

export default function StepCodigo({
  dados,
  codigoDevInicial,
  aoVerificar,
  aoVoltar,
}: {
  dados: DadosSolicitacao;
  codigoDevInicial?: string;
  aoVerificar: () => void;
  aoVoltar: () => void;
}) {
  const [codigo, setCodigo] = React.useState("");
  const [codigoDev, setCodigoDev] = React.useState(codigoDevInicial);
  const [erro, setErro] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  const [precisaNovoCodigo, setPrecisaNovoCodigo] = React.useState(false);
  const [carregando, setCarregando] = React.useState(false);
  const [espera, setEspera] = React.useState(ESPERA_REENVIO_S);
  const [semCodigo, setSemCodigo] = React.useState<string | null>(null);
  const [tokenTurnstile, setTokenTurnstile] = React.useState<string | null>(null);
  const [versaoTurnstile, setVersaoTurnstile] = React.useState(0);

  React.useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  async function conferir(e: React.FormEvent) {
    e.preventDefault();
    if (carregando) return;
    setErro(null);
    setOk(null);

    if (!/^\d{6}$/.test(codigo)) {
      setErro("digite os 6 números do código.");
      return;
    }

    setCarregando(true);
    const r = await verificarCodigo(dados.email, codigo);
    setCarregando(false);

    if (r.status === "verificado") {
      liberar(); // espelho de UX; o acesso mesmo é o cookie httpOnly
      return aoVerificar();
    }
    if (r.status === "falha") {
      setErro(r.mensagem);
      setPrecisaNovoCodigo(r.motivo === "expirado" || r.motivo === "tentativas_excedidas");
      return;
    }
    setErro(r.mensagem);
  }

  async function reenviar() {
    if (carregando || espera > 0) return;
    setErro(null);
    setOk(null);
    setSemCodigo(null);
    if (SITE_KEY_TURNSTILE && !tokenTurnstile) {
      setErro(MENSAGEM_AGUARDE_TURNSTILE);
      return;
    }
    setCarregando(true);
    const r = await solicitarAcesso(dados, { turnstileToken: tokenTurnstile ?? undefined });
    setCarregando(false);
    if (SITE_KEY_TURNSTILE) {
      // token de uso único: o próximo reenvio precisa de outro
      setTokenTurnstile(null);
      setVersaoTurnstile((v) => v + 1);
    }

    if (r.status === "enviado") {
      setCodigo("");
      setCodigoDev(r.codigoDev);
      setPrecisaNovoCodigo(false);
      setEspera(ESPERA_REENVIO_S);
      setOk("Código novo enviado. Confira seu e-mail.");
      return;
    }
    if (r.status === "recebido_sem_codigo") {
      setSemCodigo(`${r.mensagem} Se o código anterior ainda estiver no prazo, ele continua valendo.`);
      setEspera(ESPERA_REENVIO_S);
      return;
    }
    setErro(r.mensagem);
    if (r.status === "limitado") setEspera(ESPERA_REENVIO_S);
  }

  return (
    <form onSubmit={conferir} noValidate style={{ display: "grid", gap: 16 }}>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700, margin: 0 }}>
        Enviamos um código de 6 dígitos para <strong style={{ color: p.ink }}>{dados.email}</strong>.
        Ele vale por {EXPIRACAO_CODIGO_MIN} minutos. Não chegou? Confira o spam e a aba Promoções.
      </p>

      {codigoDev && (
        <Aviso tipo="info">
          Modo de desenvolvimento (sem e-mail configurado): seu código é{" "}
          <strong style={{ letterSpacing: 2 }}>{codigoDev}</strong>.
        </Aviso>
      )}
      {ok && <Aviso tipo="sucesso">{ok}</Aviso>}
      {semCodigo && <AvisoSemCodigo mensagem={semCodigo} />}
      {erro && <Aviso tipo="erro">{erro}</Aviso>}

      <Campo
        id="acesso-codigo"
        label="Código de verificação"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="000000"
        maxLength={6}
        valor={codigo}
        aoMudar={(v) => setCodigo(v.replace(/\D/g, "").slice(0, 6))}
        autoFocus
        style={{ letterSpacing: 8, fontSize: 20, fontWeight: 700, textAlign: "center" }}
      />

      <BotaoSubmit carregando={carregando} disabled={precisaNovoCodigo}>
        Verificar e entrar
      </BotaoSubmit>

      {SITE_KEY_TURNSTILE && (
        <WidgetTurnstile key={versaoTurnstile} siteKey={SITE_KEY_TURNSTILE} aoMudarToken={setTokenTurnstile} />
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", fontSize: 13.5 }}>
        <button
          type="button"
          onClick={aoVoltar}
          style={{ border: "none", background: "none", padding: 0, color: p.g500, cursor: "pointer", fontSize: 13.5 }}
        >
          Corrigir meus dados
        </button>
        <button
          type="button"
          onClick={reenviar}
          disabled={carregando || espera > 0}
          style={{
            border: "none",
            background: "none",
            padding: 0,
            color: espera > 0 ? p.g500 : p.primary,
            fontWeight: 600,
            cursor: espera > 0 ? "default" : "pointer",
            fontSize: 13.5,
          }}
        >
          {espera > 0 ? `Reenviar código em ${espera}s` : "Reenviar código"}
        </button>
      </div>
    </form>
  );
}
