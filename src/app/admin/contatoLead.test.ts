import { describe, it, expect } from "vitest";
import { brand } from "@/config/brand";
import {
  MENSAGEM_WHATSAPP,
  MENSAGEM_WHATSAPP_MANUAL,
  identificacaoLead,
  linkEmailLead,
  linkWhatsappLead,
} from "./contatoLead";

describe("contato do lead em um clique", () => {
  it("telefone E.164 vira wa.me só com dígitos e a mensagem curta pré-preenchida", () => {
    const link = linkWhatsappLead("+5581988887777");
    expect(link).toBe(`https://wa.me/5581988887777?text=${encodeURIComponent(MENSAGEM_WHATSAPP)}`);

    const texto = new URL(link!).searchParams.get("text");
    expect(texto).toBe(MENSAGEM_WHATSAPP);
    expect(texto).toContain(brand.nomeCurto); // a marca vem do brand.ts, não cravada
    expect(texto!.length).toBeLessThan(90);
  });

  it("lead cadastrado à mão não pediu o demo: a mensagem abre neutra", () => {
    for (const canal of ["indicacao", "evento", "whatsapp", "outro"] as const) {
      const texto = new URL(linkWhatsappLead("+5581988887777", canal)!).searchParams.get("text");
      expect(texto, canal).toBe(MENSAGEM_WHATSAPP_MANUAL);
      expect(texto).not.toContain("demo");
    }
    expect(MENSAGEM_WHATSAPP_MANUAL).toContain(brand.nomeCurto);
  });

  it("número sem DDI + DDD não vira link quebrado", () => {
    expect(linkWhatsappLead("98888-7777")).toBeNull();
    expect(linkWhatsappLead("")).toBeNull();
  });

  it("e-mail vira mailto: com o endereço escapado", () => {
    expect(linkEmailLead("corretor@exemplo.com")).toBe("mailto:corretor@exemplo.com");
    expect(linkEmailLead("a+b@exemplo.com")).toBe("mailto:a%2Bb@exemplo.com");
    // nada do endereço vira parâmetro do mailto (assunto, cópia…)
    expect(linkEmailLead("x@exemplo.com?cc=outro@exemplo.com")).not.toContain("?");
  });

  it("identificação na tela: nome, senão e-mail, senão telefone legível", () => {
    const base = { telefone: "+5581988887777" };
    expect(identificacaoLead({ ...base, nome: "Ana Souza", email: "ana@exemplo.com" })).toBe("Ana Souza");
    expect(identificacaoLead({ ...base, nome: "   ", email: "ana@exemplo.com" })).toBe("ana@exemplo.com");
    expect(identificacaoLead(base)).toBe("(81) 98888-7777");
  });
});
