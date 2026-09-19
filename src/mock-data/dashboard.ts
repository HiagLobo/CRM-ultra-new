import type { Kpi } from "@/types";

/** KPIs da "Visão geral" do CEO (painel do dono). */
export const DONO_KPIS: Kpi[] = [
  { label: "VGV (Vendas)", value: "R$ 48,2M", sub: "vs. maio", delta: "12%", up: true, icon: "trending-up", highlight: true },
  { label: "VGL (Locações)", value: "R$ 6,8M", sub: "vs. maio", delta: "8%", up: true, icon: "key-round" },
  { label: "Corretores ativos", value: "342", sub: "este mês", delta: "18", up: true, icon: "users" },
  { label: "Imóveis na carteira", value: "2.184", sub: "vs. maio", delta: "124", up: true, icon: "building-2" },
  { label: "Leads (mês)", value: "8.640", sub: "vs. maio", delta: "22%", up: true, icon: "inbox" },
  { label: "Taxa de conversão", value: "4,8%", sub: "lead → venda", delta: "0,6 pp", up: true, icon: "target" },
];

/** Mini-indicadores do topo do "Meu dia" (corretor). */
export interface MiniStatData {
  icon: string;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}
export const CORRETOR_MINISTATS: MiniStatData[] = [
  { icon: "inbox", label: "Leads novos", value: "4", sub: "para contatar hoje", accent: true },
  { icon: "list-checks", label: "Tarefas de hoje", value: "6", sub: "2 já concluídas" },
  { icon: "calendar", label: "Próximas visitas", value: "3", sub: "a primeira às 14h" },
];
