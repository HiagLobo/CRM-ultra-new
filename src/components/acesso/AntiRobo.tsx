"use client";
/**
 * Peças anti-robô do fluxo de acesso (O7·S1).
 *
 * - `CampoIsca` (honeypot): fora da tela — não `display:none`, que robô pula —,
 *   fora do Tab, escondido do leitor de tela e sem autopreenchimento. Gente não
 *   vê; robô de formulário preenche, e o servidor finge sucesso sem gravar nada.
 *   O nome do campo NÃO é semântico ("website", "url"…): o preenchimento de
 *   identidade de gerenciador de senha poria um site ali, e a pessoa de verdade
 *   levaria um sucesso falso. No JSON, a chave continua `website`.
 * - `WidgetTurnstile`: Cloudflare Turnstile, só quando a chave pública veio no
 *   build. O script oficial é carregado sob demanda, uma vez por página, e o
 *   widget só aparece se a Cloudflare pedir interação.
 * - `useAntiRobo` + `PecasAntiRobo` (O9·S2): o estado das duas peças, igual nos
 *   passos que pedem código (cadastro, Entrar e reenvio).
 *
 * Nada aqui vai para o console; erro de carregamento vira aviso na tela.
 */
import * as React from "react";
import { AvisoErro } from "./ui";
import type { AntiRobo } from "./api";

/** Chave pública do Turnstile, inlinada no build (NEXT_PUBLIC_). Ausente = widget desligado. */
export const SITE_KEY_TURNSTILE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || undefined;

/** Clicou antes de o Turnstile devolver o token (leva ~1 s). */
export const MENSAGEM_AGUARDE_TURNSTILE =
  "aguarde a verificação de segurança terminar (leva um segundo) e tente de novo.";

// sem a verificação o pedido não sai (fail-closed): a tela oferece o WhatsApp junto
const ERRO_SCRIPT =
  "Não deu para carregar a verificação de segurança (bloqueador de anúncios ou conexão?). Recarregue a página ou fale com a gente.";
const ERRO_WIDGET = "A verificação de segurança falhou. Recarregue a página ou fale com a gente.";

/** Nome do campo-isca: nada que um preenchimento automático reconheça. */
export const NOME_CAMPO_ISCA = "acesso_isca";

export function CampoIsca({ valor, aoMudar }: { valor: string; aoMudar: (v: string) => void }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: -10_000, top: "auto", width: 1, height: 1, overflow: "hidden" }}>
      <label htmlFor="acesso-isca">Deixe em branco</label>
      <input
        id="acesso-isca"
        name={NOME_CAMPO_ISCA}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        // gerenciadores de senha: 1Password, LastPass, Bitwarden, Dashlane
        data-1p-ignore=""
        data-lpignore="true"
        data-bwignore=""
        data-form-type="other"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
      />
    </div>
  );
}

/** O pedaço da API do Turnstile que usamos (render explícito). */
interface ApiTurnstile {
  render(alvo: HTMLElement, opcoes: Record<string, unknown>): string | undefined;
  remove(id: string): void;
}

declare global {
  interface Window {
    turnstile?: ApiTurnstile;
  }
}

const URL_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let carregamento: Promise<ApiTurnstile> | null = null;

/** Carrega o script oficial uma vez; se falhar, a próxima montagem tenta de novo. */
function carregarTurnstile(): Promise<ApiTurnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  carregamento ??= new Promise<ApiTurnstile>((resolver, rejeitar) => {
    const script = document.createElement("script");
    script.src = URL_SCRIPT;
    script.async = true;
    const falhar = () => {
      carregamento = null;
      script.remove();
      rejeitar(new Error("turnstile indisponível"));
    };
    script.onload = () => (window.turnstile ? resolver(window.turnstile) : falhar());
    script.onerror = falhar;
    document.head.appendChild(script);
  });
  return carregamento;
}

/**
 * Widget do Turnstile. Entrega o token por `aoMudarToken` (null quando expira ou
 * falha). O token é de uso único: para pedir outro, remonte com uma `key` nova.
 */
export function WidgetTurnstile({
  siteKey,
  aoMudarToken,
}: {
  siteKey: string;
  aoMudarToken: (token: string | null) => void;
}) {
  const alvo = React.useRef<HTMLDivElement>(null);
  const aoMudar = React.useRef(aoMudarToken);
  aoMudar.current = aoMudarToken;
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    let vivo = true;
    let id: string | undefined;
    carregarTurnstile()
      .then((api) => {
        if (!vivo || !alvo.current) return;
        id = api.render(alvo.current, {
          sitekey: siteKey,
          language: "pt-br",
          appearance: "interaction-only",
          // celular estreito: o formato compacto cabe; o normal tem 300px fixos
          size: alvo.current.clientWidth < 300 ? "compact" : "flexible",
          callback: (token: string) => {
            setErro(null);
            aoMudar.current(token);
          },
          "expired-callback": () => aoMudar.current(null),
          "error-callback": () => {
            aoMudar.current(null);
            setErro(ERRO_WIDGET);
            return true; // tratado: vira aviso na tela
          },
        });
      })
      .catch(() => {
        if (vivo) setErro(ERRO_SCRIPT);
      });
    return () => {
      vivo = false;
      if (id) window.turnstile?.remove(id);
    };
  }, [siteKey]);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div ref={alvo} />
      {erro && <AvisoErro mensagem={erro} whatsapp />}
    </div>
  );
}

/**
 * Estado anti-robô de um formulário (O9·S2): isca, token do Turnstile e a troca
 * do token depois de cada resposta (é de uso único). Cadastro, Entrar e o
 * reenvio do código usam o mesmo.
 */
export function useAntiRobo() {
  const [isca, setIsca] = React.useState("");
  const [token, setToken] = React.useState<string | null>(null);
  const [versao, setVersao] = React.useState(0);
  const sinais: AntiRobo = { website: isca, turnstileToken: token ?? undefined };
  return {
    /** Clicou antes de o Turnstile devolver o token (leva ~1 s). */
    aguardando: !!SITE_KEY_TURNSTILE && !token,
    sinais,
    /** Depois de usar o token, pede outro (remonta o widget). */
    renovar: () => {
      if (!SITE_KEY_TURNSTILE) return;
      setToken(null);
      setVersao((v) => v + 1);
    },
    isca: { valor: isca, aoMudar: setIsca },
    turnstile: { versao, aoMudarToken: setToken },
  };
}

/** Isca (quando o formulário tem) + widget do Turnstile (quando ligado no build). */
export function PecasAntiRobo({ antiRobo, comIsca = true }: { antiRobo: ReturnType<typeof useAntiRobo>; comIsca?: boolean }) {
  return (
    <>
      {comIsca && <CampoIsca valor={antiRobo.isca.valor} aoMudar={antiRobo.isca.aoMudar} />}
      {SITE_KEY_TURNSTILE && (
        <WidgetTurnstile key={antiRobo.turnstile.versao} siteKey={SITE_KEY_TURNSTILE} aoMudarToken={antiRobo.turnstile.aoMudarToken} />
      )}
    </>
  );
}
