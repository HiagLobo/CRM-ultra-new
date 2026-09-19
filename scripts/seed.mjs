/**
 * Popula `data/leads.json` com leads FICTÍCIOS para o painel do admin não ficar
 * vazio enquanto você explora. Uso: `npm run seed`.
 *
 * Recusa rodar em produção — semear a base real seria falsear os números do
 * funil, e o painel existe justamente para você confiar neles.
 *
 * Nenhuma pessoa real: nomes, e-mails e CRECIs inventados (mesma regra do demo).
 */
import { promises as fs } from "fs";
import path from "path";
import { randomUUID, createHmac } from "crypto";

if (process.env.NODE_ENV === "production" || process.env.DATABASE_URL) {
  console.error(
    "[seed] recusado: isto é só para desenvolvimento (encontrei NODE_ENV=production ou DATABASE_URL).",
  );
  process.exit(1);
}

const ARQUIVO = path.join(process.cwd(), "data", "leads.json");
const AGORA = Date.now();
const DIA = 86_400_000;

const TEXTO_CONSENTIMENTO =
  "Autorizo o contato comercial e o tratamento dos meus dados (e-mail, telefone e CRECI) " +
  "para liberar o acesso ao demo do CRM Ultra, conforme a Política de Privacidade.";

/** Personas fictícias, com uma distribuição que deixa o resumo interessante. */
const PESSOAS = [
  ["ana.ribeiro@corretoraexemplo.com.br", "+5511900000001", "SP 45231", "contatado", 9],
  ["bruno.tavares@imoveisexemplo.com.br", "+5521900000002", "RJ 12876", "verificado", 7],
  ["carla.menezes@exemplo.com.br", "+5531900000003", "MG 33914", "verificado", 6],
  ["diego.fontes@exemplo.com.br", "+5541900000004", "PR 20155", "novo", 5],
  ["elisa.moraes@corretoraexemplo.com.br", "+5511900000005", "SP 51002", "contatado", 4],
  ["fabio.lins@exemplo.com.br", "+5581900000006", "PE 10473", "descartado", 3],
  ["gabriela.souza@exemplo.com.br", "+5511900000007", "SP 60318", "verificado", 2],
  ["henrique.dias@imoveisexemplo.com.br", "+5551900000008", "RS 27640", "novo", 1],
];

const ORIGENS = [
  { utm: "instagram-organico" },
  { utm: "google-ads" },
  { ref: "indicacao" },
  undefined,
];

const leads = PESSOAS.map(([email, telefone, creci, status, diasAtras], i) => {
  const criadoEm = new Date(AGORA - diasAtras * DIA);
  const verificado = status !== "novo";
  return {
    id: randomUUID(),
    email,
    telefone,
    creci,
    status,
    consentimento: {
      texto: TEXTO_CONSENTIMENTO,
      aceitoEm: criadoEm.toISOString(),
      ip: `203.0.113.${10 + i}`, // faixa reservada para documentação (RFC 5737)
    },
    codigo: {
      // já usado: hash vazio é como o domínio marca código consumido
      hash: verificado ? "" : createHmac("sha256", "seed-dev").update(String(i)).digest("hex"),
      expiraEm: new Date(criadoEm.getTime() + 10 * 60_000).toISOString(),
      tentativas: 0,
      enviadoEm: criadoEm.toISOString(),
    },
    ...(verificado ? { verificadoEm: new Date(criadoEm.getTime() + 4 * 60_000).toISOString() } : {}),
    ...(ORIGENS[i % ORIGENS.length] ? { origem: ORIGENS[i % ORIGENS.length] } : {}),
    criadoEm: criadoEm.toISOString(),
    atualizadoEm: criadoEm.toISOString(),
  };
});

await fs.mkdir(path.dirname(ARQUIVO), { recursive: true });
await fs.writeFile(ARQUIVO, JSON.stringify(leads, null, 2), "utf8");

const verificados = leads.filter((l) => l.verificadoEm).length;
console.log(`[seed] ${leads.length} leads fictícios em data/leads.json`);
console.log(
  `[seed] ${verificados} verificados · ${leads.filter((l) => l.status === "novo").length} novos · ` +
    `${leads.filter((l) => l.status === "contatado").length} contatados · ` +
    `${leads.filter((l) => l.status === "descartado").length} descartados`,
);
console.log("[seed] veja em /admin (senha: a do ADMIN_PASSWORD no .env.local)");
