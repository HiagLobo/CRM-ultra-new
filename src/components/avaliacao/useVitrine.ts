"use client";
/**
 * A vitrine da landing, pronta para a tela: começa com os três depoimentos do
 * arquivo (o HTML do servidor e o primeiro render batem, sem tela vazia nem
 * pulo de layout) e, quando o `GET /api/avaliacoes` responde, soma o banco.
 *
 * Falhou a chamada? A página **não muda e não mostra erro**: a vitrine é prova
 * social, não função do site. Quem decide o que entra é o `montarVitrine` (puro).
 */
import * as React from "react";
import { buscarAvaliacoes } from "./api";
import { montarVitrine, type Vitrine } from "./vitrine";

export function useVitrine(): Vitrine {
  const [vitrine, setVitrine] = React.useState<Vitrine>(() => montarVitrine(null));

  React.useEffect(() => {
    let vivo = true;
    void buscarAvaliacoes().then((dados) => {
      // `null` = rede/servidor fora: fica o que já estava na tela
      if (vivo && dados) setVitrine(montarVitrine(dados));
    });
    return () => {
      vivo = false;
    };
  }, []);

  return vitrine;
}
