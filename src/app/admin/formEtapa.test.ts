/**
 * Mini-formulários do funil (retomar, perdido, próxima ação). Além das regras,
 * o que o formulário monta tem de passar no schema da rota (`PatchLeadSchema`):
 * a tela e o servidor falam o mesmo contrato.
 */
import { describe, it, expect } from "vitest";
import { PatchLeadSchema } from "@/features/lead/schemaAdmin";
import { LIMITE_MOTIVO } from "@/features/lead/funil";
import {
  FORM_ETAPA_VAZIO,
  LIMITE_OUTRO_MOTIVO,
  MOTIVOS_PERDA,
  formRetomarDoLead,
  montarMudancaEtapa,
  validarProximaAcao,
} from "./formEtapa";

/** 19/09/2026 23:30 em Recife — em UTC já é 20/09. */
const AGORA = new Date("2026-09-20T02:30:00.000Z");
const passaNaRota = (corpo: object) => PatchLeadSchema.safeParse({ id: "lead-1", ...corpo }).success;

describe("mover para Retomar depois", () => {
  it("dia depois de hoje (Recife) + motivo opcional → mudança aceita pela rota", () => {
    const r = montarMudancaEtapa("retomar", { ...FORM_ETAPA_VAZIO, retomarEm: "2026-09-20", motivoRetomar: "  depois das férias " }, AGORA);
    expect(r).toEqual({ ok: true, valor: { etapa: "retomar", retomarEm: "2026-09-20", motivo: "depois das férias" } });
    if (r.ok) expect(passaNaRota(r.valor)).toBe(true);

    const semMotivo = montarMudancaEtapa("retomar", { ...FORM_ETAPA_VAZIO, retomarEm: "2026-10-19" }, AGORA);
    expect(semMotivo).toEqual({ ok: true, valor: { etapa: "retomar", retomarEm: "2026-10-19" } });
    if (semMotivo.ok) expect(passaNaRota(semMotivo.valor)).toBe(true);
  });

  it("sem dia, dia inválido, hoje ou passado → erro no campo da data", () => {
    const erro = (retomarEm: string) => {
      const r = montarMudancaEtapa("retomar", { ...FORM_ETAPA_VAZIO, retomarEm }, AGORA);
      return r.ok ? null : r.erros.retomarEm;
    };
    expect(erro("")).toBe("escolha o dia de retomar");
    expect(erro("2026-02-31")).toBe("data inválida");
    expect(erro("2026-09-19")).toBe("escolha um dia depois de hoje"); // hoje em Recife, mesmo já sendo 20/09 em UTC
    expect(erro("2026-09-01")).toBe("escolha um dia depois de hoje");
  });

  it("motivo longo demais → erro no motivo", () => {
    const r = montarMudancaEtapa("retomar", { ...FORM_ETAPA_VAZIO, retomarEm: "2026-10-01", motivoRetomar: "x".repeat(LIMITE_MOTIVO + 1) }, AGORA);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.motivoRetomar).toMatch(/passa de/);
  });

  it("'Alterar data' começa com o dia e o motivo atuais", () => {
    expect(formRetomarDoLead({ status: "retomar", retomarEm: "2026-10-01", motivo: "férias" })).toEqual({
      ...FORM_ETAPA_VAZIO,
      retomarEm: "2026-10-01",
      motivoRetomar: "férias",
    });
    expect(formRetomarDoLead({ status: "perdido", motivo: "Preço" })).toEqual(FORM_ETAPA_VAZIO);
  });
});

describe("marcar como Perdido", () => {
  it("a lista do fundador: preço, já usa outro CRM, sem interesse, sem resposta, outro", () => {
    expect(MOTIVOS_PERDA.map((m) => m.rotulo)).toEqual(["Preço", "Já usa outro CRM", "Sem interesse", "Sem resposta", "Outro"]);
  });

  it("motivo da lista vira o rótulo gravado; a rota aceita", () => {
    for (const m of MOTIVOS_PERDA.filter((x) => x.valor !== "outro")) {
      const r = montarMudancaEtapa("perdido", { ...FORM_ETAPA_VAZIO, motivoPerda: m.valor }, AGORA);
      expect(r).toEqual({ ok: true, valor: { etapa: "perdido", motivo: m.rotulo } });
      if (r.ok) expect(passaNaRota(r.valor)).toBe(true);
    }
  });

  it("'Outro' pede o texto curto e grava 'Outro: …' dentro do limite", () => {
    const vazio = montarMudancaEtapa("perdido", { ...FORM_ETAPA_VAZIO, motivoPerda: "outro", outroMotivo: "   " }, AGORA);
    expect(vazio).toEqual({ ok: false, erros: { outroMotivo: "conte o motivo em poucas palavras" } });

    const r = montarMudancaEtapa("perdido", { ...FORM_ETAPA_VAZIO, motivoPerda: "outro", outroMotivo: " fechou com a concorrência " }, AGORA);
    expect(r).toEqual({ ok: true, valor: { etapa: "perdido", motivo: "Outro: fechou com a concorrência" } });

    const noLimite = montarMudancaEtapa("perdido", { ...FORM_ETAPA_VAZIO, motivoPerda: "outro", outroMotivo: "x".repeat(LIMITE_OUTRO_MOTIVO) }, AGORA);
    expect(noLimite.ok).toBe(true);
    if (noLimite.ok) expect(passaNaRota(noLimite.valor)).toBe(true); // "Outro: " + texto cabe nos 200

    const longo = montarMudancaEtapa("perdido", { ...FORM_ETAPA_VAZIO, motivoPerda: "outro", outroMotivo: "x".repeat(LIMITE_OUTRO_MOTIVO + 1) }, AGORA);
    expect(longo.ok).toBe(false);
  });

  it("sem motivo escolhido → erro", () => {
    expect(montarMudancaEtapa("perdido", FORM_ETAPA_VAZIO, AGORA)).toEqual({ ok: false, erros: { motivoPerda: "escolha o motivo" } });
  });
});

describe("próxima ação", () => {
  it("hoje (Recife) ou depois + o que fazer → aceita pela rota", () => {
    const r = validarProximaAcao({ em: "2026-09-19", texto: "  ligar às 10h " }, AGORA);
    expect(r).toEqual({ ok: true, valor: { em: "2026-09-19", texto: "ligar às 10h" } });
    if (r.ok) expect(passaNaRota({ proximaAcao: r.valor })).toBe(true);
  });

  it("dia vazio, inválido ou antes de hoje; texto vazio ou longo → erro em cada campo", () => {
    expect(validarProximaAcao({ em: "", texto: "" }, AGORA)).toEqual({
      ok: false,
      erros: { em: "escolha o dia", texto: "diga o que fazer (ex.: ligar às 10h)" },
    });
    const ontem = validarProximaAcao({ em: "2026-09-18", texto: "ligar" }, AGORA);
    expect(ontem.ok ? null : ontem.erros.em).toBe("a próxima ação não pode ser antes de hoje");
    const invalida = validarProximaAcao({ em: "2026-13-01", texto: "ligar" }, AGORA);
    expect(invalida.ok ? null : invalida.erros.em).toBe("data inválida");
    const longa = validarProximaAcao({ em: "2026-09-19", texto: "x".repeat(201) }, AGORA);
    expect(longa.ok ? null : longa.erros.texto).toMatch(/passa de 200/);
  });

  it("limpar a próxima ação é um PATCH aceito pela rota", () => {
    expect(passaNaRota({ proximaAcao: null })).toBe(true);
  });
});
