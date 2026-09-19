import { describe, it, expect } from "vitest";
import {
  CHAVE_ORIGEM,
  dominioDeOrigem,
  guardarOrigem,
  limparOrigem,
  lerOrigemGuardada,
  origemDaVisita,
  registrarOrigemDaVisita,
  sanearOrigem,
  type Visita,
} from "./origemCampanha";
import { LeadInputSchema } from "@/features/lead/schema";

const HOST = "crmultra.exemplo";
const visita = (search: string, referrer = ""): Visita => ({ search, referrer, host: HOST });

/** sessionStorage de mentira (Map), com opção de recusar como o modo privativo. */
function storageFalso(opts: { recusa?: boolean } = {}): Storage & { dados: Map<string, string> } {
  const dados = new Map<string, string>();
  const recusar = () => {
    if (opts.recusa) throw new Error("SecurityError");
  };
  return {
    dados,
    get length() {
      return dados.size;
    },
    clear: () => dados.clear(),
    key: (i: number) => [...dados.keys()][i] ?? null,
    getItem: (k: string) => (recusar(), dados.get(k) ?? null),
    setItem: (k: string, v: string) => (recusar(), void dados.set(k, v)),
    removeItem: (k: string) => void dados.delete(k),
  };
}

describe("origemDaVisita — UTM", () => {
  it("completo: utm = fonte.meio.campanha", () => {
    const r = origemDaVisita(visita("?utm_source=instagram&utm_medium=cpc&utm_campaign=lancamento-set"));
    expect(r).toEqual({ origem: { utm: "instagram.cpc.lancamento-set" }, explicita: true });
  });

  it("parcial: só a fonte, ou sem o meio (posição fixa, não confunde campanha com meio)", () => {
    expect(origemDaVisita(visita("?utm_source=google"))?.origem).toEqual({ utm: "google" });
    expect(origemDaVisita(visita("?utm_source=google&utm_campaign=natal"))?.origem).toEqual({ utm: "google..natal" });
    expect(origemDaVisita(visita("?utm_campaign=natal"))?.origem).toEqual({ utm: "..natal" });
  });

  it("ref do link vence o domínio do referrer; UTM + referrer guardam os dois", () => {
    expect(origemDaVisita(visita("?ref=parceiro-joao", "https://l.instagram.com/"))?.origem).toEqual({ ref: "parceiro-joao" });
    expect(origemDaVisita(visita("?utm_source=meta", "https://l.facebook.com/x?y=1"))?.origem).toEqual({
      utm: "meta",
      ref: "l.facebook.com",
    });
  });
});

describe("origemDaVisita — referrer e nada", () => {
  it("sem parâmetros: domínio do referrer, sem www, e não explícita", () => {
    expect(origemDaVisita(visita("", "https://www.google.com/search?q=crm"))).toEqual({
      origem: { ref: "google.com" },
      explicita: false,
    });
  });

  it("o próprio site não é origem; visita direta e parâmetros alheios dão null", () => {
    expect(origemDaVisita(visita("", `https://www.${HOST}/privacidade`))).toBeNull();
    expect(origemDaVisita(visita(""))).toBeNull();
    expect(origemDaVisita(visita("?acesso=necessario&foo=bar"))).toBeNull();
  });

  it("referrer malformado ou sem host não quebra", () => {
    expect(dominioDeOrigem("não é url", HOST)).toBeUndefined();
    expect(dominioDeOrigem("about:blank", HOST)).toBeUndefined();
    expect(dominioDeOrigem("android-app://com.google.android.gm/", HOST)).toBe("com.google.android.gm");
  });
});

describe("valores estranhos", () => {
  it("acento, espaço, fórmula de planilha e emoji viram identificador limpo", () => {
    expect(sanearOrigem("Promoção de Natal")).toBe("Promocao-de-Natal");
    expect(sanearOrigem('=HYPERLINK("x");1+1')).toBe("HYPERLINKx11");
    expect(sanearOrigem("<script>alert(1)</script>")).toBe("scriptalert1script");
  });

  it("sem letra nem dígito não é origem: campo omitido, nunca string vazia", () => {
    expect(sanearOrigem("💥💥")).toBe("");
    expect(sanearOrigem("---")).toBe("");
    expect(origemDaVisita(visita("?utm_source=%F0%9F%92%A5&ref=%20%20"))).toBeNull();
    expect(limparOrigem({ utm: "", ref: "  " })).toBeUndefined();
    expect(limparOrigem({ utm: 42, ref: ["x"] })).toBeUndefined();
    expect(limparOrigem(null)).toBeUndefined();
  });

  it("texto gigante sai com até 100 caracteres — o Zod da rota recusaria acima de 200", () => {
    const longo = "a".repeat(500);
    const r = origemDaVisita(visita(`?utm_source=${longo}&utm_medium=${longo}&ref=${longo}`))!.origem;
    expect(r.utm!.length).toBeLessThanOrEqual(100);
    expect(r.ref).toHaveLength(100);
  });

  it("o que o cliente manda passa no schema do servidor sem mudar", () => {
    const r = origemDaVisita(visita("?utm_source=Tik Tok&utm_medium=ç&utm_campaign=x;y,z&ref=a b", "https://x.y/"))!.origem;
    const base = { nome: "Ana Exemplo", email: "ana@exemplo.com", telefone: "(81) 99999-0000", creci: "PE 12345", consentimento: true };
    expect(LeadInputSchema.parse({ ...base, origem: r }).origem).toEqual(r);
  });
});

describe("guardar e ler (sessionStorage)", () => {
  it("guarda e lê de volta; valor adulterado é saneado; JSON corrompido vira undefined", () => {
    const s = storageFalso();
    expect(guardarOrigem({ utm: "google.cpc" }, s)).toBe(true);
    expect(lerOrigemGuardada(s)).toEqual({ utm: "google.cpc" });
    s.dados.set(CHAVE_ORIGEM, JSON.stringify({ utm: "a=b;c", ref: "x".repeat(300) }));
    expect(lerOrigemGuardada(s)).toEqual({ utm: "abc", ref: "x".repeat(100) });
    s.dados.set(CHAVE_ORIGEM, "{nao-json");
    expect(lerOrigemGuardada(s)).toBeUndefined();
  });

  it("storage bloqueado ou ausente: não lança, só segue sem origem", () => {
    const bloqueado = storageFalso({ recusa: true });
    expect(guardarOrigem({ utm: "x" }, bloqueado)).toBe(false);
    expect(lerOrigemGuardada(bloqueado)).toBeUndefined();
    expect(guardarOrigem({ utm: "x" }, null)).toBe(false);
    expect(lerOrigemGuardada(null)).toBeUndefined();
    expect(registrarOrigemDaVisita(visita("?utm_source=x"), bloqueado)).toEqual({ utm: "x" });
  });

  it("fora do navegador (SSR/teste) não lê window e não quebra", () => {
    expect(lerOrigemGuardada()).toBeUndefined();
    expect(registrarOrigemDaVisita()).toBeUndefined();
  });
});

describe("registrarOrigemDaVisita — o que fica guardado", () => {
  it("link com utm substitui a anterior (vale o último anúncio clicado)", () => {
    const s = storageFalso();
    registrarOrigemDaVisita(visita("?utm_source=google"), s);
    registrarOrigemDaVisita(visita("?utm_source=instagram&utm_campaign=set"), s);
    expect(lerOrigemGuardada(s)).toEqual({ utm: "instagram..set" });
  });

  it("volta dentro do site (referrer velho, sem parâmetros) não apaga a campanha", () => {
    const s = storageFalso();
    registrarOrigemDaVisita(visita("?utm_source=meta", "https://l.instagram.com/"), s);
    expect(registrarOrigemDaVisita(visita("", "https://l.instagram.com/"), s)).toEqual({ utm: "meta", ref: "l.instagram.com" });
    expect(lerOrigemGuardada(s)).toEqual({ utm: "meta", ref: "l.instagram.com" });
  });

  it("só referrer entra quando não há nada; visita direta não mexe", () => {
    const s = storageFalso();
    expect(registrarOrigemDaVisita(visita(""), s)).toBeUndefined();
    expect(s.dados.size).toBe(0);
    registrarOrigemDaVisita(visita("", "https://www.linkedin.com/feed"), s);
    expect(lerOrigemGuardada(s)).toEqual({ ref: "linkedin.com" });
  });
});
