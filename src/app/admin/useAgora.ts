"use client";
/**
 * O relógio do painel: "agora", renovado a cada minuto. Com o painel aberto
 * de um dia para o outro, a aba "Hoje" vira o dia sozinha. As funções puras
 * recebem este `agora` (relógio injetável) — nenhuma lê `new Date()` sozinha.
 */
import * as React from "react";

export function useAgora(intervaloMs = 60_000): Date {
  const [agora, setAgora] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = window.setInterval(() => setAgora(new Date()), intervaloMs);
    return () => window.clearInterval(id);
  }, [intervaloMs]);
  return agora;
}
