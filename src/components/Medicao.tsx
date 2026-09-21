"use client";

/**
 * Contagem de visitas do Vercel Analytics, ligada no layout raiz.
 *
 * Existe como componente de cliente por um motivo prático: `beforeSend` é uma
 * função, e função não atravessa a fronteira servidor/cliente do Next. O
 * filtro em si mora em `src/lib/medicao.ts`, puro e coberto por teste, porque
 * é ele que impede o endereço do painel (com o identificador do cliente na
 * URL do orçamento) de sair do navegador.
 */
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { filtrarEvento, podeMedir } from "@/lib/medicao";

export function Medicao() {
  // Duas travas para a mesma porta: no painel o contador nem é carregado, e o
  // que escapar por navegação interna ainda esbarra no `beforeSend`.
  const caminho = usePathname();
  if (caminho && !podeMedir(caminho)) return null;
  return <Analytics beforeSend={filtrarEvento} />;
}
