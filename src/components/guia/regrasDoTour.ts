/**
 * Regras do tour guiado que não dependem de tela: quando começar, para onde
 * andar, que tecla vale e quando o tour conta como visto.
 *
 * Funções puras de propósito — cada uma já foi um defeito real (tour do
 * Atendimento descartado antes de a tela carregar, Enter no campo de mensagem
 * avançando o tour), e assim dá para provar a correção sem navegador.
 */

/** Por que o tour fechou. Só `sem-alvo` não conta como visto. */
export type MotivoSaida = "concluiu" | "pulou" | "sem-alvo";

/**
 * Pular também marca como visto (insistir com quem dispensou é incômodo); já
 * "não achei nada para mostrar" não: a pessoa não viu tour nenhum, e na próxima
 * visita a tela pode já estar pronta.
 */
export function marcaComoVisto(motivo: MotivoSaida | undefined): boolean {
  return motivo !== "sem-alvo";
}

/** Teto de espera pelos alvos: telas com carregamento simulado levam ~850 ms. */
export const ESPERA_MAXIMA_MS = 3000;
/** Sem alvo novo há este tempo, a tela assentou — dá para começar com o que há. */
export const ESPERA_ESTAVEL_MS = 600;

export type DecisaoDeEspera = "esperar" | "abrir" | "desistir";

/**
 * O tour abre 450 ms após a tela montar, mas o Atendimento ainda mostra o
 * esqueleto até os 850 ms. Em vez de congelar os alvos nesse instante (e
 * desistir), espera: abre quando todos aparecem, quando o que apareceu parou de
 * mudar, ou no teto — e só desiste se no teto não houver alvo nenhum.
 */
export function decidirEspera(e: {
  presentes: number;
  total: number;
  decorridoMs: number;
  estavelHaMs: number;
}): DecisaoDeEspera {
  if (e.total > 0 && e.presentes >= e.total) return "abrir";
  if (e.decorridoMs >= ESPERA_MAXIMA_MS) return e.presentes > 0 ? "abrir" : "desistir";
  if (e.presentes > 0 && e.estavelHaMs >= ESPERA_ESTAVEL_MS) return "abrir";
  return "esperar";
}

/**
 * Próximo passo a mostrar, olhando os alvos disponíveis AGORA (a tela muda
 * enquanto o tour roda: um menu abre, uma lista termina de carregar).
 * `disponiveis` são índices de passo em ordem crescente; `null` = não há.
 */
export function passoVizinho(disponiveis: number[], atual: number, direcao: 1 | -1): number | null {
  if (direcao === 1) return disponiveis.find((i) => i > atual) ?? null;
  const anteriores = disponiveis.filter((i) => i < atual);
  return anteriores.length ? anteriores[anteriores.length - 1] : null;
}

export type AcaoDeTecla = "avancar" | "voltar" | "sair" | null;

/** Elementos em que Enter e setas já significam outra coisa. */
const INTERATIVOS = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"]);

/**
 * O teclado do tour não sequestra quem está digitando: Enter no campo de
 * mensagem envia a mensagem, e Enter no botão "Pular" só pula (antes avançava
 * e depois pulava). Com modificador (Alt+← é "voltar" do navegador) também não.
 */
export function acaoDaTecla(
  tecla: string,
  foco: { tag: string; editavel: boolean; modificador: boolean },
): AcaoDeTecla {
  if (foco.modificador) return null;
  if (tecla === "Escape") return "sair";
  if (foco.editavel || INTERATIVOS.has(foco.tag.toUpperCase())) return null;
  if (tecla === "ArrowRight" || tecla === "Enter") return "avancar";
  if (tecla === "ArrowLeft") return "voltar";
  return null;
}
