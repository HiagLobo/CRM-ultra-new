/**
 * Memória do guia do demo (localStorage): que painel já teve boas-vindas e se o
 * banner foi fechado. É só conforto de UX — nada aqui protege nem identifica
 * ninguém, e perder o estado só faz a orientação aparecer de novo.
 *
 * Todo acesso é protegido: SSR não tem `window` e o modo privativo pode recusar
 * o storage — em nenhum dos dois casos a tela pode quebrar.
 */
import type { Painel } from "../content/guia";

const CHAVE_VISTOS = "crm_guia_vistos"; // prefixo crm_ — padrão de storage da O0
const CHAVE_BANNER = "crm_guia_banner";
const CHAVE_DRAWER = "crm_guia_drawer";
const CHAVE_TOURS = "crm_guia_tours";

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function lerVistos(): string[] {
  try {
    const bruto = storage()?.getItem(CHAVE_VISTOS);
    const dados: unknown = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(dados) ? dados.filter((d): d is string => typeof d === "string") : [];
  } catch {
    return []; // valor corrompido: trata como "nunca viu" em vez de quebrar
  }
}

/** O visitante já recebeu as boas-vindas deste painel? */
export function jaViu(painel: Painel): boolean {
  return lerVistos().includes(painel);
}

export function marcarVisto(painel: Painel): void {
  try {
    const vistos = lerVistos();
    if (vistos.includes(painel)) return;
    storage()?.setItem(CHAVE_VISTOS, JSON.stringify([...vistos, painel]));
  } catch {
    // sem storage: as boas-vindas voltam na próxima visita, e tudo bem
  }
}

export function bannerOculto(): boolean {
  try {
    return storage()?.getItem(CHAVE_BANNER) === "oculto";
  } catch {
    return false;
  }
}

export function ocultarBanner(): void {
  try {
    storage()?.setItem(CHAVE_BANNER, "oculto");
  } catch {
    // idem: o banner volta na próxima visita
  }
}

/** O drawer do guia estava aberto na última vez? (padrão: fechado) */
export function guiaAberto(): boolean {
  try {
    return storage()?.getItem(CHAVE_DRAWER) === "aberto";
  } catch {
    return false;
  }
}

export function definirGuiaAberto(aberto: boolean): void {
  try {
    storage()?.setItem(CHAVE_DRAWER, aberto ? "aberto" : "fechado");
  } catch {
    // sem storage: o guia volta fechado na próxima tela
  }
}

/** Tours já concluídos ou pulados, por rota. */
function lerTours(): string[] {
  try {
    const bruto = storage()?.getItem(CHAVE_TOURS);
    const dados: unknown = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(dados) ? dados.filter((d): d is string => typeof d === "string") : [];
  } catch {
    return [];
  }
}

/** O tour desta tela já rodou? Concluído ou pulado — nos dois casos não insiste. */
export function tourVisto(rota: string): boolean {
  return lerTours().includes(rota);
}

export function marcarTourVisto(rota: string): void {
  try {
    const vistos = lerTours();
    if (vistos.includes(rota)) return;
    storage()?.setItem(CHAVE_TOURS, JSON.stringify([...vistos, rota]));
  } catch {
    // sem storage: o tour volta na próxima visita, e tudo bem
  }
}

/** Esquece um tour para poder refazê-lo pelo guia. */
export function esquecerTour(rota: string): void {
  try {
    storage()?.setItem(CHAVE_TOURS, JSON.stringify(lerTours().filter((r) => r !== rota)));
  } catch {
    // nada a fazer
  }
}

/** Limpa a memória do guia (útil para reapresentar o demo a alguém). */
export function limparGuia(): void {
  try {
    storage()?.removeItem(CHAVE_VISTOS);
    storage()?.removeItem(CHAVE_BANNER);
    storage()?.removeItem(CHAVE_DRAWER);
    storage()?.removeItem(CHAVE_TOURS);
  } catch {
    // nada a fazer
  }
}
