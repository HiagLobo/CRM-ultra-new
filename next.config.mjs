/** @type {import('next').NextConfig} */

/**
 * Cabeçalhos de segurança aplicados a todas as respostas.
 *
 * O que NÃO está aqui, e por quê: uma CSP completa. O app inteiro usa estilos
 * inline (herança do design original) e o Next injeta script inline para
 * hidratar — uma CSP restritiva exigiria nonce em tudo e quebraria a tela sem
 * eu ter como ver o estrago. O `frame-ancestors` abaixo cobre o risco real
 * (clickjacking) sem esse custo; a CSP completa fica registrada como próximo
 * passo, para ser feita com o navegador aberto.
 */
const headersSeguranca = [
  {
    // HSTS: depois da primeira visita, o navegador só volta por HTTPS.
    // 2 anos + subdomínios é o que o preload list exige.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // ninguém embute o painel num iframe para roubar clique do admin
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'",
  },
  { key: "X-Frame-Options", value: "DENY" }, // mesma proteção, navegador antigo
  {
    // impede o navegador de "adivinhar" o tipo de um arquivo e executá-lo
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // não vaza a URL interna (ex.: /admin) ao clicar num link externo
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // o produto não usa nada disso; desligar reduz a superfície
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  // Protótipo: não bloquear o build por lint.
  eslint: { ignoreDuringBuilds: true },
  // não anunciar o framework: informação de graça para quem procura alvo
  poweredByHeader: false,
  // O projeto não usa next/image (as imagens já são WebP otimizados em public/).
  // Desligar o otimizador remove o endpoint /_next/image — superfície de ataque
  // que já teve RCE (corrigido no 15.5.24) — sem mudar nada na tela.
  images: { unoptimized: true },
  /**
   * Rotas do protótipo que saíram na O6 (limpeza do conteúdo do ex-cliente).
   * Redirect temporário, não permanente: /sobre e /contato podem voltar um dia
   * como páginas reais da empresa, e um 308 ficaria preso no cache do navegador.
   */
  async redirects() {
    const paraDemo = ["buscar", "favoritos", "comparar"].map((r) => ({
      source: `/${r}`,
      destination: `/demo/${r}`,
      permanent: false,
    }));
    const paraPortal = ["blog", "seja-corretor", "associadas", "anunciar", "financiamentos", "corretores"].map(
      (r) => ({ source: `/${r}`, destination: "/demo/portal", permanent: false }),
    );
    return [
      ...paraDemo,
      ...paraPortal,
      { source: "/imovel/:id*", destination: "/demo/portal", permanent: false },
      { source: "/sobre", destination: "/", permanent: false },
      { source: "/contato", destination: "/", permanent: false },
      { source: "/primeiro-acesso", destination: "/", permanent: false },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: headersSeguranca },
      {
        // o painel e as APIs não entram em cache de proxy nem de CDN: é PII
        source: "/(admin|api)/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
