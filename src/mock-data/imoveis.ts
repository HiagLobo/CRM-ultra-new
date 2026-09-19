import type { Imovel, ImovelLinha } from "@/types";
import { palette } from "@/lib/palette";
import { fotoImovel } from "@/mock-data/fotos";

/* Helpers de galeria — foto de exemplo + gradientes de fallback (paleta indigo). */
const photo = (n: number) => `url('${fotoImovel(n)}') center/cover no-repeat`;
const G1 = "linear-gradient(135deg,#E0E7FF,#A5B4FC)";
const G2 = "linear-gradient(135deg,#C7D2FE,#818CF8)";
const ph3 = (n: number) => [photo(n), G1, G2];
const ph2 = (n: number) => [photo(n), G1];

/* ---- Home: "Imóveis em destaque" ---- */
export const IMOVEIS_DESTAQUE: Imovel[] = [
  { code: "48213", price: "R$ 850.000", title: "Cobertura com vista, 3 suítes", location: "Pinheiros, São Paulo", beds: 3, baths: 4, area: 185, tag: "Destaque", photos: ph3(1) },
  { code: "48199", price: "R$ 540.000", title: "Apartamento reformado, 2 quartos", location: "Vila Mariana, São Paulo", beds: 2, baths: 2, area: 78, tag: "Novo", photos: ph3(2) },
  { code: "48087", price: "R$ 1.250.000", title: "Casa com quintal e piscina", location: "Cotia, São Paulo", beds: 4, baths: 3, area: 240, photos: ph3(3) },
  { code: "47980", price: "R$ 420.000", title: "Studio mobiliado no centro", location: "República, São Paulo", beds: 1, baths: 1, area: 38, fav: true, photos: ph3(4) },
  { code: "47865", price: "R$ 690.000", title: "Apartamento com varanda gourmet", location: "Moema, São Paulo", beds: 2, baths: 2, area: 92, tag: "Destaque", photos: ph3(6) },
  { code: "47712", price: "R$ 980.000", title: "Casa em condomínio fechado", location: "Granja Viana, Cotia", beds: 3, baths: 4, area: 178, photos: ph3(5) },
];

/* ---- Home: "Imóveis à venda" ---- */
export const IMOVEIS_VENDA: Imovel[] = [
  { code: "49021", price: "R$ 1.480.000", title: "Casa térrea com piscina", location: "Alto de Pinheiros, São Paulo", beds: 4, baths: 5, area: 320, tag: "Destaque", photos: ph3(7) },
  { code: "49008", price: "R$ 620.000", title: "Apartamento 2 dormitórios", location: "Tatuapé, São Paulo", beds: 2, baths: 1, area: 64, photos: ph3(8) },
  { code: "48977", price: "R$ 2.100.000", title: "Cobertura duplex mobiliada", location: "Itaim Bibi, São Paulo", beds: 3, baths: 4, area: 210, tag: "Novo", photos: ph3(9) },
];

/* ---- Home: "Imóveis para alugar" ---- */
export const IMOVEIS_LOCACAO: Imovel[] = [
  { code: "51230", price: "R$ 3.200/mês", title: "Apartamento 1 quarto mobiliado", location: "Consolação, São Paulo", beds: 1, baths: 1, area: 45, tag: "Aluguel", photos: ph3(10) },
  { code: "51188", price: "R$ 5.800/mês", title: "Casa em condomínio com quintal", location: "Morumbi, São Paulo", beds: 3, baths: 3, area: 180, tag: "Aluguel", photos: ph3(11) },
  { code: "51102", price: "R$ 2.400/mês", title: "Studio próximo ao metrô", location: "Santa Cecília, São Paulo", beds: 1, baths: 1, area: 32, tag: "Aluguel", photos: ph3(12) },
];

/* ---- Buscar imóvel: catálogo completo ---- */
export const IMOVEIS_BUSCA: Imovel[] = [
  { code: "48213", price: "R$ 850.000", title: "Cobertura com vista, 3 suítes", location: "Pinheiros, São Paulo", beds: 3, baths: 4, area: 185, tag: "Destaque", photos: ph2(1) },
  { code: "48199", price: "R$ 540.000", title: "Apartamento reformado, 2 quartos", location: "Vila Mariana, São Paulo", beds: 2, baths: 2, area: 78, tag: "Novo", photos: ph2(2) },
  { code: "48087", price: "R$ 1.250.000", title: "Casa com quintal e piscina", location: "Cotia, São Paulo", beds: 4, baths: 3, area: 240, photos: ph2(3) },
  { code: "47980", price: "R$ 420.000", title: "Studio mobiliado no centro", location: "República, São Paulo", beds: 1, baths: 1, area: 38, photos: ph2(4) },
  { code: "47865", price: "R$ 690.000", title: "Apartamento com varanda gourmet", location: "Moema, São Paulo", beds: 2, baths: 2, area: 92, tag: "Destaque", photos: ph2(6) },
  { code: "47712", price: "R$ 980.000", title: "Casa em condomínio fechado", location: "Granja Viana, Cotia", beds: 3, baths: 4, area: 178, photos: ph2(5) },
  { code: "49021", price: "R$ 1.480.000", title: "Casa térrea com piscina", location: "Alto de Pinheiros, São Paulo", beds: 4, baths: 5, area: 320, tag: "Destaque", photos: ph2(7) },
  { code: "49008", price: "R$ 620.000", title: "Apartamento 2 dormitórios", location: "Tatuapé, São Paulo", beds: 2, baths: 1, area: 64, photos: ph2(8) },
  { code: "48977", price: "R$ 2.100.000", title: "Cobertura duplex mobiliada", location: "Itaim Bibi, São Paulo", beds: 3, baths: 4, area: 210, tag: "Novo", photos: ph2(9) },
];

/* ---- Área do corretor: tabela "Meus imóveis" ---- */
export interface CarteiraLinha extends ImovelLinha {
  fg: string;
  bg: string;
}
export const CARTEIRA: CarteiraLinha[] = [
  { code: "48213", titulo: "Cobertura Pinheiros", valor: "R$ 850.000", status: "Ativo", fg: palette.success, bg: "#E6F4EC" },
  { code: "48199", titulo: "Apto Vila Mariana", valor: "R$ 540.000", status: "Reservado", fg: palette.primary, bg: palette.lilac2 },
  { code: "48087", titulo: "Casa Cotia", valor: "R$ 1.250.000", status: "Em análise", fg: palette.warning, bg: "#FBF1DC" },
  { code: "47865", titulo: "Apto Moema", valor: "R$ 690.000", status: "Vendido", fg: palette.error, bg: "#FAE5E5" },
  { code: "47712", titulo: "Casa Granja Viana", valor: "R$ 980.000", status: "Ativo", fg: palette.success, bg: "#E6F4EC" },
];
