"use client";
/**
 * Ponto único de montagem da orientação do demo — os painéis chamam só isto.
 * Banner + boas-vindas (O3·S1), guia contextual (O3·S2) e tour guiado.
 *
 * A ordem importa: o tour só começa **depois** das boas-vindas fecharem. Abrir
 * os dois juntos poria um modal por cima do destaque do tour, e a pessoa não
 * entenderia nem um nem outro.
 *
 * Tudo desliga junto com `brand.demoMode`, para quando virar produto real.
 */
import * as React from "react";
import { brand } from "@/config/brand";
import { GUIA, type Painel } from "@/content/guia";
import {
  jaViu,
  marcarVisto,
  bannerOculto,
  ocultarBanner,
  guiaAberto,
  definirGuiaAberto,
} from "@/lib/guiaState";
import DemoBanner from "./DemoBanner";
import WelcomeModal from "./WelcomeModal";
import HelpFab from "./HelpFab";
import GuiaDrawer from "./GuiaDrawer";
import Tour from "./Tour";
import { useTour } from "./useTour";

/** Altura do botão Guia mais o respiro até o painel do guia, que abre logo acima. */
const ACIMA_DO_BOTAO = 64;

/** Distância até a base da tela, somando a área do gesto de início do iPhone. */
const noRodape = (px: number) => `calc(${px}px + env(safe-area-inset-bottom, 0px))`;

export default function GuiaDemo({
  painel,
  folgaInferior = 20,
}: {
  painel: Painel;
  /** Quanto o botão Guia fica acima da base (px). Sobe quando há barra de abas embaixo. */
  folgaInferior?: number;
}) {
  // o storage só existe no cliente: começar "montado=false" evita divergência
  // entre o HTML do servidor e o primeiro render do navegador
  const [montado, setMontado] = React.useState(false);
  const [mostrarBanner, setMostrarBanner] = React.useState(false);
  const [modalAberto, setModalAberto] = React.useState(false);
  const [drawerAberto, setDrawerAberto] = React.useState(false);

  // o tour só começa depois das boas-vindas fecharem: dois avisos ao mesmo tempo
  // poriam um modal por cima do destaque, e a pessoa não entenderia nenhum dos dois
  const tour = useTour({ pausado: modalAberto });

  React.useEffect(() => {
    setMontado(true);
    setMostrarBanner(!bannerOculto());
    setDrawerAberto(guiaAberto());
    if (!jaViu(painel)) setModalAberto(true);
  }, [painel]);

  const fecharModal = React.useCallback(() => {
    marcarVisto(painel);
    setModalAberto(false);
  }, [painel]);

  const alternarDrawer = React.useCallback(() => {
    setDrawerAberto((aberto) => {
      definirGuiaAberto(!aberto);
      return !aberto;
    });
  }, []);


  if (!brand.demoMode || !montado) return null;

  return (
    <>
      {mostrarBanner && (
        <DemoBanner
          aoSaberMais={() => setModalAberto(true)}
          aoFechar={() => {
            ocultarBanner();
            setMostrarBanner(false);
          }}
        />
      )}
      {modalAberto && <WelcomeModal guia={GUIA[painel]} aoFechar={fecharModal} />}
      {drawerAberto && (
        <GuiaDrawer
          painel={painel}
          aoFechar={alternarDrawer}
          rodape={noRodape(folgaInferior + ACIMA_DO_BOTAO)}
          aoRefazerTour={
            tour.passos
              ? () => {
                  setDrawerAberto(false);
                  definirGuiaAberto(false);
                  tour.refazer();
                }
              : undefined
          }
        />
      )}
      <HelpFab aberto={drawerAberto} aoAlternar={alternarDrawer} rodape={noRodape(folgaInferior)} />
      {tour.aberto && tour.passos && <Tour passos={tour.passos} aoSair={tour.fechar} />}
    </>
  );
}
