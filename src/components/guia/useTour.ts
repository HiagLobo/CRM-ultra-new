"use client";
/**
 * Decide quando o tour da tela começa — usado tanto pelos painéis (via
 * `GuiaDemo`) quanto pelo portal de imóveis (via `SiteNavbar`), que não tem
 * chrome de painel e mesmo assim precisa apresentar a busca.
 *
 * Sem isto o tour de `/demo/buscar` nunca rodaria: ele existe no catálogo, mas o
 * único ponto de montagem ficava dentro dos painéis.
 */
import * as React from "react";
import { usePathname } from "next/navigation";
import { brand } from "@/config/brand";
import { tourDaRota, type PassoTour } from "@/content/guia";
import { tourVisto, marcarTourVisto, esquecerTour } from "@/lib/guiaState";

/** Espera o layout assentar antes de medir os elementos destacados. */
const ATRASO_MS = 450;

export function useTour({ pausado = false }: { pausado?: boolean } = {}): {
  passos: PassoTour[] | null;
  aberto: boolean;
  fechar: () => void;
  refazer: () => void;
} {
  const pathname = usePathname();
  const [montado, setMontado] = React.useState(false);
  const [aberto, setAberto] = React.useState(false);

  const passos = brand.demoMode ? tourDaRota(pathname) : null;

  React.useEffect(() => setMontado(true), []);

  React.useEffect(() => {
    if (!montado || pausado || !passos || tourVisto(pathname)) return;
    const t = setTimeout(() => setAberto(true), ATRASO_MS);
    return () => clearTimeout(t);
  }, [montado, pausado, passos, pathname]);

  /** Pular também marca como visto: insistir com quem dispensou é incômodo. */
  const fechar = React.useCallback(() => {
    marcarTourVisto(pathname);
    setAberto(false);
  }, [pathname]);

  const refazer = React.useCallback(() => {
    esquecerTour(pathname);
    setAberto(true);
  }, [pathname]);

  return { passos: montado ? passos : null, aberto, fechar, refazer };
}
