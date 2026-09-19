import type { FunilColuna } from "@/types";
import { palette } from "@/lib/palette";

/** Colunas do funil de vendas (kanban da área do corretor). */
export const FUNIL_COLUNAS: FunilColuna[] = [
  {
    id: "novo", name: "Novo", color: palette.g500, cards: [
      { id: "k1", client: "Marina Reis", prop: "Apto Vila Mariana", code: "48199", value: 540000, temp: "morno" },
      { id: "k2", client: "Paulo Tavares", prop: "Studio República", code: "47980", value: 420000, temp: "frio" },
    ],
  },
  {
    id: "contato", name: "Contato", color: "#3E82E0", cards: [
      { id: "k3", client: "Helena Dias", prop: "Cobertura Pinheiros", code: "48213", value: 850000, temp: "quente" },
    ],
  },
  {
    id: "visita", name: "Visita", color: palette.warning, cards: [
      { id: "k4", client: "Rafael Lima", prop: "Casa Cotia", code: "48087", value: 1250000, temp: "quente" },
      { id: "k5", client: "Bruna Alves", prop: "Apto Moema", code: "47865", value: 690000, temp: "morno" },
    ],
  },
  {
    id: "proposta", name: "Proposta", color: palette.primary, cards: [
      { id: "k6", client: "Diego Souza", prop: "Casa Granja Viana", code: "47712", value: 980000, temp: "quente" },
    ],
  },
  {
    id: "negociacao", name: "Negociação", color: palette.light, cards: [
      { id: "k7", client: "Camila Nunes", prop: "Apto Tatuapé", code: "49008", value: 620000, temp: "quente" },
    ],
  },
  {
    id: "fechado", name: "Fechado / Perdido", color: palette.success, cards: [
      { id: "k8", client: "Otávio Pires", prop: "Cobertura Itaim", code: "48977", value: 2100000, temp: "quente" },
    ],
  },
];
