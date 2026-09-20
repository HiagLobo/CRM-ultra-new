/**
 * Guarda do formulário de orçamento (achado da revisão da S2): o erro de
 * `extras` era calculado, guardado no estado e **jogado fora** — não havia
 * onde ele aparecer. Digitar "1,5" numa quantidade deixava o botão aceso, o
 * clique não fazia nada e ninguém explicava por quê.
 *
 * Este teste varre o código da tela e exige que TODO campo conhecido tenha um
 * lugar para mostrar o erro dele. Campo novo sem lugar quebra aqui.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { CAMPOS_ORCAMENTO, FORM_ORCAMENTO_VAZIO, previaDoForm, validarOrcamento } from "./formOrcamento";

const PASTA = path.join(process.cwd(), "src", "app", "admin");
const ler = (arquivo: string) => readFileSync(path.join(PASTA, arquivo), "utf8");

/** As telas que compõem o formulário (o cliente tem campo próprio, no EscolherLead). */
const TELAS = ["ModalOrcamento.tsx", "EscolherLead.tsx", "ResumoOrcamento.tsx"].map(ler).join("\n");

describe("todo erro de campo tem onde aparecer", () => {
  it("cada campo de CAMPOS_ORCAMENTO é lido por alguma tela do formulário", () => {
    const semLugar = CAMPOS_ORCAMENTO.filter((campo) => {
      // `erros.campo`, `erros.campo ?? …` ou `erroDoCampo("campo")`
      const lido = new RegExp(`(erros\\.${campo}\\b|erroDoCampo\\("${campo}"\\)|erro${campo[0]!.toUpperCase()}${campo.slice(1)}\\b)`);
      return !lido.test(TELAS);
    });
    expect(semLugar).toEqual([]);
  });

  it("o erro dos extras é renderizado com role=alert e abre a lista fechada", () => {
    const modal = ler("ModalOrcamento.tsx");
    expect(modal).toContain('role="alert"');
    expect(modal).toContain("{erroExtras}");
    // a lista de extras abre sozinha quando há erro lá dentro
    expect(modal).toMatch(/open=\{extrasAbertos \|\| !!erroExtras\}/);
  });

  it("o diálogo não abre sem foco quando o cliente já veio escolhido", () => {
    expect(ler("ModalOrcamento.tsx")).toContain("autoFocus={!!leadInicial}");
    expect(ler("EscolherLead.tsx")).toContain("autoFocus");
  });

  it("a prévia recusa o que o schema recusaria, então o botão nunca fica aceso à toa", () => {
    const comExtraQuebrado = { ...FORM_ORCAMENTO_VAZIO, extras: { whatsapp_adicional: "1,5" } };
    expect(previaDoForm(comExtraQuebrado).ok).toBe(false); // botão desligado
    expect(validarOrcamento(comExtraQuebrado, "lead-1").ok).toBe(false); // e o schema concorda
  });
});
