import AuthGate from "@/components/AuthGate";
import { exigirDemo } from "@/lib/exigirDemo";

// depende do cookie de acesso: nunca pré-renderizar
export const dynamic = "force-dynamic";

export default async function CeoLayout({ children }: { children: React.ReactNode }) {
  await exigirDemo(); // sem token válido, nem renderiza
  return <AuthGate perfil="ceo">{children}</AuthGate>;
}
