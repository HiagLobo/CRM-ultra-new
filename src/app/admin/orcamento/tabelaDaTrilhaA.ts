/**
 * Ponte única com a tabela oficial (`src/features/orcamento/tabela.ts`, trilha A).
 *
 * Nenhum preço é escrito aqui, nem no documento: tudo nasce na tabela. O que
 * está incluso em cada nível e as franquias de uso chegam pelo orçamento, que
 * grava o texto vigente na emissão, pela mesma regra do preço do dia (00-PLANO:
 * "mudar a tabela depois não altera orçamento já emitido").
 *
 * Na branch da trilha B a tabela ainda não existe. Ao mesclar a trilha A, quem
 * quiser ler a tabela viva em vez do que ficou gravado troca só o corpo destas
 * duas funções por:
 *   import { INCLUSOS_POR_NIVEL, FRANQUIAS } from "@/features/orcamento/tabela";
 * O resto do documento não muda.
 */
import type { Franquia, Nivel, Orcamento } from "./tiposOrcamento";

/**
 * O que está incluso no nível contratado, em lista curta. Lista vazia não vira
 * bloco vazio: a conferência (`problemasDoOrcamento`) recusa o documento antes.
 */
export function inclusosDoNivel(orcamento: Orcamento, nivel: Nivel): string[] {
  const lista = orcamento.inclusos[nivel];
  return Array.isArray(lista) ? lista.filter((linha) => linha.trim() !== "") : [];
}

/** Franquias de uso e o preço do excedente (o schema já exige pelo menos uma). */
export function franquiasDoOrcamento(orcamento: Orcamento): Franquia[] {
  return orcamento.franquias;
}
