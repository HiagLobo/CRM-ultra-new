/**
 * DDD → UF (O9). Pré-escolhe o estado do CRECI pelo WhatsApp no cadastro e dá a
 * UF "provável" de um CRECI antigo sem UF no painel. É palpite: o corretor pode
 * atuar em outro estado — por isso a tela deixa trocar.
 *
 * Client-safe (puro, sem dependências).
 */
import type { Uf } from "./creci";

const DDD_POR_UF: Record<Uf, readonly number[]> = {
  AC: [68], AL: [82], AM: [92, 97], AP: [96], BA: [71, 73, 74, 75, 77], CE: [85, 88],
  DF: [61], ES: [27, 28], GO: [62, 64], MA: [98, 99], MG: [31, 32, 33, 34, 35, 37, 38],
  MS: [67], MT: [65, 66], PA: [91, 93, 94], PB: [83], PE: [81, 87], PI: [86, 89],
  PR: [41, 42, 43, 44, 45, 46], RJ: [21, 22, 24], RN: [84], RO: [69], RR: [95],
  RS: [51, 53, 54, 55], SC: [47, 48, 49], SE: [79], SP: [11, 12, 13, 14, 15, 16, 17, 18, 19], TO: [63],
};

const UF_POR_DDD: ReadonlyMap<number, Uf> = new Map(
  (Object.entries(DDD_POR_UF) as [Uf, readonly number[]][]).flatMap(([uf, ddds]) => ddds.map((d) => [d, uf] as const)),
);

/** UF do DDD (11–99); `undefined` se o DDD não existe. */
export function ufPorDdd(ddd: number): Uf | undefined {
  return UF_POR_DDD.get(ddd);
}

/**
 * UF pelo telefone — aceita E.164 (`+5581…`) ou o que a pessoa digitou
 * (`(81) 9…`). Sem DDD reconhecível → `undefined`.
 */
export function ufPorTelefone(telefone: string): Uf | undefined {
  let digitos = telefone.replace(/\D/g, "");
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) digitos = digitos.slice(2);
  if (digitos.length < 2) return undefined;
  return ufPorDdd(Number(digitos.slice(0, 2)));
}
