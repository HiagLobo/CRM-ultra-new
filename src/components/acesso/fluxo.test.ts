/**
 * Passos do fluxo de acesso (O9·S2): cadastro ⇄ entrar → código → liberado,
 * sem perder o que a pessoa digitou nas idas e vindas.
 */
import { describe, it, expect } from "vitest";
import { FORM_VAZIO } from "./cadastro";
import { TITULOS, estadoInicial, fluxo, type AcaoFluxo, type EstadoFluxo } from "./fluxo";
import { atualizacaoDoPedido, emailDoPedido } from "./apiEntrar";
import { DADOS } from "./apoioTestes";

const aplicar = (estado: EstadoFluxo, ...acoes: AcaoFluxo[]) => acoes.reduce(fluxo, estado);

describe("começo e títulos", () => {
  it("abre no cadastro por padrão e no Entrar quando pedido (acesso vencido, /login)", () => {
    expect(estadoInicial().passo).toBe("dados");
    expect(estadoInicial("entrar").passo).toBe("entrar");
  });

  it("Entrar: 'Entrar na demonstração' · 'Passo 1 de 2'", () => {
    expect(TITULOS.entrar).toEqual({ titulo: "Entrar na demonstração", etapa: "Passo 1 de 2" });
    expect(TITULOS.dados.etapa).toBe("Passo 1 de 2");
    expect(TITULOS.codigo.etapa).toBe("Passo 2 de 2");
  });
});

describe("cadastro ⇄ entrar", () => {
  it("'Já tenho cadastro' leva o e-mail digitado; 'Quero me cadastrar' traz de volta, com o resto do formulário", () => {
    const form = { ...FORM_VAZIO, nome: "Corretora Exemplo", email: "a@exemplo.com", numero: "12345" };
    let e = aplicar(estadoInicial(), { tipo: "form", form }, { tipo: "ir_entrar", email: " a@exemplo.com " });
    expect(e).toMatchObject({ passo: "entrar", emailEntrar: "a@exemplo.com", dica: null });

    e = fluxo(e, { tipo: "ir_cadastro", email: "b@exemplo.com" });
    expect(e.passo).toBe("dados");
    expect(e.form).toEqual({ ...form, email: "b@exemplo.com" });
  });

  it("WhatsApp repetido: vai ao Entrar com a dica e o e-mail vazio (o do formulário é de outra conta)", () => {
    const e = aplicar(estadoInicial(), { tipo: "ir_entrar", dica: "m•••••a@provedor.com.br" });
    expect(e).toMatchObject({ passo: "entrar", emailEntrar: "", dica: "m•••••a@provedor.com.br" });
    expect(fluxo(e, { tipo: "ir_cadastro" }).dica).toBeNull();
  });

  it("voltar ao cadastro sem e-mail não apaga o que já estava lá", () => {
    const form = { ...FORM_VAZIO, email: "a@exemplo.com" };
    const e = aplicar(estadoInicial(), { tipo: "form", form }, { tipo: "ir_entrar" }, { tipo: "ir_cadastro", email: "  " });
    expect(e.form.email).toBe("a@exemplo.com");
  });
});

describe("código enviado", () => {
  it("cadastro novo: sem aviso de 'já tem cadastro' e sem atualizacao no verify", () => {
    const e = fluxo(estadoInicial(), { tipo: "cadastro_enviado", dados: DADOS, existente: false, codigoDev: "123456" });
    expect(e).toMatchObject({ passo: "codigo", codigoDev: "123456", emailsCriados: [DADOS.email] });
    expect(e.pedido).toEqual({ tipo: "cadastro", dados: DADOS, existente: false, atualizar: false });
    expect(atualizacaoDoPedido(e.pedido!)).toBeUndefined();
  });

  it("e-mail que já existia: avisa e leva nome, WhatsApp e CRECI no verify", () => {
    const e = fluxo(estadoInicial(), { tipo: "cadastro_enviado", dados: DADOS, existente: true });
    expect(e.pedido).toMatchObject({ existente: true, atualizar: true });
    expect(atualizacaoDoPedido(e.pedido!)).toEqual({ nome: DADOS.nome, telefone: DADOS.telefone, creci: DADOS.creci });
    expect(e.emailsCriados).toEqual([]);
  });

  it("'existente' do cadastro que ESTE fluxo criou (202 antes, ou corrigir dados) não vira aviso, mas atualiza", () => {
    const depoisDo202 = aplicar(
      estadoInicial(),
      { tipo: "cadastro_sem_codigo", email: DADOS.email },
      { tipo: "cadastro_enviado", dados: DADOS, existente: true },
    );
    expect(depoisDo202.pedido).toMatchObject({ existente: false, atualizar: true });

    const corrigiu = aplicar(
      estadoInicial(),
      { tipo: "cadastro_enviado", dados: DADOS, existente: false },
      { tipo: "voltar" },
      { tipo: "cadastro_enviado", dados: { ...DADOS, telefone: "+5581900000001" }, existente: true },
    );
    expect(corrigiu.pedido).toMatchObject({ existente: false, atualizar: true });
    expect(atualizacaoDoPedido(corrigiu.pedido!)?.telefone).toBe("+5581900000001");
  });

  it("lembra todos os e-mails criados: A → corrigir para B → voltar para A não diz 'já tem cadastro'", () => {
    const A = { ...DADOS, email: "a@exemplo.com" };
    const B = { ...DADOS, email: "b@exemplo.com" };
    const e = aplicar(
      estadoInicial(),
      { tipo: "cadastro_enviado", dados: A, existente: false },
      { tipo: "voltar" },
      { tipo: "cadastro_enviado", dados: B, existente: false },
      { tipo: "voltar" },
      { tipo: "cadastro_enviado", dados: A, existente: true },
    );
    expect(e.emailsCriados).toEqual(["a@exemplo.com", "b@exemplo.com"]);
    expect(e.pedido).toMatchObject({ existente: false, atualizar: true });
  });

  it("202 só marca como criado aqui quando não vem `existente: true` (defesa: o contrato diz que o 202 é de e-mail novo)", () => {
    const novo = fluxo(estadoInicial(), { tipo: "cadastro_sem_codigo", email: "a@exemplo.com" });
    expect(novo.emailsCriados).toEqual(["a@exemplo.com"]);
    const estranho = fluxo(estadoInicial(), { tipo: "cadastro_sem_codigo", email: "a@exemplo.com", existente: true });
    expect(estranho.emailsCriados).toEqual([]);
    const depois = fluxo(estranho, { tipo: "cadastro_enviado", dados: { ...DADOS, email: "a@exemplo.com" }, existente: true });
    expect(depois.pedido).toMatchObject({ existente: true, atualizar: true });
  });

  it("Entrar: o pedido é só o e-mail, sem atualizacao", () => {
    const e = fluxo(estadoInicial("entrar"), { tipo: "entrar_enviado", email: "a@exemplo.com" });
    expect(e).toMatchObject({ passo: "codigo", emailEntrar: "a@exemplo.com" });
    expect(emailDoPedido(e.pedido!)).toBe("a@exemplo.com");
    expect(atualizacaoDoPedido(e.pedido!)).toBeUndefined();
  });

  it("voltar do código leva ao passo de origem", () => {
    const doCadastro = aplicar(estadoInicial(), { tipo: "cadastro_enviado", dados: DADOS, existente: false }, { tipo: "voltar" });
    expect(doCadastro.passo).toBe("dados");
    const doEntrar = aplicar(estadoInicial("entrar"), { tipo: "entrar_enviado", email: "a@exemplo.com" }, { tipo: "voltar" });
    expect(doEntrar).toMatchObject({ passo: "entrar", emailEntrar: "a@exemplo.com" });
  });
});

describe("liberado", () => {
  const noCodigo = fluxo(estadoInicial("entrar"), { tipo: "entrar_enviado", email: "a@exemplo.com" });

  it("guarda os campos não atualizados para o aviso do passo final", () => {
    expect(fluxo(noCodigo, { tipo: "verificado", naoAtualizados: ["telefone"] })).toMatchObject({
      passo: "ok",
      naoAtualizados: ["telefone"],
    });
    expect(fluxo(noCodigo, { tipo: "verificado" }).naoAtualizados).toEqual([]);
  });
});

describe("resposta atrasada não troca de tela", () => {
  it("cadastro respondido depois que a pessoa foi ao Entrar: ignorado", () => {
    const noEntrar = fluxo(estadoInicial(), { tipo: "ir_entrar", email: "a@exemplo.com" });
    expect(fluxo(noEntrar, { tipo: "cadastro_enviado", dados: DADOS, existente: false })).toBe(noEntrar);
    expect(fluxo(noEntrar, { tipo: "cadastro_sem_codigo", email: DADOS.email })).toBe(noEntrar);
  });

  it("entrar respondido depois que a pessoa voltou ao cadastro: ignorado", () => {
    const noCadastro = fluxo(estadoInicial("entrar"), { tipo: "ir_cadastro", email: "a@exemplo.com" });
    expect(fluxo(noCadastro, { tipo: "entrar_enviado", email: "a@exemplo.com" })).toBe(noCadastro);
  });

  it("verificação que chega fora do passo do código: ignorada", () => {
    const noCadastro = estadoInicial();
    expect(fluxo(noCadastro, { tipo: "verificado", naoAtualizados: ["creci"] })).toBe(noCadastro);
  });
});
