/**
 * Textos do cadastro único (O9·S2): e-mail que já tem cadastro, "Já tenho
 * cadastro", WhatsApp/CRECI repetidos e dados que não foram atualizados.
 *
 * A dica (e-mail mascarado, `m•••••a@provedor.com.br`) chega pronta do servidor:
 * aqui ela só entra no texto da tela — nunca em log ou storage. As mensagens
 * prontas do WhatsApp contam O QUE aconteceu, nunca QUEM é a pessoa: nada de
 * e-mail, telefone ou CRECI nelas.
 */
import { brand } from "@/config/brand";

/** Dados novos que o `verify` deixou como estavam por já estarem em outro cadastro. */
export type CampoNaoAtualizado = "telefone" | "creci";

export const MENSAGEM_EXISTENTE = "Esse e-mail já tem cadastro — enviamos um código para você entrar.";
export const MENSAGEM_SEM_CADASTRO = "Não achamos cadastro com esse e-mail.";
export const MENSAGEM_ENVIO_INDISPONIVEL =
  "Não conseguimos enviar o código agora. Tente de novo em alguns minutos ou fale com a gente.";
/** CRECI é público: mostrar o e-mail do dono exporia outro corretor — por isso, sem dica. */
export const MENSAGEM_CRECI_EM_USO =
  "Esse CRECI já tem cadastro. Entre com o e-mail que você usou ou fale com a gente.";

/** WhatsApp de outro cadastro: com a dica, a pessoa sabe com qual e-mail entrar. */
export function mensagemTelefoneEmUso(dica: string | null): string {
  return dica ? `Esse WhatsApp já tem cadastro com ${dica}.` : "Esse WhatsApp já tem cadastro. Fale com a gente.";
}

const ROTULO: Record<CampoNaoAtualizado, string> = { telefone: "WhatsApp", creci: "CRECI" };

/** Aviso do passo final; `null` quando tudo o que foi digitado foi atualizado. */
export function mensagemNaoAtualizados(campos: readonly CampoNaoAtualizado[]): string | null {
  const presentes = (["telefone", "creci"] as const).filter((c) => campos.includes(c));
  if (presentes.length === 0) return null;
  if (presentes.length === 1) {
    return `Não atualizamos seu ${ROTULO[presentes[0]!]}: ele já está em outro cadastro. Fale com a gente.`;
  }
  return "Não atualizamos seu WhatsApp e seu CRECI: eles já estão em outro cadastro. Fale com a gente.";
}

/** Mensagens prontas para o WhatsApp da marca (sem dado da pessoa). */
export const WHATSAPP_TELEFONE_EM_USO = `Olá! Fui pedir acesso ao demo do ${brand.nomeCurto} e meu WhatsApp já tem cadastro.`;
export const WHATSAPP_CRECI_EM_USO = `Olá! Fui pedir acesso ao demo do ${brand.nomeCurto} e meu CRECI já tem cadastro.`;
export const WHATSAPP_ENTRAR_SEM_CODIGO = `Olá! Tentei entrar no demo do ${brand.nomeCurto} e o código não chegou.`;
export const WHATSAPP_NAO_ATUALIZADO = `Olá! Entrei no demo do ${brand.nomeCurto} e não consegui atualizar meus dados.`;
