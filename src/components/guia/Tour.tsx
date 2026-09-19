"use client";
/**
 * Tour guiado: escurece a tela, recorta o elemento da vez e explica num balão.
 *
 * Diferente do guia do drawer (passivo, só responde se a pessoa clicar), este é
 * ativo — leva pela mão na primeira visita, que é justamente quando ninguém sabe
 * o que cada parte do menu faz.
 *
 * Decisões que importam:
 * - **Passo cujo alvo não está NA TELA é pulado.** Existir no DOM não basta: no
 *   celular o menu lateral continua lá, só que escondido ou fora da tela, e o
 *   recorte apontava para um canto vazio. A lista é refeita a cada passo, porque
 *   a tela muda enquanto o tour roda (a gaveta do menu abre, uma lista carrega).
 * - **Espera a tela assentar antes de começar** (o Atendimento mostra um
 *   esqueleto até ~850 ms). Fechar por falta de alvo não conta como visto.
 * - O teclado não sequestra quem está digitando (regras em `regrasDoTour`).
 * - O recorte acompanha a tela a cada quadro: rolagem, resize e layout que
 *   assenta depois do carregamento moviam o buraco para o lugar errado.
 * - O fundo escuro **não** bloqueia clique no elemento destacado: quem quiser
 *   experimentar no meio da explicação, experimenta.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { posicaoDoBalao, larguraDoBalao, type Retangulo, type Viewport } from "@/lib/tourPosicao";
import type { PassoTour } from "@/content/guia";
import { acaoDaTecla, passoVizinho, type MotivoSaida } from "./regrasDoTour";
import { localizarAlvo, passosDisponiveis, trazerParaTela, useEsperaDosAlvos, viewportAtual } from "./alvosDoTour";
import BalaoDoTour from "./BalaoDoTour";

const ALTURA_ESTIMADA = 190; // usada só para escolher o lado; o balão ajusta sozinho

interface Andamento {
  /** Passos com alvo na tela na última conferência — dão o "Passo X de N". */
  disponiveis: number[];
  /** Índice do passo atual em `passos`. */
  atual: number;
}

interface PropsDoTour {
  passos: PassoTour[];
  aoSair: (motivo: MotivoSaida) => void;
}

/**
 * Tour de outra tela = tour novo: a chave zera espera e andamento. Sem isso, um
 * índice do tour anterior apontaria para um passo que não existe no novo.
 */
export default function Tour(props: PropsDoTour) {
  return <TourDaTela key={props.passos.map((passo) => passo.alvo).join("|")} {...props} />;
}

function TourDaTela({ passos, aoSair }: PropsDoTour) {
  const sair = React.useRef(aoSair);
  sair.current = aoSair;

  const prontos = useEsperaDosAlvos(passos, () => sair.current("sem-alvo"));
  const [andamento, setAndamento] = React.useState<Andamento | null>(null);
  const [alvo, setAlvo] = React.useState<Retangulo | null>(null);
  const [viewport, setViewport] = React.useState<Viewport>({ largura: 0, altura: 0 });
  /** Algum balão chegou a aparecer? Sem isso, ficar sem passos não é "concluiu". */
  const mostrou = React.useRef(false);

  React.useEffect(() => {
    setAndamento(prontos && prontos.length > 0 ? { disponiveis: prontos, atual: prontos[0] } : null);
  }, [prontos]);

  /**
   * O `sair` fica FORA do updater de estado de propósito. Chamado lá dentro,
   * ele rodava durante o render e disparava o clássico "Cannot update a
   * component while rendering a different component" — o updater tem de ser
   * função pura.
   */
  const andar = React.useCallback(
    (direcao: 1 | -1) => {
      if (!andamento) return;
      const disponiveis = passosDisponiveis(passos);
      const proximo = passoVizinho(disponiveis, andamento.atual, direcao);
      if (proximo !== null) setAndamento({ disponiveis, atual: proximo });
      else if (direcao === 1) sair.current(mostrou.current ? "concluiu" : "sem-alvo");
    },
    [andamento, passos],
  );
  const andarRef = React.useRef(andar);
  andarRef.current = andar;

  // ao trocar de passo: traz o alvo para a tela; se sumiu ou não dá para ver, pula
  React.useEffect(() => {
    if (!andamento) return;
    const el = localizarAlvo(passos[andamento.atual].alvo);
    if (!el || !trazerParaTela(el)) andarRef.current(1);
  }, [andamento, passos]);

  // acompanha o elemento quadro a quadro (rolagem, resize, layout assentando)
  React.useEffect(() => {
    if (!andamento) return;
    const seletor = passos[andamento.atual].alvo;
    let quadro = 0;
    let anterior = "";

    const medir = () => {
      const el = localizarAlvo(seletor);
      if (!el) {
        andarRef.current(1); // sumiu no meio do passo: a gaveta fechou, a tela mudou
        return;
      }
      const r = el.getBoundingClientRect();
      const v = viewportAtual();
      const chave = `${r.top}|${r.left}|${r.width}|${r.height}|${v.largura}|${v.altura}`;
      if (chave !== anterior) {
        anterior = chave;
        mostrou.current = true;
        setAlvo({ top: r.top, left: r.left, width: r.width, height: r.height });
        setViewport(v);
      }
      quadro = requestAnimationFrame(medir);
    };
    quadro = requestAnimationFrame(medir);
    return () => cancelAnimationFrame(quadro);
  }, [andamento, passos]);

  const ativo = andamento !== null;
  React.useEffect(() => {
    if (!ativo) return;
    const aoTeclar = (e: KeyboardEvent) => {
      const foco = e.target instanceof HTMLElement ? e.target : null;
      const acao = acaoDaTecla(e.key, {
        tag: foco?.tagName ?? "",
        editavel: foco?.isContentEditable ?? false,
        modificador: e.altKey || e.ctrlKey || e.metaKey || e.isComposing,
      });
      if (acao === "sair") sair.current("pulou");
      else if (acao === "avancar") andarRef.current(1);
      else if (acao === "voltar") andarRef.current(-1);
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [ativo]);

  if (!andamento || !alvo || viewport.largura === 0) return null;

  const largura = larguraDoBalao(viewport);
  const { top, left } = posicaoDoBalao(alvo, viewport, { largura, altura: ALTURA_ESTIMADA });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400, pointerEvents: "none" }}>
      {/* recorte: a sombra gigante escurece tudo, menos o buraco */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: alvo.top - 6,
          left: alvo.left - 6,
          width: alvo.width + 12,
          height: alvo.height + 12,
          borderRadius: 12,
          boxShadow: `0 0 0 9999px rgba(28,10,46,.72)`,
          outline: `2px solid ${p.light}`,
          transition: "top .18s ease, left .18s ease, width .18s ease, height .18s ease",
        }}
      />

      <BalaoDoTour
        passo={passos[andamento.atual]}
        numero={andamento.disponiveis.indexOf(andamento.atual) + 1}
        total={andamento.disponiveis.length}
        posicao={{ top, left, largura }}
        aoPular={() => sair.current("pulou")}
        aoVoltar={() => andar(-1)}
        aoAvancar={() => andar(1)}
      />
    </div>
  );
}
