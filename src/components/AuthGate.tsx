"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { mockAuth, homeForPerfil } from "@/lib/auth";
import type { Perfil } from "@/types";

/**
 * Escolha de persona dentro do painel (protótipo). Sem sessão → `/login`;
 * sessão de outro perfil → painel correto. Renderiza um gate neutro até
 * validar, para não piscar conteúdo.
 *
 * **O acesso ao demo NÃO é decidido aqui.** Quem barra é o servidor, no layout
 * de cada painel (`exigirDemo`), validando o cookie httpOnly assinado. Este
 * componente só cuida de qual persona está aberta.
 *
 * Antes ele também lia o espelho do `localStorage` — duas fontes de verdade
 * para a mesma pergunta, e quem limpasse o storage era barrado apesar de ter
 * acesso legítimo. Agora a resposta vem de um lugar só.
 */
export default function AuthGate({
  perfil,
  children,
}: {
  perfil: Perfil;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const sessao = mockAuth.getSession();
    if (!sessao) {
      router.replace("/login");
      return;
    }
    if (sessao.perfil !== perfil) {
      router.replace(homeForPerfil(sessao.perfil));
      return;
    }
    setOk(true);
  }, [perfil, router]);

  if (!ok) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "var(--page-bg)",
          color: "var(--gray-500)",
          fontFamily: "var(--font-body)",
          fontSize: 14,
        }}
      >
        Carregando…
      </div>
    );
  }
  return <>{children}</>;
}
