/**
 * CRECI — normalização antes da validação (O7·S3).
 *
 * O corretor digita do jeito que está no cartão ou na assinatura de e-mail:
 * "CRECI-PE 12.345-F", "CRECI 12345", "12345/SP", "J-12345"... A regex rígida de
 * antes travava esses formatos no primeiro campo (e ainda aceitava lixo como "ab123_").
 * Aqui tudo vira uma forma canônica `[UF ]NÚMERO[-SUFIXO]` — ex.: "PE 12345-F" —,
 * que é o valor gravado no lead.
 *
 * Client-safe (puro, sem dependências): o formulário e a rota normalizam igual,
 * e normalizar de novo o valor já normalizado não muda nada (idempotente).
 */

/** Exemplo mostrado ao corretor quando o CRECI não é reconhecido. */
export const EXEMPLO_CRECI = "PE 12345-F";

export const MENSAGEM_CRECI_INVALIDO = `CRECI inválido (ex.: ${EXEMPLO_CRECI})`;

/** As 27 UFs — cada conselho regional emite o próprio CRECI. */
const UFS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

/**
 * Sufixo de categoria → forma canônica: F (pessoa física), J (jurídica),
 * E (estagiário). "PF"/"PJ" são a grafia longa de F/J.
 */
const SUFIXOS = new Map([
  ["F", "F"],
  ["J", "J"],
  ["E", "E"],
  ["PF", "F"],
  ["PJ", "J"],
]);

/** Número do registro: 2 a 7 dígitos (regionais menores têm números curtos). */
const NUMERO = /^\d{2,7}$/;

/** Só letras, dígitos e os separadores que aparecem de verdade; o resto é lixo. */
const SO_PERMITIDOS = /^[A-Z0-9\s\-/:()]*$/;

/**
 * Devolve o CRECI na forma canônica, ou `null` se não der para reconhecer.
 * UF antes ou depois do número, sufixo com ou sem hífen, prefixo "J-", pontos
 * de milhar e o rótulo "CRECI"/"Nº" são aceitos; UF inexistente, dois números
 * ou texto sem dígitos, não.
 */
export function normalizarCreci(bruto: string): string | null {
  const texto = bruto
    .toUpperCase()
    .replace(/CRECI/g, " ") // o rótulo, colado ou não ("CRECI-PE", "CRECI/SP")
    .replace(/N[º°]/g, " ") // "nº 12345"
    .replace(/\./g, ""); // ponto de milhar: "12.345"
  if (!SO_PERMITIDOS.test(texto)) return null;

  let numero: string | undefined;
  let uf: string | undefined;
  let sufixo: string | undefined;
  for (const parte of texto.match(/[A-Z]+|\d+/g) ?? []) {
    if (/^\d/.test(parte)) {
      if (numero !== undefined) return null; // dois números: não sabemos qual é o registro
      numero = parte;
    } else if (UFS.has(parte)) {
      if (uf !== undefined && uf !== parte) return null;
      uf = parte;
    } else if (SUFIXOS.has(parte)) {
      const canonico = SUFIXOS.get(parte);
      if (sufixo !== undefined && sufixo !== canonico) return null;
      sufixo = canonico;
    } else {
      return null; // letra que não é UF nem categoria
    }
  }

  if (numero === undefined || !NUMERO.test(numero)) return null;
  return `${uf ? `${uf} ` : ""}${numero}${sufixo ? `-${sufixo}` : ""}`;
}
