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
import { creciCanonico, ufDoTextoCreci } from "./creciPainel";

/** O que o lead divide com outros da lista: os ids dos OUTROS leads, por dado. */
export interface Repetido {
  telefone: string[];
  creci: string[];
  /** A chave de CRECI repetida não tem UF (legado): é só o mesmo NÚMERO, talvez de conselhos diferentes. */
  creciSemUf: boolean;
}

type Identificavel = Pick<LeadAdmin, "id" | "telefone" | "creci">;

/** Grupos (2+ leads) com a mesma chave; cada grupo leva um lead de amostra. */
function agrupar(leads: ReadonlyArray<Identificavel>, chave: (l: Identificavel) => string | null) {
  const grupos = new Map<string, Identificavel[]>();
  for (const l of leads) {
    const k = chave(l);
    if (k) grupos.set(k, [...(grupos.get(k) ?? []), l]);
  }
  return [...grupos.values()].filter((g) => g.length > 1);
}

/** id do lead → o que ele divide com outros leads da lista (só quem tem repetido aparece). */
export function repetidosDaLista(leads: ReadonlyArray<Identificavel>): Map<string, Repetido> {
  const resultado = new Map<string, Repetido>();
  const de = (id: string) => {
    const r = resultado.get(id) ?? { telefone: [], creci: [], creciSemUf: false };
    resultado.set(id, r);
    return r;
  };
  for (const grupo of agrupar(leads, (l) => l.telefone || null)) {
    for (const l of grupo) de(l.id).telefone.push(...grupo.filter((o) => o.id !== l.id).map((o) => o.id));
  }
  for (const grupo of agrupar(leads, (l) => (l.creci ? chaveCreci(creciCanonico(l.creci)) : null))) {
    const semUf = !ufDoTextoCreci(grupo[0]!.creci);
    for (const l of grupo) {
      const r = de(l.id);
      r.creci.push(...grupo.filter((o) => o.id !== l.id).map((o) => o.id));
      r.creciSemUf = semUf;
    }
  }
  return resultado;
}

/**
 * A dica do selo, sem exagerar: "e" só quando o MESMO outro lead repete os dois
 * dados; dois leads diferentes → "Mesmo WhatsApp de outro lead · mesmo CRECI de
 * outro lead". CRECI sem UF: "mesmo número de CRECI (sem estado)".
 */
export function textoRepetido(r: Repetido): string {
  const creci = r.creciSemUf ? "mesmo número de CRECI (sem estado)" : "mesmo CRECI";
  if (r.telefone.length && r.creci.length) {
    const oMesmoLead = r.telefone.some((id) => r.creci.includes(id));
    return oMesmoLead ? `Outro lead tem o mesmo WhatsApp e o ${creci}.` : `Mesmo WhatsApp de outro lead · ${creci} de outro lead.`;
  }
  return r.telefone.length ? "Outro lead tem o mesmo WhatsApp." : `Outro lead tem o ${creci}.`;
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
