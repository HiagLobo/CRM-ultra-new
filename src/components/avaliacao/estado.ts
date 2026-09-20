/**
 * Memória do convite para avaliar, no `localStorage` (O10·S2).
 *
 * Guarda **só três coisas**: segundos de demo já navegados, se a pessoa
 * dispensou o convite e se já respondeu. Nenhum dado de pessoa entra aqui —
 * nome, e-mail, CRECI, nota e comentário vivem no servidor, nunca no navegador.
 *
 * Como no `guiaState`, todo acesso é protegido: SSR não tem `window` e o modo
 * privativo pode recusar o storage. Nos dois casos a tela não pode quebrar —
 * perder o estado só faz o convite voltar a contar do zero.
 */
import { segundosValidos } from "./tempoNoDemo";

const CHAVE = "crm_avaliacao"; // prefixo crm_ — padrão de storage da O0

export interface EstadoAvaliacao {
  /** Segundos já navegados no demo, com a aba visível. */
  segundos: number;
  /** Clicou em "Agora não": o convite não volta sozinho. */
  dispensado: boolean;
  /** Já enviou a avaliação: o convite não volta nunca mais. */
  respondido: boolean;
}

const VAZIO: EstadoAvaliacao = { segundos: 0, dispensado: false, respondido: false };

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function lerEstado(): EstadoAvaliacao {
  try {
    const bruto = storage()?.getItem(CHAVE);
    if (!bruto) return { ...VAZIO };
    const dados: unknown = JSON.parse(bruto);
    if (!dados || typeof dados !== "object") return { ...VAZIO };
    const d = dados as Record<string, unknown>;
    return {
      segundos: segundosValidos(d.segundos),
      dispensado: d.dispensado === true,
      respondido: d.respondido === true,
    };
  } catch {
    return { ...VAZIO }; // valor corrompido: trata como primeira visita
  }
}

/** Grava só os três campos conhecidos — nada do que vier de fora passa adiante. */
function gravar(estado: EstadoAvaliacao): void {
  try {
    storage()?.setItem(
      CHAVE,
      JSON.stringify({
        segundos: segundosValidos(estado.segundos),
        dispensado: estado.dispensado === true,
        respondido: estado.respondido === true,
      }),
    );
  } catch {
    // storage cheio/bloqueado: o convite volta a contar do zero na próxima visita
  }
}

/** Salva o tempo navegado (chamado quando a aba some ou a pessoa sai da página). */
export function salvarSegundos(segundos: number): void {
  gravar({ ...lerEstado(), segundos });
}

/** "Agora não": some nesta visita e nas próximas, até o link do Guia reabrir. */
export function marcarDispensado(): void {
  gravar({ ...lerEstado(), dispensado: true });
}

/** Avaliação enviada: o convite não aparece mais. */
export function marcarRespondido(): void {
  gravar({ ...lerEstado(), respondido: true, dispensado: false });
}

/** Link do Guia ("Avaliar o demo"): desfaz a dispensa para o convite poder voltar. */
export function reabrirConvite(): void {
  gravar({ ...lerEstado(), dispensado: false });
}

/** Limpa a memória do convite (reapresentar o demo a alguém). */
export function limparAvaliacao(): void {
  try {
    storage()?.removeItem(CHAVE);
  } catch {
    // nada a fazer: sem storage, não havia memória para limpar
  }
}
