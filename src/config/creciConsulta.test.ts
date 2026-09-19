import { describe, it, expect } from "vitest";
import { LISTA_UFS } from "@/features/lead/creci";
import { CONSULTA_CRECI } from "./creciConsulta";

describe("busca oficial do CRECI por UF (O9·S3)", () => {
  it("cobre as 27 UFs, cada uma com URL https válida e do próprio conselho", () => {
    expect(Object.keys(CONSULTA_CRECI).sort()).toEqual([...LISTA_UFS].sort());
    for (const uf of LISTA_UFS) {
      const url = new URL(CONSULTA_CRECI[uf]);
      expect(url.protocol, uf).toBe("https:");
      // o host é do conselho da UF (creci<uf>…, creci-<uf>… ou o sistema dele em MG)
      expect(url.hostname, uf).toMatch(new RegExp(`creci-?${uf.toLowerCase()}`));
    }
  });

  it("o padrão conselho.net.br leva a UF no subdomínio; os sites próprios ficam como conferidos", () => {
    expect(CONSULTA_CRECI.PE).toBe("https://www.crecipe.conselho.net.br/form_pesquisa_cadastro_geral_site.php");
    expect(CONSULTA_CRECI.SP).toBe("https://www.crecisp.gov.br/cidadao/buscaporcorretores");
    expect(CONSULTA_CRECI.TO).toBe("https://crecito.gov.br/");
  });
});
