"use client";
/**
 * As estrelas da O10, em dois usos:
 * - `EstrelasNota`: só mostra (vitrine da landing e agradecimento).
 * - `SeletorEstrelas`: a pessoa escolhe a nota, **pelo mouse ou pelo teclado**.
 *
 * O seletor é um `radiogroup` de verdade: Tab entra uma vez no grupo (roving
 * tabindex), as setas andam de 1 a 5, Home/End vão às pontas e o foco fica
 * visível. Leitor de tela anuncia "2 estrelas, rádio, 2 de 5".
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";

export const NOTAS = [1, 2, 3, 4, 5] as const;
export type Nota = (typeof NOTAS)[number];

export const rotuloDaNota = (n: number) => `${n} ${n === 1 ? "estrela" : "estrelas"}`;

/** Estrelas cheias até a nota, apagadas no resto. Um só rótulo para o leitor de tela. */
export function EstrelasNota({ nota, rotulo, tamanho = 16 }: { nota: number; rotulo: string; tamanho?: number }) {
  return (
    <span role="img" aria-label={rotulo} style={{ display: "inline-flex", gap: 2, fontSize: tamanho, lineHeight: 1 }}>
      {NOTAS.map((n) => (
        <span key={n} aria-hidden="true" style={{ color: n <= nota ? p.gold : p.g300 }}>
          ★
        </span>
      ))}
    </span>
  );
}

const CSS_SELETOR = `
.av-estrela { background: none; border: none; padding: 2px; cursor: pointer; line-height: 1; border-radius: 8px; transition: transform .12s ease; }
.av-estrela:hover { transform: scale(1.08); }
.av-estrela:focus-visible { outline: 3px solid ${p.primary}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .av-estrela { transition: none; } .av-estrela:hover { transform: none; } }
`;

/** Próxima nota na direção pedida, presa entre 1 e 5 (não dá a volta). */
export function proximaNota(atual: number, passo: number): Nota {
  const alvo = Math.min(5, Math.max(1, (atual || 0) + passo));
  return alvo as Nota;
}

/**
 * Teclas do grupo de rádio, na direção do padrão WAI-ARIA: direita e **para
 * baixo** avançam, esquerda e **para cima** voltam; Home e End vão às pontas.
 * Tecla que não é do grupo devolve `null` (segue o caminho normal do navegador).
 */
export function notaDaTecla(tecla: string, atual: number): Nota | null {
  if (tecla === "Home") return 1;
  if (tecla === "End") return 5;
  const passo = tecla === "ArrowRight" || tecla === "ArrowDown" ? 1 : tecla === "ArrowLeft" || tecla === "ArrowUp" ? -1 : 0;
  if (passo === 0) return null;
  // sem nota ainda: a primeira seta escolhe 1 (e não 2, nem "volta" para lugar nenhum)
  return atual === 0 ? 1 : proximaNota(atual, passo);
}

/** Roving tabindex: só uma estrela entra na ordem do Tab (a escolhida, ou a 1ª). */
export function ehFocavel(valor: number, nota: number): boolean {
  return (valor === 0 ? 1 : valor) === nota;
}

export function SeletorEstrelas({
  valor,
  aoEscolher,
  idRotulo,
  erro,
  idErro,
}: {
  /** 0 = ainda sem nota. */
  valor: number;
  aoEscolher: (nota: Nota) => void;
  /** Id do texto que rotula o grupo ("Que nota você dá ao demo?"). */
  idRotulo: string;
  erro?: string;
  /** Id do aviso de erro, para o leitor de tela achar a mensagem do grupo. */
  idErro?: string;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const aoTeclar = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const nota = notaDaTecla(e.key, valor);
    if (nota === null) return;
    e.preventDefault();
    aoEscolher(nota);
    refs.current[nota - 1]?.focus();
  };

  return (
    <div>
      <style>{CSS_SELETOR}</style>
      <div
        role="radiogroup"
        aria-labelledby={idRotulo}
        aria-required="true"
        aria-invalid={!!erro}
        aria-errormessage={erro && idErro ? idErro : undefined}
        onKeyDown={aoTeclar}
        style={{ display: "inline-flex", gap: 4 }}
      >
        {NOTAS.map((n) => (
          <button
            key={n}
            ref={(el) => {
              refs.current[n - 1] = el;
            }}
            type="button"
            role="radio"
            aria-checked={valor === n}
            aria-label={rotuloDaNota(n)}
            tabIndex={ehFocavel(valor, n) ? 0 : -1}
            onClick={() => aoEscolher(n)}
            className="av-estrela"
          >
            <span aria-hidden="true" style={{ fontSize: 34, color: n <= valor ? p.gold : p.g300 }}>
              ★
            </span>
          </button>
        ))}
      </div>
      {/* texto de apoio visual: quem usa leitor de tela já ouve o rádio anunciar a nota,
          então aqui NÃO entra região viva — seria a mesma informação duas vezes */}
      <div style={{ fontSize: 13, color: p.g700, marginTop: 2, minHeight: 18 }}>
        {valor > 0 ? `Sua nota: ${rotuloDaNota(valor)} de 5.` : "Use as setas ou clique para escolher."}
      </div>
    </div>
  );
}
