/**
 * Tipos das entidades principais do domínio CRM Imobiliário Ultra.
 * Servem de contrato para a camada de services (mock hoje, API real depois).
 */

export type Perfil = "ceo" | "corretor" | "franqueado";

export type Temperatura = "quente" | "morno" | "frio";

export interface Sessao {
  perfil: Perfil;
  nome: string;
  email: string;
}

/** Card de imóvel exibido em listagens (home, busca, carteira). */
export interface Imovel {
  code: string;
  price: string;
  title: string;
  location: string;
  beds: number;
  baths: number;
  area: number;
  tag?: string;
  /** backgrounds CSS da galeria (foto + gradientes de fallback) */
  photos?: string[];
  fav?: boolean;
}

/** Lead recebido por um corretor. */
export interface Lead {
  id?: string;
  name: string;
  interest: string;
  origin: string;
  temp: Temperatura;
  wait: string;
}

/** Card de negócio no funil (kanban). */
export interface Negocio {
  id: string;
  client: string;
  prop: string;
  code: string;
  value: number;
  temp: Temperatura;
}

/** Coluna do funil de vendas. */
export interface FunilColuna {
  id: string;
  name: string;
  color: string;
  cards: Negocio[];
}

/** Corretor associado à rede (visão do CEO). */
export interface Corretor {
  id: string;
  nome: string;
  cidade: string;
  ativo: boolean;
  vendasMes: number;
}

/** KPI genérico para dashboards. */
export interface Kpi {
  label: string;
  value: string;
  sub: string;
  delta: string;
  up: boolean;
  icon: string;
  highlight?: boolean;
}

/** Linha da tabela "Meus imóveis" do corretor. */
export interface ImovelLinha {
  code: string;
  titulo: string;
  valor: string;
  status: string;
}
