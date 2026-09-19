/**
 * Identidade FICTÍCIA do demo — a rede de imobiliárias que "usa" o CRM nas telas
 * de exemplo (painéis e site de exemplo).
 *
 * `brand` (config/brand.ts) é a empresa real que vende o CRM.
 * `demo` é o cliente de mentira dentro do demo. Nunca misturar os dois: nada aqui
 * pode ser nome, contato, CNPJ ou domínio de alguém real — e a empresa real nunca
 * faz papel de imobiliária nas telas.
 */
export const demo = {
  /** Nome da rede do demo — se declara fictícia de propósito. */
  nome: "Rede Exemplo Imóveis",
  nomeCurto: "Rede Exemplo",
  /** Monograma para avatares/logos do demo. */
  sigla: "RE",
  /**
   * Domínio reservado para exemplos (RFC 2606): nunca resolve e ninguém pode
   * registrá-lo — um link ou e-mail do demo jamais cai em terceiro.
   */
  dominio: "rede-exemplo.example",
  /** Contato visivelmente fictício. */
  telefone: "(11) 90000-0000",
} as const;

/** E-mail fictício no domínio do demo (ex.: `emailDemo("marina")`). */
export function emailDemo(usuario: string): string {
  return `${usuario}@${demo.dominio}`;
}

/** URL fictícia no domínio do demo (ex.: `urlDemo("/corretores/ana")`). */
export function urlDemo(caminho = ""): string {
  return `https://${demo.dominio}${caminho}`;
}
