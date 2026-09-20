/**
 * Orçamento de EXEMPLO, só para conferir a folha e a impressão em A4 enquanto a
 * API da trilha A não existe. Abre em `/admin/orcamento/exemplo` e **só em
 * desenvolvimento** (ver `DocumentoOrcamento`): em produção o id "exemplo" vai
 * para a API como qualquer outro e cai na tela de "não existe".
 *
 * O cliente é a rede fictícia do demo e o número é `ORC-EXEMPLO`, para ninguém
 * confundir com proposta de verdade. Os **preços seguem a tabela oficial da
 * onda** (rede com 12 assentos na escada, implantação de rede com 6 unidades,
 * excedentes de R$ 1,50 · R$ 4,90 · R$ 2,90 · R$ 0,90): exemplo que contradiz a
 * tabela ensina errado a quem está conferindo a folha.
 */
import { demo, emailDemo } from "@/config/demo";
import type { Orcamento } from "./tiposOrcamento";

export const ORCAMENTO_EXEMPLO: Orcamento = {
  id: "exemplo",
  numero: "ORC-EXEMPLO",
  situacao: "rascunho",
  situacaoRotulo: "Rascunho",
  criadoEm: "2026-09-20",
  validoAte: "2026-10-05",
  cliente: { nome: demo.nome, email: emailDemo("contato"), telefone: demo.telefone },
  publico: "rede",
  publicoRotulo: "Rede de imobiliárias",
  unidades: 6,
  assentos: [
    { codigo: "pro", nivel: "Pro", faixa: "1o e 2o assento", quantidade: 2, precoUnitario: 179, total: 358 },
    { codigo: "pro", nivel: "Pro", faixa: "3o ao 9o assento", quantidade: 7, precoUnitario: 139, total: 973 },
    { codigo: "ultra", nivel: "Ultra", faixa: "10o ao 29o assento", quantidade: 3, precoUnitario: 189, total: 567 },
  ],
  extras: [{ item: "treinamento", rotulo: "Turma extra de treinamento", quantidade: 1, precoUnitario: 690, total: 690 }],
  // rede: R$ 11.900 na matriz + R$ 990 por unidade ativada (6 unidades)
  implantacao: { total: 17840, entrada: 8920, saldo: 8920, entradaPct: 50 },
  totais: { mensal: 1898, anual: 22776 },
  anual: false,
  descontoPct: 0,
  condicaoFundador: false,
  inclusos: {
    pro: [
      "Funil, agenda e ficha do cliente por assento.",
      "Atendimento de IA no WhatsApp da imobiliária.",
      "Exportação da carteira em planilha.",
    ],
    ultra: [
      "Tudo do nível Pro.",
      "Radar de oportunidades, com consulta por assento.",
      "Avaliação de imóvel com os comparáveis da própria carteira.",
      "Baixa automática de pagamento na conta.",
    ],
  },
  franquias: [
    { rotulo: "Atendimentos de IA", incluso: "25 por assento/mês", excedente: "R$ 1,50 por atendimento" },
    { rotulo: "Reuniões transcritas", incluso: "2 por assento/mês", excedente: "R$ 4,90 por reunião" },
    { rotulo: "Consultas de Radar (nível Ultra)", incluso: "8 por assento/mês", excedente: "R$ 2,90 por consulta" },
    { rotulo: "Baixas automáticas (nível Ultra)", incluso: "300 por conta/mês", excedente: "R$ 0,90 por baixa" },
  ],
  observacao: "Documento de exemplo, para conferir o desenho da folha antes de gerar a primeira proposta.",
};
