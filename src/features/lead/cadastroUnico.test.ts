/**
 * Base da O9: chave de comparação do CRECI, UF pelo DDD e os schemas novos do
 * cadastro público (nome completo, CRECI com UF, "entrar" e atualização no verify).
 */
import { describe, it, expect } from "vitest";
import { chaveCreci, formasEquivalentesCreci, LISTA_UFS, ufDoCreci, MENSAGEM_CRECI_SEM_UF } from "./creci";
import { ufPorDdd, ufPorTelefone } from "./ddd";
import { creciComUfSchema, EntrarSchema, MENSAGEM_NOME, nomeSchema, VerifyInputSchema } from "./schema";

describe("chave do CRECI (categoria ausente = F; cada UF numera à parte)", () => {
  it("PE 12345 e PE 12345-F são a mesma pessoa; J e outra UF, não", () => {
    expect(chaveCreci("PE 12345")).toBe("PE 12345-F");
    expect(chaveCreci("PE 12345-F")).toBe("PE 12345-F");
    expect(chaveCreci("PE 12345-J")).toBe("PE 12345-J");
    expect(chaveCreci("SP 12345")).not.toBe(chaveCreci("PE 12345"));
    expect(chaveCreci("12345")).toBe("12345-F"); // legado sem UF só casa com legado sem UF
  });

  it("formas equivalentes: F cobre com e sem sufixo; J/E só a própria", () => {
    expect(formasEquivalentesCreci("PE 12345")).toEqual(["PE 12345-F", "PE 12345"]);
    expect(formasEquivalentesCreci("PE 12345-F")).toEqual(["PE 12345-F", "PE 12345"]);
    expect(formasEquivalentesCreci("PE 12345-J")).toEqual(["PE 12345-J"]);
    expect(formasEquivalentesCreci("RJ 99-E")).toEqual(["RJ 99-E"]);
  });

  it("UF do CRECI canônico", () => {
    expect(ufDoCreci("PE 12345-F")).toBe("PE");
    expect(ufDoCreci("12345")).toBeUndefined();
  });
});

describe("UF pelo DDD", () => {
  it("cada UF tem pelo menos um DDD e DDD de capital cai na UF certa", () => {
    const achadas = new Set<string>();
    for (let d = 11; d <= 99; d++) {
      const uf = ufPorDdd(d);
      if (uf) achadas.add(uf);
    }
    expect([...achadas].sort()).toEqual([...LISTA_UFS].sort());
    expect(ufPorDdd(81)).toBe("PE");
    expect(ufPorDdd(11)).toBe("SP");
    expect(ufPorDdd(61)).toBe("DF");
    expect(ufPorDdd(20)).toBeUndefined();
  });

  it("pelo telefone digitado ou em E.164", () => {
    expect(ufPorTelefone("+5581900000001")).toBe("PE");
    expect(ufPorTelefone("(21) 98888-7777")).toBe("RJ");
    expect(ufPorTelefone("5511912345678")).toBe("SP");
    expect(ufPorTelefone("9")).toBeUndefined();
    expect(ufPorTelefone("(10) 91234-5678")).toBeUndefined();
  });
});

describe("nome completo", () => {
  it.each(["Maria da Silva", "Ana O'Neil", "João P. Souza", "  José   Antônio  "])("aceita %j", (nome) => {
    expect(nomeSchema.safeParse(nome).success).toBe(true);
  });

  it("junta espaços repetidos", () => {
    expect(nomeSchema.parse("  José   Antônio  ")).toBe("José Antônio");
  });

  it.each(["Maria", "123 45", "", "Maria 2", "-- Silva"])("recusa %j com a mensagem do sobrenome", (nome) => {
    const r = nomeSchema.safeParse(nome);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toBe(MENSAGEM_NOME);
  });

  it("recusa nome gigante", () => {
    expect(nomeSchema.safeParse(`Maria ${"a".repeat(130)}`).success).toBe(false);
  });
});

describe("CRECI do cadastro público exige a UF", () => {
  it("com UF passa (normalizado); sem UF recusa com a mensagem do estado", () => {
    expect(creciComUfSchema.parse("CRECI-PE 12.345-F")).toBe("PE 12345-F");
    const r = creciComUfSchema.safeParse("12345");
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toBe(MENSAGEM_CRECI_SEM_UF);
  });
});

describe("schemas do entrar e do verify com atualização", () => {
  it("entrar: só e-mail (normalizado) + sinais anti-robô opcionais", () => {
    expect(EntrarSchema.parse({ email: " Fulano@Exemplo.com " })).toEqual({ email: "fulano@exemplo.com" });
    expect(EntrarSchema.safeParse({ email: "x" }).success).toBe(false);
  });

  it("verify: atualização opcional passa pelas mesmas regras do cadastro", () => {
    expect(VerifyInputSchema.parse({ email: "a@b.com", codigo: "123456" }).atualizacao).toBeUndefined();
    const ok = VerifyInputSchema.parse({
      email: "a@b.com",
      codigo: "123456",
      atualizacao: { nome: "Maria Silva", telefone: "(81) 99999-0000", creci: "PE 123" },
    });
    expect(ok.atualizacao).toEqual({ nome: "Maria Silva", telefone: "+5581999990000", creci: "PE 123" });
    const semUf = VerifyInputSchema.safeParse({
      email: "a@b.com",
      codigo: "123456",
      atualizacao: { nome: "Maria Silva", telefone: "(81) 99999-0000", creci: "123" },
    });
    expect(semUf.success).toBe(false);
  });
});
