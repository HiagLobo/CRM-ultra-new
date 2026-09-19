/**
 * Busca oficial de cada conselho regional (O9 · F5): o CRECI NÃO é validado
 * automaticamente — não há API oficial e as buscas têm captcha, que não
 * contornamos. O fundador abre a página do conselho da UF, confere e marca o
 * resultado no painel.
 *
 * Endereços conferidos em 2026-09-19. Se um conselho trocar de site, é só
 * atualizar aqui (o teste exige as 27 UFs com https).
 *
 * Client-safe: dado puro (o painel monta o link na tela).
 */
import type { Uf } from "@/features/lead/creci";

/** A maioria dos regionais usa o mesmo sistema, com a UF no subdomínio. */
const conselhoNet = (uf: string) => `https://www.creci${uf}.conselho.net.br/form_pesquisa_cadastro_geral_site.php`;

export const CONSULTA_CRECI: Readonly<Record<Uf, string>> = {
  AC: conselhoNet("ac"),
  AL: conselhoNet("al"),
  AM: conselhoNet("am"),
  AP: conselhoNet("ap"),
  BA: conselhoNet("ba"),
  CE: conselhoNet("ce"),
  DF: "https://crecidf.gov.br/localizar-corretor/",
  ES: "https://area-restrita.crecies.gov.br/pesquisa-de-corretor-imobiliaria",
  GO: conselhoNet("go"),
  MA: conselhoNet("ma"),
  MG: "https://crecimg.spiderware.com.br/spw/consultacadastral/Principal.aspx",
  MS: conselhoNet("ms"),
  MT: conselhoNet("mt"),
  PA: conselhoNet("pa"),
  PB: conselhoNet("pb"),
  PE: conselhoNet("pe"),
  PI: conselhoNet("pi"),
  PR: "https://www.crecipr.gov.br/pesquisa-credenciados",
  RJ: conselhoNet("rj"),
  RN: conselhoNet("rn"),
  RO: conselhoNet("ro"),
  RR: conselhoNet("rr"),
  RS: "https://www.creci-rs.gov.br/siteNovo/pesquisaInscrito.php",
  SC: conselhoNet("sc"),
  SE: conselhoNet("se"),
  SP: "https://www.crecisp.gov.br/cidadao/buscaporcorretores",
  // sem página de busca direta: o link abre o site do conselho (ver UFS_SEM_BUSCA_DIRETA)
  TO: "https://crecito.gov.br/",
};

/** Conselhos sem página de busca direta: o link abre o site, e a ficha diz onde procurar. */
export const UFS_SEM_BUSCA_DIRETA: ReadonlyArray<Uf> = ["TO"];
