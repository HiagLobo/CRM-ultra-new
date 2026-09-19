"use client";
/**
 * Passo 2 — conferir o código de 6 dígitos.
 * Cada motivo de falha da O1 vira um texto e um caminho de saída: código errado
 * → tentar de novo; expirado ou tentativas esgotadas → reenviar; rate-limit →
 * esperar. Reenviar tem espera própria para não gastar o limite de 3/30min à toa.
 * Reenvio sem e-mail (O7·S1): o contato já está salvo; a tela diz que o código
 * novo não saiu e que um anterior ainda no prazo continua valendo.
 *
 * Cadastro único (O9·S2): o reenvio usa o endpoint do passo de origem (cadastro
 * ou entrar); e-mail que já tinha cadastro ganha o aviso e leva os dados novos
 * no `verify` (`atualizacao`), aplicados só depois do código certo.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { EXPIRACAO_CODIGO_MIN } from "@/features/lead/schema";
import { liberar } from "@/lib/demoAccess";
import { verificarCodigo } from "./api";
import { atualizacaoDoPedido, emailDoPedido, reenviarCodigo, type PedidoCodigo } from "./apiEntrar";
import { Campo, Aviso, AvisoSemCodigo, BotaoSubmit, BotaoTexto } from "./ui";
import { PecasAntiRobo, useAntiRobo, MENSAGEM_AGUARDE_TURNSTILE } from "./AntiRobo";
import { MENSAGEM_EXISTENTE, type CampoNaoAtualizado } from "./mensagens";

/** Espera entre reenvios (o limite real é do servidor: 3 envios / 30 min). */
const ESPERA_REENVIO_S = 60;

export default function StepCodigo({
  pedido,
  codigoDevInicial,
  aoVerificar,
  aoVoltar,
}: {
  pedido: PedidoCodigo;
  codigoDevInicial?: string;
  aoVerificar: (naoAtualizados?: CampoNaoAtualizado[]) => void;
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
  const antiRobo = useAntiRobo();
  const email = emailDoPedido(pedido);

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
      document.getElementById("acesso-codigo")?.focus();
      return;
    }

    setCarregando(true);
    const r = await verificarCodigo(email, codigo, atualizacaoDoPedido(pedido));
    setCarregando(false);

    if (r.status === "verificado") {
      liberar(); // espelho de UX; o acesso mesmo é o cookie httpOnly
      return aoVerificar(r.naoAtualizados);
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
    if (antiRobo.aguardando) {
      setErro(MENSAGEM_AGUARDE_TURNSTILE);
      return;
    }
    setCarregando(true);
    const r = await reenviarCodigo(pedido, antiRobo.sinais);
    setCarregando(false);
    antiRobo.renovar(); // token de uso único: o próximo reenvio precisa de outro

    if (r.status === "enviado") {
      setCodigo("");
      setCodigoDev(r.codigoDev);
      setPrecisaNovoCodigo(false);
      setEspera(ESPERA_REENVIO_S);
      setOk("Código novo enviado. Confira seu e-mail.");
      return;
    }
    if (r.status === "sem_codigo") {
      setSemCodigo(`${r.mensagem} Se o código anterior ainda estiver no prazo, ele continua valendo.`);
      setEspera(ESPERA_REENVIO_S);
      return;
    }
    setErro(r.mensagem);
    if (r.status === "limitado") setEspera(ESPERA_REENVIO_S);
  }

  return (
    <form onSubmit={conferir} noValidate style={{ display: "grid", gap: 16 }}>
      {pedido.tipo === "cadastro" && pedido.existente && <Aviso tipo="info">{MENSAGEM_EXISTENTE}</Aviso>}

      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700, margin: 0, overflowWrap: "anywhere" }}>
        Enviamos um código de 6 dígitos para <strong style={{ color: p.ink }}>{email}</strong>.
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

      <PecasAntiRobo antiRobo={antiRobo} comIsca={false} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", fontSize: 13.5 }}>
        <BotaoTexto discreto onClick={aoVoltar}>
          {pedido.tipo === "entrar" ? "Usar outro e-mail" : "Corrigir meus dados"}
        </BotaoTexto>
        <BotaoTexto onClick={reenviar} disabled={carregando || espera > 0}>
          {espera > 0 ? `Reenviar código em ${espera}s` : "Reenviar código"}
        </BotaoTexto>
      </div>
    </form>
  );
}
