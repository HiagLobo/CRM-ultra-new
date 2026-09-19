/**
 * Rate-limit por chave (janela deslizante).
 *
 * Duas implementações atrás da mesma porta: `MemoriaRateLimiter` (por processo,
 * bom para dev e teste) e `PostgresRateLimiter` (compartilhado entre todas as
 * instâncias — o único que vale em serverless, onde cada lambda teria o seu
 * contador e o limite se multiplicaria pelo número de instâncias).
 *
 * A interface é **assíncrona** porque o limitador de produção fala com o banco.
 * Relógio injetável (testes).
 */
export interface RegraRate {
  /** Máximo de eventos permitidos dentro da janela. */
  max: number;
  /** Tamanho da janela em milissegundos. */
  janelaMs: number;
}

/** Uma chave com a sua própria regra (ex.: e-mail 3/30 min e IP 10/30 min). */
export interface LimiteChave {
  chave: string;
  regra: RegraRate;
}

export interface RateLimiter {
  /**
   * Registra um evento em TODAS as `chaves` (ex.: ["email:x", "ip:y"]) e retorna
   * true. Se QUALQUER chave já estourou a regra, retorna false **sem registrar
   * nada** — checagem e registro são atômicos, então barrar por uma chave não
   * consome o limite das outras.
   */
  permitir(chaves: string[], regra: RegraRate, agora?: Date): Promise<boolean>;
  /**
   * Igual a `permitir`, mas cada chave com a SUA regra — tudo ou nada, atômico.
   * É o que deixa o IP de um escritório ter folga maior que a de um e-mail sem
   * que barrar por um consuma a vaga do outro.
   */
  permitirCada(limites: LimiteChave[], agora?: Date): Promise<boolean>;
}

export class MemoriaRateLimiter implements RateLimiter {
  private readonly eventos = new Map<string, number[]>();

  permitir(chaves: string[], regra: RegraRate, agora: Date = new Date()): Promise<boolean> {
    return this.permitirCada(
      chaves.map((chave) => ({ chave, regra })),
      agora,
    );
  }

  async permitirCada(limites: LimiteChave[], agora: Date = new Date()): Promise<boolean> {
    const t = agora.getTime();
    const podados = limites.map(({ chave, regra }) => {
      const inicioJanela = t - regra.janelaMs;
      const recentes = (this.eventos.get(chave) ?? []).filter((ts) => ts > inicioJanela);
      return { chave, regra, recentes };
    });

    if (podados.some(({ regra, recentes }) => recentes.length >= regra.max)) {
      // barrado: não registra; só persiste a poda (e libera chaves esvaziadas)
      for (const { chave, recentes } of podados) {
        if (recentes.length === 0) this.eventos.delete(chave);
        else this.eventos.set(chave, recentes);
      }
      return false;
    }

    for (const { chave, recentes } of podados) {
      recentes.push(t);
      this.eventos.set(chave, recentes);
    }
    return true;
  }
}
