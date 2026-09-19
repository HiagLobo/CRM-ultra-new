/**
 * Os 4 cards do topo, coerentes com o funil: Hoje · Em andamento · Clientes ·
 * Conversão. Contados no cliente, sobre a lista carregada, com a MESMA conta do
 * servidor (`calcularResumo`) — a busca não mexe neles. Puro, para o teste.
 */
import { calcularResumo, type LeadAdmin } from "@/features/lead/admin";
import type { Aba } from "./filtroLeads";
import { motivoHoje } from "./hoje";

export interface CardTopo {
  chave: "hoje" | "andamento" | "clientes" | "conversao";
  rotulo: string;
  valor: string;
  detalhe: string;
  /** Clicar no card abre esta aba (quando há uma aba que é exatamente o card). */
  aba?: Aba;
}

const PCT = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export function cardsDoTopo(leads: ReadonlyArray<LeadAdmin>, agora: Date): CardTopo[] {
  const resumo = calcularResumo(leads);
  const hoje = leads.filter((l) => motivoHoje(l, agora) !== null).length;
  const palavra = resumo.total === 1 ? "lead" : "leads";
  return [
    {
      chave: "hoje",
      rotulo: "Para hoje",
      valor: String(hoje),
      detalhe: hoje ? "ações, retornos e novos parados" : "tudo em dia",
      aba: "hoje",
    },
    {
      chave: "andamento",
      rotulo: "Em andamento",
      valor: String(resumo.emAndamento),
      detalhe: "contato, demonstração ou negociação",
    },
    {
      chave: "clientes",
      rotulo: "Clientes",
      valor: String(resumo.clientes),
      detalhe: `de ${resumo.total} ${palavra}`,
      aba: "cliente",
    },
    {
      chave: "conversao",
      rotulo: "Conversão",
      valor: `${PCT.format(resumo.conversaoPct)}%`,
      detalhe: "leads que viraram cliente",
    },
  ];
}
