/**
 * Aviso de lead novo ao fundador (O7·S1): só na 1ª verificação, sem PII, e
 * nunca quebra a verificação do corretor.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { MemoriaRateLimiter } from "../../lib/ratelimit";
import { brand } from "../../config/brand";
import { LeadInputSchema, VerifyInputSchema } from "./schema";
import { criarOuAtualizarLead } from "./lead";
import { verificarCodigo, type ResultadoVerificacao } from "./verificacao";
import { avisarLeadNovo, type DepsAviso } from "./avisoLeadNovo";
import { CHAVE_TETO_DIARIO, regraTetoDiario } from "./solicitarAcesso";
import { EmailFake, capturarConsole, storesTemporarias } from "./apoioTestes";

const SECRET = "segredo-de-teste-1234567890";
const EMAIL_LEAD = "corretor@exemplo.com";
const TELEFONE_LEAD = "(11) 90000-0000";
const CRECI_LEAD = "PE 54321-F";
const FUNDADOR = "avisos@exemplo.com.br";
const T0 = new Date("2026-06-17T12:00:00.000Z");
const IP = "1.2.3.4";

const stores = storesTemporarias("leads-aviso");
afterEach(async () => {
  await stores.limpar();
  vi.restoreAllMocks();
});

const primeiraVez: ResultadoVerificacao = { status: "verificado", email: EMAIL_LEAD, jaVerificado: false };

function montarDeps(over: Partial<DepsAviso> = {}) {
  const email = new EmailFake();
  const deps: DepsAviso = {
    para: FUNDADOR,
    email: () => email,
    limiter: new MemoriaRateLimiter(),
    limiteEnviosDia: 90,
    brand,
    agora: T0,
    ...over,
  };
  return { deps, email };
}

/** Pede o código e verifica — o mesmo caminho das rotas, sem HTTP. */
async function pedirEVerificar(store: ReturnType<typeof stores.nova>, agora: Date) {
  const { codigo } = await criarOuAtualizarLead(
    store,
    LeadInputSchema.parse({ email: EMAIL_LEAD, telefone: TELEFONE_LEAD, creci: CRECI_LEAD, consentimento: true }),
    { ip: IP, secret: SECRET, agora },
  );
  return verificarCodigo(
    { store, limiter: new MemoriaRateLimiter(), secret: SECRET, agora },
    VerifyInputSchema.parse({ email: EMAIL_LEAD, codigo }),
    { ip: IP },
  );
}

describe("avisarLeadNovo", () => {
  it("avisa só na 1ª verificação — pedir código de novo e reverificar não avisa outra vez", async () => {
    const store = stores.nova();
    const { deps, email } = montarDeps();

    const v1 = await pedirEVerificar(store, T0);
    expect(v1).toMatchObject({ status: "verificado", jaVerificado: false });
    expect(await avisarLeadNovo(deps, v1)).toBe("enviado");

    const v2 = await pedirEVerificar(store, new Date(T0.getTime() + 60_000));
    expect(v2).toMatchObject({ status: "verificado", jaVerificado: true });
    expect(await avisarLeadNovo(deps, v2)).toBe("nao_se_aplica");

    expect(email.avisos).toEqual([{ para: FUNDADOR, marca: brand.nomeCurto }]);
  });

  it("o aviso não carrega e-mail, telefone nem CRECI do lead", async () => {
    const { deps, email } = montarDeps();
    await avisarLeadNovo(deps, await pedirEVerificar(stores.nova(), T0));
    const enviado = JSON.stringify(email.avisos);
    for (const pii of [EMAIL_LEAD, "90000-0000", "54321"]) expect(enviado).not.toContain(pii);
  });

  it("falha na verificação não avisa", async () => {
    const { deps, email } = montarDeps();
    expect(await avisarLeadNovo(deps, { status: "falha", motivo: "codigo_invalido" })).toBe("nao_se_aplica");
    expect(await avisarLeadNovo(deps, { status: "limitado" })).toBe("nao_se_aplica");
    expect(email.avisos).toHaveLength(0);
  });

  it("sem AVISO_LEADS_EMAIL fica desligado — nem cria o provedor", async () => {
    const fabrica = vi.fn(() => new EmailFake());
    const { deps } = montarDeps({ para: undefined, email: fabrica });
    expect(await avisarLeadNovo(deps, primeiraVez)).toBe("nao_se_aplica");
    expect(fabrica).not.toHaveBeenCalled();
  });

  it("provedor que falha não lança: devolve 'falhou' e loga só a causa", async () => {
    const saida = capturarConsole();
    const { deps, email } = montarDeps();
    email.falharAviso = new Error(`recusado para ${EMAIL_LEAD}`);
    await expect(avisarLeadNovo(deps, primeiraVez)).resolves.toBe("falhou");
    expect(saida()).toContain("[aviso-lead]");
    expect(saida()).not.toContain(EMAIL_LEAD);
  });

  it("configuração faltando (provedor não sobe) também não quebra a verificação", async () => {
    capturarConsole();
    const { deps } = montarDeps({
      email: () => {
        throw new Error("RESEND_API_KEY é obrigatória em produção");
      },
    });
    await expect(avisarLeadNovo(deps, primeiraVez)).resolves.toBe("falhou");
  });

  it("provedor pendurado: desiste no prazo em vez de segurar o corretor", async () => {
    capturarConsole();
    const pendurado = new EmailFake();
    pendurado.enviarAvisoNovoLead = () => new Promise<void>(() => undefined);
    const { deps } = montarDeps({ email: () => pendurado, prazoMs: 5 });
    await expect(avisarLeadNovo(deps, primeiraVez)).resolves.toBe("falhou");
  });

  it("conta no teto diário de e-mails: esgotado, não envia (o lead segue no /admin)", async () => {
    capturarConsole();
    const limiter = new MemoriaRateLimiter();
    await limiter.permitir([CHAVE_TETO_DIARIO], regraTetoDiario(1), T0); // cota do dia já gasta
    const { deps, email } = montarDeps({ limiter, limiteEnviosDia: 1 });
    expect(await avisarLeadNovo(deps, primeiraVez)).toBe("teto_diario");
    expect(email.avisos).toHaveLength(0);
  });
});
