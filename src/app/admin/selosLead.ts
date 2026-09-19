/**
 * Selos da lista do painel (O9·S3), calculados sobre a lista carregada:
 * - "repetido": outro lead tem o mesmo WhatsApp ou o mesmo CRECI (pela chave:
 *   `PE 12345` ≡ `PE 12345-F`; sem UF só casa com sem UF). O cadastro já barra
 *   repetido novo; isto mostra os que já existiam no banco;
 * - "voltou ao demo": entrou de novo nos últimos 7 dias, pelo menos 1 h depois
 *   da primeira verificação.
 * Puro, com relógio injetável.
 */
import { dataHoraRecife, type LeadAdmin } from "@/features/lead/admin";
import { chaveCreci } from "@/features/lead/creci";
import { creciCanonico } from "./creciPainel";

export type MotivoRepetido = "telefone" | "creci";

type Identificavel = Pick<LeadAdmin, "id" | "telefone" | "creci">;

function agrupar(leads: ReadonlyArray<Identificavel>, chave: (l: Identificavel) => string | null): string[][] {
  const grupos = new Map<string, string[]>();
  for (const l of leads) {
    const k = chave(l);
    if (!k) continue;
    grupos.set(k, [...(grupos.get(k) ?? []), l.id]);
  }
  return [...grupos.values()].filter((ids) => ids.length > 1);
}

/** id do lead → o que ele divide com outro lead da lista (só quem tem repetido aparece). */
export function repetidosDaLista(leads: ReadonlyArray<Identificavel>): Map<string, MotivoRepetido[]> {
  const resultado = new Map<string, MotivoRepetido[]>();
  const marcar = (grupos: string[][], motivo: MotivoRepetido) => {
    for (const id of grupos.flat()) resultado.set(id, [...(resultado.get(id) ?? []), motivo]);
  };
  marcar(agrupar(leads, (l) => l.telefone || null), "telefone");
  marcar(agrupar(leads, (l) => (l.creci ? chaveCreci(creciCanonico(l.creci)) : null)), "creci");
  return resultado;
}

/** "Outro lead tem o mesmo WhatsApp e o mesmo CRECI." */
export function textoRepetido(motivos: ReadonlyArray<MotivoRepetido>): string {
  const partes = motivos.map((m) => (m === "telefone" ? "o mesmo WhatsApp" : "o mesmo CRECI"));
  return `Outro lead tem ${partes.join(" e ")}.`;
}

const UMA_HORA_MS = 60 * 60 * 1000;
const SETE_DIAS_MS = 7 * 24 * UMA_HORA_MS;

/** Voltou ao demo: último acesso nos últimos 7 dias e ≥ 1 h depois da 1ª verificação. */
export function voltouAoDemo(lead: Pick<LeadAdmin, "verificadoEm" | "ultimoAcessoEm">, agora: Date): boolean {
  if (!lead.ultimoAcessoEm || !lead.verificadoEm) return false;
  const ultimo = Date.parse(lead.ultimoAcessoEm);
  const primeiro = Date.parse(lead.verificadoEm);
  if (Number.isNaN(ultimo) || Number.isNaN(primeiro)) return false;
  return agora.getTime() - ultimo <= SETE_DIAS_MS && ultimo - primeiro >= UMA_HORA_MS;
}

/** ISO → `dd/mm hh:mm` (Recife) — o "último acesso ao demo" da ficha. Vazio sem data. */
export function dataHoraCurta(iso: string | undefined): string {
  const completa = dataHoraRecife(iso); // dd/mm/aaaa hh:mm
  return /^\d{2}\/\d{2}\/\d{4} /.test(completa) ? `${completa.slice(0, 5)} ${completa.slice(11)}` : completa;
}
