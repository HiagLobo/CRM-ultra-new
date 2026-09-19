/**
 * Camada de SERVICES — as "costuras" para o backend real.
 *
 * Hoje todas as funções retornam dados de `src/mock-data` como Promise.
 * Quando existir API, basta trocar o corpo de cada função por um `fetch`
 * para `process.env.NEXT_PUBLIC_API_URL` — as telas não mudam, pois já
 * consomem estes contratos assíncronos.
 */
import type { FunilColuna, Imovel, Kpi, Lead } from "@/types";
import {
  IMOVEIS_DESTAQUE,
  IMOVEIS_VENDA,
  IMOVEIS_LOCACAO,
  IMOVEIS_BUSCA,
  CARTEIRA,
  type CarteiraLinha,
} from "@/mock-data/imoveis";
import { LEADS } from "@/mock-data/leads";
import { FUNIL_COLUNAS } from "@/mock-data/negocios";
import { DONO_KPIS, CORRETOR_MINISTATS, type MiniStatData } from "@/mock-data/dashboard";

/** Simula latência de rede mínima e devolve uma cópia dos dados. */
function mock<T>(data: T): Promise<T> {
  return Promise.resolve(data);
}

/* ----------------------- IMÓVEIS ----------------------- */
export function getImoveis(): Promise<Imovel[]> {
  return mock(IMOVEIS_DESTAQUE);
}
export function getImoveisVenda(): Promise<Imovel[]> {
  return mock(IMOVEIS_VENDA);
}
export function getImoveisLocacao(): Promise<Imovel[]> {
  return mock(IMOVEIS_LOCACAO);
}
export function getImoveisBusca(): Promise<Imovel[]> {
  return mock(IMOVEIS_BUSCA);
}
export function getImovel(code: string): Promise<Imovel | undefined> {
  const all = [...IMOVEIS_DESTAQUE, ...IMOVEIS_VENDA, ...IMOVEIS_LOCACAO, ...IMOVEIS_BUSCA];
  return mock(all.find((i) => i.code === code));
}
export function getCarteira(): Promise<CarteiraLinha[]> {
  return mock(CARTEIRA);
}

/* ----------------------- LEADS / FUNIL ----------------------- */
export function getLeads(): Promise<Lead[]> {
  return mock(LEADS);
}
export function getFunil(): Promise<FunilColuna[]> {
  return mock(FUNIL_COLUNAS);
}

/* ----------------------- DASHBOARDS ----------------------- */
export function getDashboardKPIs(): Promise<Kpi[]> {
  return mock(DONO_KPIS);
}
export function getCorretorMiniStats(): Promise<MiniStatData[]> {
  return mock(CORRETOR_MINISTATS);
}
