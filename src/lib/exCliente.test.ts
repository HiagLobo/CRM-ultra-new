/**
 * Guardas da O6 — o conteúdo do protótipo do ex-cliente não volta ao produto.
 *
 * Termos, telefones e imagens proibidos ficam guardados como **hash SHA-256**:
 * o teste que proíbe um dado não pode ser, ele mesmo, uma cópia desse dado.
 *
 * Para proibir um termo novo: normalize (minúsculas, sem acento, só letras e
 * dígitos separados por um espaço) e gere o hash —
 *   node -e "console.log(require('crypto').createHash('sha256').update('termo aqui').digest('hex'))"
 * — e acrescente em IDENTIDADE/CONTEUDO (e a primeira palavra em PRIMEIRAS).
 * Imagem: `sha256sum arquivo` → IMAGENS.
 */
import { describe, it, expect, vi } from "vitest";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const RAIZ = process.cwd();
const sha256 = (dado: string | Buffer) => createHash("sha256").update(dado).digest("hex");
const relativo = (a: string) => path.relative(RAIZ, a).replace(/\\/g, "/");

/** Minúsculas, sem acento, só [a-z0-9] separados por um espaço. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Nome/sigla do ex-cliente e das pessoas dele — proibidos no repositório inteiro, docs inclusive. */
const IDENTIDADE = new Set([
  "e952d5b0be18123bf14670b7720290317fb769ea310eaff9b2a02ba8be6ebd6a",
  "b984ca17e122a407f23cc9a85ac19c505c6588b654939d7dc13a80dcb839c682",
  "5d8f7fe33b5663e1a5b3b6d6ad80c29a6da04131476c17fb2ee0765a542a8e17",
  "5ed5c225300413bdd548b84b4fdeeb2b876fd7dc8c9c0daed4db31b7c0f5126e",
  "380f37e9419751b8dee7aaa4fe225c949a790b4f81494b0afba698c894c14783",
  "64b8683734017ac045d725438c2c273eae8b927b17c3f0a0ca410a8d0bfe93b0",
  "3990e1a1168811a27a5a162b80d62394f510ad50c37e1819a87cc15fca2fd4c0",
  "ec521d14f2a04e87f28c74905e7777a071f308faae2668a9c43cfa25ebb8504f",
  "d0d0379cb0fdfa75eb28de00000c90cdd68f61e7354939dfa9e125ac702c8224",
  "72c062b030cb65fc3e92fd9ca71c558869d8b31ac9e17647831a735e8e0d0581",
  "ae8335f4774eabc0904df968f8fb8dec29dbfbd26b2922a0df1bb36ff9c678ad",
  "4796dd137b1b50cbd2d8309277f1e8600b5f2d084bfb4f4bdfa44d80fa887e4f",
  "4f1d7ff39f1b6868e96c4605bc5f23ca1ab6256afb9f89d35b952c4ea9878073",
]);

/**
 * Conteúdo herdado que não pode ir ao ar: logradouros das unidades antigas, bios,
 * superlativos, ofertas de comissão, slogan, produto de garantia e empresas reais.
 * Vale para `src/` e `public/` (os docs da O6 descrevem o que foi removido).
 */
const CONTEUDO = new Set([
  "66cdf9d131fb2977e4dcbfa949239fc2a3f1bd631353e9e45c096d75073e16cf",
  "74164882121feb7128bd81d63d9e10309a068730110c801e20423a44120c4a17",
  "12a33aa0e00b9f00379eff7797f5df87e8234283bc3a6e5c133baba0e1820c6f",
  "30b5a30ed5793c9c47f1a953abdf8cb1fd6064f9afe1d0c56fc6fbfbe0bbb02d",
  "b90e3a0faca78e39fb9bc57fb088d339050f62e3ea28ac30f595fd0c8682be09",
  "d7c875c024f9398b7f9e73daba153cf686ce98ea2787798e609fbe815009d0ea",
  "9b2f9455ce9fca67df3f0681d53d0188d9ada562ee67d00c5f81f07e48ecdeec",
  "b3db02059179bdb9d8b78de0f423428110e36a1a42dd270e026c956ca9826433",
  "c84fbc44f072433e3ae503562075cf9b2163279cab20e359af7712f48d04fb3b",
  "d224437bf6491ba3cd3f0292e51f0b53e72bd9c3afa58e4a79448d2dc0f08736",
  "ddbbb233d7b59de407acae71f0f2fa348a3badd6df2217feb46b68ab02de30c6",
  "7080e553ac7f89ec67101f09cb7a7bfc2cff7a49b7ca49e9f0208d02ffa81e98",
  "1cccbab8c0a5f35f4f079047089490d352502e95b4aef3026d761919f226ae14",
  "a570446633d4ee709b5423ae3f61485c41c27133d1daf32efb40942344c86c60",
  "218ff64f2319ebb285c072fc7f787d0be2af8be3f1e506e4bcc6ebb88091daa7",
  "e46066aa23e2e7d39c0434dd936d636daa5a70c7d6856ecf7f91c77f8697d28e",
  "07041355c8d9036c2a5f5d810eb91ac12c3334577f0a6aeab06f9de5c814f58c",
  "f2478c30ec40f2fe55eaf68823376c26da68dddcb3ea6147eba5fe7a2242a1db",
]);

/** Primeira palavra de cada termo acima — só esses pontos do texto são examinados a fundo. */
const PRIMEIRAS = new Set([
  "e952d5b0be18123bf14670b7720290317fb769ea310eaff9b2a02ba8be6ebd6a",
  "b984ca17e122a407f23cc9a85ac19c505c6588b654939d7dc13a80dcb839c682",
  "5d8f7fe33b5663e1a5b3b6d6ad80c29a6da04131476c17fb2ee0765a542a8e17",
  "67a7d5777fedda6f582329a7f1199a6fcafd40da7d6b29e29271d8d97b4233ee",
  "7b85175b455060e3237e925f023053ca9515e8682a83c8b09911c724a1f8b75f",
  "c1d35cc3471fe509203d65b3e7a53fc82337ac9ae2c797b836621f706fe37df8",
  "72c062b030cb65fc3e92fd9ca71c558869d8b31ac9e17647831a735e8e0d0581",
  "054e24635c6fcfa42fef77684f4b485be21411c3b5ba38dd10ee22a276c551b8",
  "4796dd137b1b50cbd2d8309277f1e8600b5f2d084bfb4f4bdfa44d80fa887e4f",
  "2a1e2e0217f165ca25337d8bb326fbb8d314f5b1ad3648791648a8148d8bd7cd",
  "a1d6ab7bc0bc39cbb4357cc457cbc7a573740812c2f483f9753d2f3e7091f677",
  "71eaea56f7f31be16276ab904b8b04144daf720badab79d5cf291edbbfa950fd",
  "193cdc1086d537ef45c6e4f038818a7013f0e427e0c027e71e6d3be2b2f75503",
  "0ff00260b27651b8e931cfc9fab81e9e003167a6058aa0ea60e44b7bc309cbd2",
  "b90e3a0faca78e39fb9bc57fb088d339050f62e3ea28ac30f595fd0c8682be09",
  "9f0686a5bcd7307ea57f90cf807abc5b07187b55b88af7cf7e262bbd71e0c98f",
  "9b2f9455ce9fca67df3f0681d53d0188d9ada562ee67d00c5f81f07e48ecdeec",
  "b3db02059179bdb9d8b78de0f423428110e36a1a42dd270e026c956ca9826433",
  "74e724c91d2a99dc01e3294a592d4810d807b3e25d8cd6ba8afba7cee89352c6",
  "8f896dcc063978f9b7461de24f9afefb547e44689676d331ae2c4b57f6192a46",
  "309fc201a5fe3d849ecc657c02cee8fd1ae02f6d7a517c9400b32ff1ba85148f",
  "451743437a022d54cd2b2b83ce80965aeb81c650fb19d545d971049b825f20ea",
  "5bfcd40b52ae84dbecd4e354c5fd9df9e6f8e88f3ac04ac79ad1f140c036415b",
  "4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd5",
  "ff5a1ae012afa5d4c889c50ad427aaf545d31a4fac04ffc1c4d03d403ba4250a",
  "39f802a93ee87d6a9d323c082484d87df260c18d739cfcc227efbc9edc3ffb93",
  "5927141018bfca5db0ebfe4877a8f6e93fbbda6bcf3be894ebc166b25d610486",
]);

/** Telefones e CEP das unidades do ex-cliente (só dígitos). */
const DIGITOS = new Set([
  "ccf862fe2c9ffa2163d21784161bacfb500633da4cffbe7f38739c777d53108d",
  "31930321c66eb5f8c38ca61cdb79588880d6cc8a0310829894ace3af0b0ba3e7",
  "e12b029b9ceb32e8e80f5c70dcdb6c5d5a737fcfedc0cfe5cab6cb59a5a0df69",
  "af68474967160df0e18f530cc35edcf1c7b82cb54b4648ca31b5a861c4bf1ecc",
  "c7ede2bc7f2a31f35f3dcab369c0cf147adc29bb9cc4464cfff54f1df76d2806",
]);

/** Imagens do protótipo original: fotos com marca d'água, capas e banners com pessoas reais. */
const IMAGENS = new Set([
  "087a263e8664718041b6e1723e211fd0921699a768fe1fa7e88e63109b951490",
  "1be44db6ad97cd13d1bab821c2074c291f1bab32b4cfa081a54dd62d10a0528a",
  "1de6e999e21f64d552604bb1a267d96dc8f898e368805728eeee60da9fc212b9",
  "23673e93c248cfc521828ed98a3d2931439c5ee0ad23f14853126c0a0743b561",
  "2476cf3bbcaee554044c42c75e06aee487067657ce90fb0e0ed87ad93e4c79b5",
  "28346dfd9fcea7ca241645286c9986212181a85cd9f34964a7db36baa87922fd",
  "390f30b1e9995eb7ecb5f10546e2d247144cf6acccea450eb8752c95ce062ad5",
  "478d716e742797385adb7e5ddf0e6e2a37eaffe3ce72ef663be911738dfb3a7d",
  "50d4331437436f89febf5ebda20e73676bf90f4a594dc13f0c9dd32c4dd3799f",
  "5d6ff40fcf8d30474b2a5a7dfccf18945d0502cb14d9ae2de7a9d459bd2d3af8",
  "83d55a78627c1e2e9f715324f6f7c6babff8c26099601187d5a89eff4f9e5440",
  "a4edceb10681842bda80f2978aff2be0280616b8976d7965f49ff65fa0f3c182",
  "ab1b761c6a3917b7c9d0dcf2cb2c886b023cd98a7eaab62f80f8eb6e7e57fc2e",
  "c45af34883920f2459f469c31360ef49407fc3cfb72a945b422b1c51001b3ed0",
  "cb794b416d4bc7613913d6a029b7fa789512bdb60eb9ee34726fae63824dacfd",
  "cf0de16c09cf1eca9a8b4eabbbaa3b667e292286213038782d4abe986b06f3ff",
  "d33eb603b1d4acc012c5515983e38abb14c2a3c47c0ad07f0be8a44c4a2542f2",
  "fa0e316af25027368a99f0a6ca13edee00f708c0b272db9b35bbcea7dbecc36a",
  "fd809e6b41fea2e763d4188b88b0f660965e66d05704b330297c63840c34c867",
]);

/** Maior termo proibido, em palavras. */
const MAX_PALAVRAS = 7;

const IGNORAR = new Set(["node_modules", ".next", ".git", "data", ".trash"]);

async function listar(dir: string, aceita: (nome: string) => boolean): Promise<string[]> {
  const itens = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const listas = await Promise.all(
    itens.map(async (i) => {
      if (IGNORAR.has(i.name) || i.name.startsWith(".nm_trash")) return [];
      const completo = path.join(dir, i.name);
      if (i.isDirectory()) return listar(completo, aceita);
      return aceita(i.name) ? [completo] : [];
    }),
  );
  return listas.flat();
}

const TEXTO = (n: string) => /\.(ts|tsx|css|mjs|js|md|sql|svg|txt)$/.test(n);
const RASTER = (n: string) => /\.(png|jpe?g|webp|gif|avif)$/i.test(n);

/** O que vai ao ar: código, assets de texto e configs da raiz. */
async function arquivosDoProduto(): Promise<string[]> {
  const raiz = ["next.config.mjs", "package.json", "vitest.config.ts", "tsconfig.json"].map((a) => path.join(RAIZ, a));
  return [
    ...(await listar(path.join(RAIZ, "src"), TEXTO)),
    ...(await listar(path.join(RAIZ, "public"), TEXTO)),
    ...(await listar(path.join(RAIZ, "migrations"), TEXTO)),
    ...(await listar(path.join(RAIZ, "scripts"), TEXTO)),
    ...raiz,
  ];
}

/** Documentos versionados junto com o código. */
async function documentos(): Promise<string[]> {
  return [
    ...(await listar(path.join(RAIZ, "waves"), (n) => n.endsWith(".md"))),
    path.join(RAIZ, "README.md"),
    path.join(RAIZ, ".env.example"),
  ];
}

/** Arquivo:linha de cada termo proibido (sem ecoar o termo). Pega termo quebrado entre linhas. */
async function termosProibidos(arquivos: string[], proibidos: Set<string>): Promise<string[]> {
  const achados: string[] = [];
  for (const arquivo of arquivos) {
    const txt = await fs.readFile(arquivo, "utf8").catch(() => "");
    const palavras: { p: string; linha: number }[] = [];
    txt.split("\n").forEach((l, i) => {
      for (const p of normalizar(l).split(" ")) if (p) palavras.push({ p, linha: i + 1 });
    });
    for (let i = 0; i < palavras.length; i++) {
      if (!PRIMEIRAS.has(sha256(palavras[i]!.p))) continue;
      for (let n = 1; n <= MAX_PALAVRAS && i + n <= palavras.length; n++) {
        const termo = palavras.slice(i, i + n).map((x) => x.p).join(" ");
        if (proibidos.has(sha256(termo))) achados.push(`${relativo(arquivo)}:${palavras[i]!.linha}`);
      }
    }
  }
  return achados;
}

/** A varredura le o repositorio inteiro e cresce a cada onda; 5 s (padrao) ficou curto. */
const TEMPO_VARREDURA = 30_000;

// A varredura lê o repositório inteiro e cresce a cada onda: os 5 s padrão do
// vitest já estavam no limite (falha intermitente na O10).
vi.setConfig({ testTimeout: 30_000 });

describe("ex-cliente (O6): identidade", () => {
  it("nome, sigla e pessoas do ex-cliente não aparecem no código nem nos assets", async () => {
    expect(await termosProibidos(await arquivosDoProduto(), IDENTIDADE)).toEqual([]);
  });

  it("nem nos documentos do repositório", async () => {
    expect(await termosProibidos(await documentos(), IDENTIDADE)).toEqual([]);
  });
});

describe("ex-cliente (O6): conteúdo herdado", () => {
  it("bios, ofertas, slogan, produto, logradouros e empresas reais não voltam", async () => {
    expect(await termosProibidos(await arquivosDoProduto(), CONTEUDO)).toEqual([]);
  });

  it("telefones e CEP das unidades antigas não voltam (com ou sem máscara)", async () => {
    const achados: string[] = [];
    for (const arquivo of [...(await arquivosDoProduto()), ...(await documentos())]) {
      const txt = await fs.readFile(arquivo, "utf8").catch(() => "");
      txt.split("\n").forEach((linha, i) => {
        const digitos = linha.replace(/\D/g, "");
        for (const tam of [8, 9]) {
          for (let j = 0; j + tam <= digitos.length; j++) {
            if (DIGITOS.has(sha256(digitos.slice(j, j + tam)))) achados.push(`${relativo(arquivo)}:${i + 1}`);
          }
        }
      });
    }
    expect(achados).toEqual([]);
  });

  it("nenhum avatar com as iniciais das pessoas reais", async () => {
    const achados: string[] = [];
    for (const arquivo of await listar(path.join(RAIZ, "src"), (n) => n.endsWith(".tsx"))) {
      const txt = await fs.readFile(arquivo, "utf8");
      txt.split("\n").forEach((linha, i) => {
        if (/>\s*(AN|WT)\s*</.test(linha)) achados.push(`${relativo(arquivo)}:${i + 1}`);
      });
    }
    expect(achados).toEqual([]);
  });

  it("o site de exemplo não usa a empresa real como imobiliária", async () => {
    const pastas = ["src/components/site", "src/app/demo"].map((p) => path.join(RAIZ, p));
    const achados: string[] = [];
    for (const pasta of pastas) {
      for (const arquivo of await listar(pasta, TEXTO)) {
        const txt = await fs.readFile(arquivo, "utf8");
        if (/brand\.(empresa|contato)|linkWhatsapp\(/.test(txt)) achados.push(relativo(arquivo));
      }
    }
    expect(achados).toEqual([]);
  });

  it("o domínio da marca só aparece no brand.ts (o demo usa o domínio reservado)", async () => {
    const { brand } = await import("../config/brand");
    const achados: string[] = [];
    for (const arquivo of await listar(path.join(RAIZ, "src"), TEXTO)) {
      if (relativo(arquivo) === "src/config/brand.ts") continue;
      if ((await fs.readFile(arquivo, "utf8")).includes(brand.dominio)) achados.push(relativo(arquivo));
    }
    expect(achados).toEqual([]);
  });
});

describe("ex-cliente (O6): imagens", () => {
  it("nenhuma imagem do protótipo original em public/ (por conteúdo, não por nome)", async () => {
    const achados: string[] = [];
    for (const arquivo of await listar(path.join(RAIZ, "public"), RASTER)) {
      if (IMAGENS.has(sha256(await fs.readFile(arquivo)))) achados.push(relativo(arquivo));
    }
    expect(achados).toEqual([]);
  });

  it("toda imagem raster de public/ tem origem e licença em CREDITOS.md", async () => {
    const creditos = await fs.readFile(path.join(RAIZ, "public", "assets", "CREDITOS.md"), "utf8");
    const semCredito: string[] = [];
    for (const arquivo of await listar(path.join(RAIZ, "public"), RASTER)) {
      const rel = path.relative(path.join(RAIZ, "public"), arquivo).replace(/\\/g, "/");
      if (!creditos.includes(rel)) semCredito.push(rel);
    }
    expect(semCredito).toEqual([]);
  });
});
