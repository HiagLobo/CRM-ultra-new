/**
 * O aviso ao fundador passa por caixa de entrada e notificação de tela
 * bloqueada: o teste prova que NADA de quem avaliou (nome, e-mail, CRECI, o
 * texto) entra nele, que ele não avisa duas vezes pela mesma situação e que
 * falha nenhuma dele derruba a avaliação já gravada.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { brand } from "../../config/brand";
import { MemoriaRateLimiter } from "../../lib/ratelimit";
import { ErroConfiguracao } from "../../lib/erros";
import { montarEmailAvisoAvaliacao, estrelasEmTexto } from "../../lib/emailAvisoAvaliacao";
import { EmailFake, capturarConsole } from "../lead/apoioTestes";
import { avisarAvaliacao, mereceAviso } from "./avisoAvaliacao";
import type { ResultadoAvaliar } from "./avaliar";
import type { Avaliacao, StatusAvaliacao } from "./avaliacao";

afterEach(() => vi.restoreAllMocks());

const T = new Date("2026-09-19T15:00:00.000Z");

function avaliacao(status: StatusAvaliacao, estrelas = 5): Avaliacao {
  return {
    id: "aval-1",
    leadId: "lead-1",
    estrelas,
    comentario: "Texto que não pode sair no e-mail.",
    identificacao: "nome",
    status,
    consentimento: { texto: "Autorizo…", em: T.toISOString(), ip: "203.0.113.9" },
    criadoEm: T.toISOString(),
    atualizadoEm: T.toISOString(),
  };
}

const resultado = (over: Partial<ResultadoAvaliar & { novo: boolean }> = {}): ResultadoAvaliar =>
  ({ status: "ok", avaliacao: avaliacao("publicado"), resumo: { media: 5, quantas: 1 }, novo: true, ...over }) as ResultadoAvaliar;

function deps(over: Record<string, unknown> = {}) {
  const email = new EmailFake();
  return {
    email,
    deps: {
      para: "fundador@exemplo.com",
      email: () => email,
      limiter: new MemoriaRateLimiter(),
      limiteEnviosDia: 90,
      brand,
      agora: T,
      ...over,
    },
  };
}

describe("quando avisar", () => {
  it("avaliação nova avisa; edição que não muda a situação, não", () => {
    expect(mereceAviso(resultado())).toBe(true);
    expect(mereceAviso(resultado({ novo: false, statusAnterior: "publicado" }))).toBe(false);
  });

  it("edição que muda a situação avisa (publicado → pendente e o contrário)", () => {
    expect(mereceAviso(resultado({ novo: false, statusAnterior: "publicado", avaliacao: avaliacao("pendente") }))).toBe(true);
    expect(mereceAviso(resultado({ novo: false, statusAnterior: "pendente" }))).toBe(true);
  });

  it("pedido que nem gravou (sem acesso, sem nome, limitado) nunca avisa", () => {
    for (const status of ["sem_acesso", "sem_nome", "limitado"] as const) {
      expect(mereceAviso({ status } as ResultadoAvaliar)).toBe(false);
    }
  });

  it("sem AVISO_LEADS_EMAIL o aviso está desligado", async () => {
    const { deps: d, email } = deps({ para: undefined });
    expect(await avisarAvaliacao(d, resultado())).toBe("nao_se_aplica");
    expect(email.avaliacoes).toEqual([]);
  });
});

describe("o que vai no aviso", () => {
  it("só a nota e a situação chegam ao provedor", async () => {
    const { deps: d, email } = deps();
    expect(await avisarAvaliacao(d, resultado({ avaliacao: avaliacao("pendente", 4) }))).toBe("enviado");
    expect(email.avaliacoes).toEqual([{ para: "fundador@exemplo.com", estrelas: 4, pendente: true }]);
  });

  it("o corpo do e-mail leva estrelas, situação e o link do painel — e nada de pessoa", () => {
    const conteudo = montarEmailAvisoAvaliacao(brand, { estrelas: 4, pendente: true });
    const tudo = `${conteudo.assunto}\n${conteudo.texto}\n${conteudo.html}`;
    expect(tudo).toContain(estrelasEmTexto(4));
    expect(tudo).toContain("/admin");
    expect(tudo).toContain("fora do ar até você conferir");
    for (const sensivel of ["Corretor", "@exemplo.com", "Texto que não pode sair", "PE 12345", "+55"]) {
      expect(tudo).not.toContain(sensivel);
    }
  });

  it("estrelas em texto: cheias e vazias até 5", () => {
    expect(estrelasEmTexto(5)).toBe("★★★★★");
    expect(estrelasEmTexto(3)).toBe("★★★☆☆");
    expect(estrelasEmTexto(0)).toBe("☆☆☆☆☆");
  });
});

describe("o aviso nunca derruba a avaliação", () => {
  it("provedor que lança vira log com a causa, sem PII", async () => {
    const linhas = capturarConsole();
    const { deps: d } = deps({
      email: () => {
        throw new ErroConfiguracao("RESEND_API_KEY", "faltou a chave");
      },
    });
    expect(await avisarAvaliacao(d, resultado())).toBe("falhou");
    expect(linhas()).toContain("config:RESEND_API_KEY");
    expect(linhas()).not.toContain("exemplo.com");
  });

  it("teto diário atingido: não envia, registra e segue", async () => {
    const linhas = capturarConsole();
    const { deps: d, email } = deps({ limiteEnviosDia: 1 });
    expect(await avisarAvaliacao(d, resultado())).toBe("enviado");
    expect(await avisarAvaliacao(d, resultado())).toBe("teto_diario");
    expect(email.avaliacoes).toHaveLength(1);
    expect(linhas()).toContain("teto diário");
  });
});
