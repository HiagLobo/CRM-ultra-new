/**
 * Orçamento de EXEMPLO, só para conferir a folha e a impressão em A4 enquanto a
 * API da trilha A não existe. Abre em `/admin/orcamento/exemplo` e **só em
 * desenvolvimento** (ver `DocumentoOrcamento`): em produção o id "exemplo" vai
 * para a API como qualquer outro e cai na tela de "não existe".
 *
 * Tudo aqui é inventado e se declara inventado: o cliente é a rede fictícia do
 * demo e o número da proposta é `ORC-EXEMPLO`. Nenhum valor sai da tabela real.
 */
import { demo, emailDemo } from "@/config/demo";
import type { Orcamento } from "./tiposOrcamento";

export const ORCAMENTO_EXEMPLO: Orcamento = {
  id: "exemplo",
  numero: "ORC-EXEMPLO",
  situacao: "rascunho",
  criadoEm: "2026-09-20",
  validoAte: "2026-10-05",
  cliente: { nome: demo.nome, email: emailDemo("contato"), telefone: demo.telefone },
  publico: "rede",
  unidades: 6,
  assentos: [
    { nivel: "pro", faixa: "1o e 2o assento", quantidade: 2, precoUnitario: 200, total: 400 },
    { nivel: "pro", faixa: "3o ao 9o assento", quantidade: 7, precoUnitario: 160, total: 1120 },
    { nivel: "ultra", faixa: "3o ao 9o assento", quantidade: 3, precoUnitario: 260, total: 780 },
  ],
  extras: [{ rotulo: "Turma extra de treinamento", quantidade: 1, precoUnitario: 700, total: 700 }],
  totais: { mensal: 3000, anual: 30000, implantacao: 12000, economiaAnual: 6000 },
  anual: true,
  descontoPct: 0,
  condicaoFundador: true,
  inclusos: {
    pro: [
      "Funil, agenda e ficha do cliente por assento.",
      "Atendimento de IA no WhatsApp da imobiliária.",
      "Exportação da carteira em planilha, quando quiser.",
    ],
    ultra: [
      "Tudo do nível Pro.",
      "Radar de oportunidades, com consulta por assento.",
      "Avaliação de imóvel com os comparáveis da própria carteira.",
      "Baixa automática de pagamento na conta.",
    ],
  },
  franquias: [
    { rotulo: "Atendimentos de IA", incluso: "25 por assento/mês", excedente: "R$ 1,60 por atendimento" },
    { rotulo: "Reuniões transcritas", incluso: "2 por assento/mês", excedente: "R$ 5,00 por reunião" },
    { rotulo: "Consultas de Radar (Ultra)", incluso: "8 por assento/mês", excedente: "R$ 3,00 por consulta" },
  ],
  observacao: "Documento de exemplo, para conferir o desenho da folha antes de gerar a primeira proposta.",
};
