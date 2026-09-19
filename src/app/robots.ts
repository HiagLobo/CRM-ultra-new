import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

/**
 * Instruções para buscadores.
 *
 * A landing deve ser indexada — é o objetivo dela. O site de exemplo (/demo),
 * o painel e as APIs, não: o site de exemplo é fictício e não pode virar
 * resultado de busca associado à empresa, e um `/admin/login` achável no Google é convite para
 * tentativa de senha, e a rota do demo não tem por que virar resultado de busca.
 *
 * Isto é orientação, não proteção: quem ignora o robots.txt continua batendo na
 * porta. Quem barra de verdade é a senha, o rate-limit e o gate no servidor.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/demo/"],
      },
    ],
    host: `https://${brand.dominio}`,
  };
}
