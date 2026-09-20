"use client";
/**
 * Junta o relógio, o convite e o modal da avaliação dentro do demo (O10·S2).
 *
 * O relógio soma só o tempo com a aba visível e sobrevive à troca de tela: cada
 * painel monta este componente de novo, e o tempo já navegado volta do storage.
 * A regra de "quando convidar" é do `tempoNoDemo` (puro, testado) — aqui ficam
 * só os eventos do navegador.
 */
import * as React from "react";
import ConviteAvaliacao from "./ConviteAvaliacao";
import ModalAvaliacao from "./ModalAvaliacao";
import { lerEstado, marcarDispensado, reabrirConvite, salvarSegundos } from "./estado";
import { comVisibilidade, deveConvidar, iniciarRelogio, segundosDe, type Relogio } from "./tempoNoDemo";

/** De quanto em quanto tempo o tempo navegado é salvo e a regra é conferida. */
const INTERVALO_MS = 15_000;

const abaVisivel = () => typeof document === "undefined" || document.visibilityState !== "hidden";

export default function AvaliacaoNoDemo({
  rodape,
  pausado,
  pedido,
}: {
  /** Distância até a base da tela (CSS), já acima do botão Guia. */
  rodape: string;
  /** Guia ou boas-vindas abertos: o convite sai da frente para não empilhar cartão. */
  pausado: boolean;
  /** Contador do "Avaliar o demo" do Guia: muda = abrir o formulário agora. */
  pedido: number;
}) {
  const [convidar, setConvidar] = React.useState(false);
  const [modal, setModal] = React.useState(false);
  const dispensado = React.useRef(false);
  const respondido = React.useRef(false);

  React.useEffect(() => {
    const inicial = lerEstado();
    dispensado.current = inicial.dispensado;
    respondido.current = inicial.respondido;
    if (inicial.respondido) return; // quem já avaliou não recebe convite

    let relogio: Relogio = iniciarRelogio(inicial.segundos, abaVisivel(), Date.now());

    const conferir = () => {
      const estado = { dispensado: dispensado.current, respondido: respondido.current };
      if (deveConvidar(relogio, Date.now(), estado)) setConvidar(true);
    };

    const guardar = () => salvarSegundos(segundosDe(relogio, Date.now()));

    const aoMudarAba = () => {
      const visivel = abaVisivel();
      relogio = comVisibilidade(relogio, visivel, Date.now());
      if (!visivel) guardar(); // saiu da aba: o tempo navegado não pode se perder
      conferir();
    };

    // fechar a aba não dispara `visibilitychange` em todo navegador; `pagehide` sim
    const aoSair = () => {
      relogio = comVisibilidade(relogio, false, Date.now());
      guardar();
    };

    document.addEventListener("visibilitychange", aoMudarAba);
    window.addEventListener("pagehide", aoSair);
    const timer = window.setInterval(() => {
      guardar();
      conferir();
    }, INTERVALO_MS);
    conferir(); // quem voltou com o tempo já cumprido não espera mais 15 s

    return () => {
      document.removeEventListener("visibilitychange", aoMudarAba);
      window.removeEventListener("pagehide", aoSair);
      window.clearInterval(timer);
      aoSair(); // trocou de tela do demo: guarda o tempo antes de remontar
    };
  }, []);

  // pedido > 0 = a pessoa clicou em "Avaliar o demo" no Guia
  React.useEffect(() => {
    if (pedido <= 0) return;
    reabrirConvite();
    dispensado.current = false;
    setConvidar(false);
    setModal(true);
  }, [pedido]);

  const dispensar = () => {
    dispensado.current = true;
    marcarDispensado();
    setConvidar(false);
  };

  const fecharModal = () => {
    setModal(false);
    respondido.current = lerEstado().respondido;
  };

  return (
    <>
      {convidar && !modal && !pausado && (
        <ConviteAvaliacao
          rodape={rodape}
          aoAvaliar={() => {
            setConvidar(false);
            setModal(true);
          }}
          aoDispensar={dispensar}
        />
      )}
      {modal && <ModalAvaliacao aoFechar={fecharModal} />}
    </>
  );
}
