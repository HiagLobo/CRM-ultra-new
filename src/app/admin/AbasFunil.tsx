"use client";
/**
 * Abas do funil com a contagem (que respeita a busca). O desenho é o da
 * `FaixaAbas`, dividida com as avaliações (O10·S3, revisão); aqui ficam só as
 * opções do funil e o destaque de "Hoje" com pendência, para não passar batido.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import FaixaAbas from "./FaixaAbas";
import { ABAS, type Aba } from "./filtroLeads";

export default function AbasFunil({
  ativa,
  contagem,
  aoEscolher,
}: {
  ativa: Aba;
  contagem: Record<Aba, number>;
  aoEscolher: (aba: Aba) => void;
}) {
  return (
    <FaixaAbas
      etiqueta="Etapas do funil"
      idPrefixo="aba-funil"
      controla="lista-leads"
      ativa={ativa}
      opcoes={ABAS}
      contagem={contagem}
      alerta={{ valor: "hoje", fundo: p.error, texto: p.white }}
      aoEscolher={aoEscolher}
    />
  );
}
