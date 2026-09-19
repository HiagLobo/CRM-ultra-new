"use client";
import * as React from "react";
import * as Lucide from "lucide-react";

/**
 * Ícone do painel do corretor — resolve qualquer nome kebab-case do Lucide
 * dinamicamente (mesma API `Ic` do handoff: <Ic n="messages-square" s={20} .../>).
 * Nomes desconhecidos caem num placeholder neutro, então o build nunca quebra.
 * Isolado nas rotas /corretor para não inflar o bundle do site.
 */
type LucideComp = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties; className?: string }>;

const Registry = Lucide as unknown as Record<string, LucideComp>;
const Fallback: LucideComp = (Lucide as unknown as { HelpCircle: LucideComp }).HelpCircle;

function pascal(name: string): string {
  return name
    .split("-")
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : ""))
    .join("");
}

const cache: Record<string, LucideComp> = {};
function resolve(name: string): LucideComp {
  if (cache[name]) return cache[name];
  const cmp = Registry[pascal(name)] || Fallback;
  cache[name] = cmp;
  return cmp;
}

export interface IcProps {
  n: string;
  s?: number;
  c?: string;
  sw?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function Ic({ n, s = 20, c = "currentColor", sw = 1.75, style, className }: IcProps) {
  const Cmp = resolve(n);
  return <Cmp size={s} color={c} strokeWidth={sw} className={className} style={{ flexShrink: 0, ...style }} />;
}

export default Ic;
