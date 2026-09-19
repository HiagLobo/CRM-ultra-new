"use client";
/**
 * Tour do portal de imóveis (hoje, a tela de busca).
 *
 * O portal não tem chrome de painel, então o `GuiaDemo` não chega aqui — sem
 * este ponto de montagem o tour de `/demo/buscar` existiria no catálogo e nunca
 * rodaria. Vive na `SiteNavbar`, que está em toda página do portal; nas rotas
 * sem tour ele simplesmente não renderiza nada.
 */
import * as React from "react";
import Tour from "@/components/guia/Tour";
import { useTour } from "@/components/guia/useTour";

export default function TourDoPortal() {
  const tour = useTour();
  if (!tour.aberto || !tour.passos) return null;
  return <Tour passos={tour.passos} aoSair={tour.fechar} />;
}
