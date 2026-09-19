import type { Metadata } from "next";

/**
 * Nada do `/admin` entra em buscador — nem a tela de login.
 *
 * Fica no layout do segmento porque a página de login é componente de cliente e
 * não pode exportar `metadata`. Um `/admin/login` achável no Google é convite
 * para tentativa de senha: quem barra de verdade é o rate-limit, mas não há
 * motivo para facilitar a descoberta.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
