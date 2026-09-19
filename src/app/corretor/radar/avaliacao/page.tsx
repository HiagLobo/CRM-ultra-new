"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";
import RadarCredits from "@/components/corretor/RadarCredits";

/* ============================================================
   RADAR AVALIAÇÃO (AVM) — porte fiel de avm-data.jsx +
   avm-steps.jsx + avm-result.jsx + avm-app.jsx
   ============================================================ */

/* ---------- DATA (avm-data.jsx) ---------- */
const AVM_CITIES = ["São Paulo, SP", "Recife, PE", "Rio de Janeiro, RJ"];

const AVM_TYPES: { k: string; icon: string }[] = [
  { k: "Apartamento", icon: "building-2" },
  { k: "Casa",        icon: "home" },
  { k: "Cobertura",   icon: "building" },
  { k: "Comercial",   icon: "briefcase" },
  { k: "Terreno",     icon: "trees" },
];

const AVM_FEATURES: Record<string, any[]> = {
  Apartamento: [["area", "Área útil", "num", "m²"], ["quartos", "Quartos", "step", ""], ["suites", "Suítes", "step", ""], ["vagas", "Vagas", "step", ""], ["andar", "Andar", "num", "º"], ["idade", "Idade do imóvel", "num", "anos"]],
  Cobertura:   [["area", "Área útil", "num", "m²"], ["quartos", "Quartos", "step", ""], ["suites", "Suítes", "step", ""], ["vagas", "Vagas", "step", ""], ["andar", "Andar", "num", "º"], ["idade", "Idade do imóvel", "num", "anos"]],
  Casa:        [["area", "Área construída", "num", "m²"], ["terreno", "Área do terreno", "num", "m²"], ["quartos", "Quartos", "step", ""], ["suites", "Suítes", "step", ""], ["vagas", "Vagas", "step", ""], ["idade", "Idade do imóvel", "num", "anos"]],
  Comercial:   [["area", "Área", "num", "m²"], ["vagas", "Vagas", "step", ""], ["banheiros", "Banheiros", "step", ""], ["andar", "Andar", "num", "º"]],
  Terreno:     [["area", "Área", "num", "m²"], ["frente", "Frente", "num", "m"]],
};

const AVM_CONSERV: { k: string; d: string; factor: number }[] = [
  { k: "Novo",       d: "Pronto / nunca habitado",    factor: 0.06 },
  { k: "Bom",        d: "Conservado, sem reformas",   factor: 0 },
  { k: "A reformar", d: "Precisa de obras",           factor: -0.08 },
];

const AVM_VIEWS: { k: string; factor: number }[] = [
  { k: "Livre / parque", factor: 0.05 },
  { k: "Cidade",          factor: 0 },
  { k: "Interna",         factor: -0.03 },
];

const AVM_LAZER = ["Piscina", "Academia", "Salão de festas", "Playground", "Churrasqueira", "Portaria 24h", "Quadra", "Sauna"];

const AVM_BASE = {
  valor: 720000, min: 690000, max: 755000, confianca: "Alta", confiancaPct: 88,
  aluguel: 3200, m2region: 10500, tempoMercado: 40,
};

const AVM_COMPS: any[] = [
  { end: "Rua Exemplo, 280",      bairro: "Campo Belo", m2: 65, price: "R$ 700.000", priceN: 700000, tag: "Vendido há 2 meses", tagType: "sold", av: ["#6366F1", "#312E81"] },
  { end: "Av. Exemplo, 1450",     bairro: "Campo Belo", m2: 72, price: "R$ 745.000", priceN: 745000, tag: "Anunciado",           tagType: "listed", av: ["#4F46E5", "#4338CA"] },
  { end: "Rua Modelo, 90",            bairro: "Brooklin",   m2: 60, price: "R$ 660.000", priceN: 660000, tag: "Vendido há 3 meses", tagType: "sold", av: ["#2563A8", "#163A5C"] },
  { end: "Rua Fictícia, 510",          bairro: "Campo Belo", m2: 70, price: "R$ 730.000", priceN: 730000, tag: "Anunciado",           tagType: "listed", av: ["#3B7A57", "#1E4533"] },
];

const fmtBRL = (v: number) => "R$ " + Math.round(v).toLocaleString("pt-BR");

/* ---------- SHARED TOAST ---------- */
function Toast({ toast }: { toast: any }) {
  if (!toast) return null;
  return (
    <div key={toast.id} style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", zIndex: 9000, display: "flex", alignItems: "center", gap: 10, background: pal.ink, color: "#fff", borderRadius: 12, padding: "12px 18px", boxShadow: "var(--shadow-lg)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500, animation: "toastUp .26s cubic-bezier(.2,.7,.3,1)", maxWidth: 440 }}>
      <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,.14)", display: "grid", placeItems: "center", flexShrink: 0 }}><Ic n={toast.icon || "check"} s={15} c="#fff" /></span>
      <span>{toast.msg}</span>
    </div>
  );
}

/* ---------- avm-steps.jsx helpers ---------- */
const inputSt: React.CSSProperties = { width: "100%", border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 14, color: pal.ink, outline: "none", background: "#fff" };
const lbl: React.CSSProperties = { fontSize: 12.5, fontWeight: 600, color: pal.g700, marginBottom: 6 };
const grpLbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500, marginBottom: 10 };

function StepHead({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n={icon} s={19} c={pal.primary} /></span>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, margin: 0, color: pal.ink }}>{title}</h2>
      </div>
      {sub && <p style={{ fontSize: 13.5, color: pal.g500, margin: "8px 0 0", lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );
}

function Field({ label, children, hint, full }: { label: string; children: React.ReactNode; hint?: string; full?: boolean }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto", minWidth: 0 }}>
      <div style={lbl}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: pal.g500, marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

function NumField({ value, onChange, suffix, placeholder }: { value: any; onChange: (v: string) => void; suffix?: string; placeholder?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "0 13px", background: "#fff" }}>
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "0"} inputMode="numeric" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: 14, color: pal.ink, padding: "11px 0" }} />
      {suffix && <span style={{ fontSize: 12.5, color: pal.g500, fontWeight: 600 }}>{suffix}</span>}
    </div>
  );
}

function Stepper({ value, onChange }: { value: any; onChange: (v: number) => void }) {
  const v = Number(value) || 0;
  const b = (d: number, ic: string) => <button onClick={() => onChange(Math.max(0, v + d))} style={{ width: 38, height: 38, borderRadius: 9, border: `1px solid ${pal.g300}`, background: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n={ic} s={16} c={pal.g700} /></button>;
  return <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{b(-1, "minus")}<span style={{ minWidth: 26, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: pal.ink }}>{v}</span>{b(1, "plus")}</div>;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return <button onClick={() => onChange(!value)} style={{ width: 46, height: 27, borderRadius: 999, border: "none", background: value ? pal.primary : pal.g300, position: "relative", cursor: "pointer", flexShrink: 0 } as React.CSSProperties}><span style={{ position: "absolute", top: 3, left: value ? 22 : 3, width: 21, height: 21, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" } as React.CSSProperties} /></button>;
}

function Chips({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const sel = value || [];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const on = sel.includes(o);
        return <button key={o} onClick={() => onChange(on ? sel.filter((x) => x !== o) : [...sel, o])} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac2 : "#fff", color: on ? pal.primary : pal.g700, borderRadius: 999, padding: on ? "6.5px 13px" : "7px 13px", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600 }}>{on && <Ic n="check" s={13} c={pal.primary} />}{o}</button>;
      })}
    </div>
  );
}

const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };

/* ===== STEP 1 — Endereço & finalidade ===== */
function AvStep1({ form, set, onToast }: any) {
  const [busy, setBusy] = React.useState(false);
  const buscar = () => { setBusy(true); setTimeout(() => { set("rua", "Av. Exemplo"); set("bairro", "Campo Belo"); set("cidade", "São Paulo, SP"); setBusy(false); onToast("Endereço preenchido pelo CEP", "map-pin"); }, 850); };
  return (
    <div>
      <StepHead icon="map-pin" title="Endereço & finalidade" sub="Comece pelo endereço (o CEP preenche o resto) e diga se é para vender ou alugar." />
      <Field label="Cidade"><div style={{ position: "relative" }}><select value={form.cidade} onChange={(e) => set("cidade", e.target.value)} style={{ ...inputSt, appearance: "none" as any, cursor: "pointer", paddingRight: 36 }}>{AVM_CITIES.map((c) => <option key={c}>{c}</option>)}</select><Ic n="chevron-down" s={17} c={pal.g500} style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" } as React.CSSProperties} /></div></Field>
      <div style={{ marginTop: 16 }}>
        <Field label="CEP" hint="Preenchimento automático via ViaCEP.">
          <div style={{ display: "flex", gap: 10 }}>
            <input value={form.cep} onChange={(e) => set("cep", e.target.value)} placeholder="00000-000" style={{ ...inputSt, flex: 1 }} />
            <button onClick={buscar} style={{ display: "flex", alignItems: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "0 18px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5 }}>{busy ? <React.Fragment><span className="rec-dot" style={{ width: 9, height: 9, borderRadius: "50%", background: "#fff" }} /> Buscando</React.Fragment> : <React.Fragment><Ic n="search" s={16} c="#fff" /> Buscar</React.Fragment>}</button>
          </div>
        </Field>
      </div>
      <div style={{ ...grid2, marginTop: 16 }}>
        <Field label="Endereço" full><input value={form.rua} onChange={(e) => set("rua", e.target.value)} placeholder="Rua e número" style={inputSt} /></Field>
        <Field label="Bairro"><input value={form.bairro} onChange={(e) => set("bairro", e.target.value)} style={inputSt} /></Field>
        <Field label="Complemento"><input value={form.compl} onChange={(e) => set("compl", e.target.value)} placeholder="Apto / bloco" style={inputSt} /></Field>
      </div>
      <div style={{ marginTop: 22 }}>
        <div style={grpLbl}>Avaliar para</div>
        <div style={{ display: "flex", gap: 12 }}>
          {([ ["Venda", "tag", "Preço de venda do imóvel"], ["Locação", "key-round", "Valor de aluguel mensal"] ] as any[]).map(([k, ic, d]: any) => {
            const on = form.fin === k;
            return (
              <button key={k} onClick={() => set("fin", k)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac1 : "#fff", borderRadius: 13, padding: "15px 16px", cursor: "pointer", textAlign: "left" }}>
                <span style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 11, background: on ? pal.lilac2 : pal.g100, display: "grid", placeItems: "center" }}><Ic n={ic} s={21} c={on ? pal.primary : pal.g700} /></span>
                <div><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: on ? pal.primary : pal.ink }}>{k}</div><div style={{ fontSize: 12, color: pal.g500, marginTop: 1 }}>{d}</div></div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ===== STEP 2 — Tipo & características ===== */
function AvStep2({ form, set, setFeat }: any) {
  const fields = AVM_FEATURES[form.tipo] || AVM_FEATURES.Apartamento;
  return (
    <div>
      <StepHead icon="ruler" title="Tipo & características" sub="Os campos se adaptam ao tipo, na mesma lógica do cadastro de imóvel." />
      <div style={grpLbl}>Tipo de imóvel</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 22 }}>
        {AVM_TYPES.map((t) => {
          const on = form.tipo === t.k;
          return <button key={t.k} onClick={() => set("tipo", t.k)} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac2 : "#fff", color: on ? pal.primary : pal.g700, borderRadius: 11, padding: "10px 15px", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600 }}><Ic n={t.icon} s={17} c={on ? pal.primary : pal.g600} /> {t.k}</button>;
        })}
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: pal.lilac2, color: pal.primary, borderRadius: 999, padding: "5px 12px", fontSize: 12.5, fontWeight: 600, marginBottom: 18 }}><Ic n="sparkles" s={14} c={pal.primary} /> Campos para {form.tipo}</div>
      <div style={grid2}>
        {fields.map(([k, label, kind, suffix]: any) => (
          <Field key={k} label={label}>
            {kind === "step" ? <Stepper value={form.feat[k]} onChange={(x: number) => setFeat(k, x)} /> : <NumField value={form.feat[k]} onChange={(x: string) => setFeat(k, x)} suffix={suffix} />}
          </Field>
        ))}
      </div>
    </div>
  );
}

/* ===== STEP 3 — Diferenciais & conservação ===== */
function AvStep3({ form, set }: any) {
  return (
    <div>
      <StepHead icon="sparkles" title="Diferenciais & conservação" sub="Os fatores que ajustam o valor. Você poderá afiná-los no resultado também." />
      <div style={{ marginBottom: 22 }}>
        <div style={grpLbl}>Estado de conservação</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {AVM_CONSERV.map((c) => {
            const on = form.conserv === c.k;
            return (
              <button key={c.k} onClick={() => set("conserv", c.k)} style={{ display: "flex", alignItems: "center", gap: 12, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac1 : "#fff", borderRadius: 12, padding: "13px 15px", cursor: "pointer", textAlign: "left" }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, border: on ? `6px solid ${pal.primary}` : `2px solid ${pal.g300}` }} />
                <div style={{ flex: 1 }}><span style={{ fontSize: 14, fontWeight: 600, color: pal.ink }}>{c.k}</span><span style={{ fontSize: 12.5, color: pal.g500, marginLeft: 8 }}>{c.d}</span></div>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.factor > 0 ? "#1E7A43" : c.factor < 0 ? "#C2410C" : pal.g500 }}>{c.factor > 0 ? "+" : ""}{Math.round(c.factor * 100)}%</span>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ marginBottom: 22 }}>
        <div style={grpLbl}>Vista</div>
        <div style={{ display: "flex", gap: 8 }}>
          {AVM_VIEWS.map((v) => { const on = form.vista === v.k; return <button key={v.k} onClick={() => set("vista", v.k)} style={{ flex: 1, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac2 : "#fff", color: on ? pal.primary : pal.g700, borderRadius: 10, padding: "11px 8px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5 }}>{v.k}</button>; })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 22 }}>
        {([ ["Reformado", "reformado"], ["Mobiliado", "mobiliado"] ] as any[]).map(([t, k]: any) => (
          <div key={k} style={{ flex: 1, display: "flex", alignItems: "center", gap: 11, border: `1px solid ${pal.g300}`, borderRadius: 12, padding: "12px 14px" }}>
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: pal.ink }}>{t}</span><Toggle value={form[k]} onChange={(x: boolean) => set(k, x)} />
          </div>
        ))}
      </div>
      <div>
        <div style={grpLbl}>Lazer do condomínio</div>
        <Chips options={AVM_LAZER} value={form.lazer} onChange={(x: string[]) => set("lazer", x)} />
      </div>
    </div>
  );
}

/* ---------- avm-result.jsx ---------- */
function ConfMeter({ pct, label }: { pct: number; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 8, borderRadius: 999, background: pal.g100, overflow: "hidden", maxWidth: 130 }}>
        <div style={{ height: "100%", width: pct + "%", borderRadius: 999, background: pct >= 75 ? "#2E9E5B" : pct >= 50 ? "#E0A82E" : "#D64545" }} />
      </div>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700, color: pct >= 75 ? "#1E7A43" : pct >= 50 ? "#B8860B" : "#C0392B" }}>
        <Ic n="shield-check" s={14} c={pct >= 75 ? "#2E9E5B" : pct >= 50 ? "#E0A82E" : "#D64545"} /> Confiança {label}
      </span>
    </div>
  );
}

function CompTag({ tag, type }: { tag: string; type: string }) {
  const sold = type === "sold";
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, color: sold ? "#1E7A43" : "#2563A8", background: sold ? "#E6F4EC" : "#E5EEF7", borderRadius: 999, padding: "2px 8px" }}><Ic n={sold ? "circle-check" : "megaphone"} s={11} c={sold ? "#2E9E5B" : "#2563A8"} /> {tag}</span>;
}

function Slider({ label, icon, value, onChange, options }: { label: string; icon: string; value: number; onChange: (v: number) => void; options: { label: string; f: number }[] }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}><Ic n={icon} s={15} c={pal.primary} /><span style={{ fontSize: 13, fontWeight: 600, color: pal.ink }}>{label}</span></div>
      <div style={{ display: "flex", gap: 6 }}>
        {options.map((o, i) => {
          const on = value === i;
          return <button key={i} onClick={() => onChange(i)} style={{ flex: 1, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac2 : "#fff", color: on ? pal.primary : pal.g600, borderRadius: 9, padding: "8px 4px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11.5 }}>{o.label}</button>;
        })}
      </div>
    </div>
  );
}

function AvResult({ form, onUseAnuncio, onLaudo, onToast, isMobile, onRestart }: any) {
  const isLoc = form.fin === "Locação";
  const [conserv, setConserv] = React.useState(Math.max(0, AVM_CONSERV.findIndex((c) => c.k === form.conserv)));
  const [reforma, setReforma] = React.useState(form.reformado ? 1 : 0);
  const [vista, setVista] = React.useState(Math.max(0, AVM_VIEWS.findIndex((v) => v.k === form.vista)));

  const conservOpts = [{ label: "A reformar", f: -0.08 }, { label: "Bom", f: 0 }, { label: "Novo", f: 0.06 }];
  const reformaOpts = [{ label: "Não", f: 0 }, { label: "Reformado", f: 0.04 }];
  const vistaOpts   = [{ label: "Interna", f: -0.03 }, { label: "Cidade", f: 0 }, { label: "Livre", f: 0.05 }];
  const factor = 1 + conservOpts[conserv].f + reformaOpts[reforma].f + vistaOpts[vista].f;
  const valor = AVM_BASE.valor * factor;
  const min = AVM_BASE.min * factor, max = AVM_BASE.max * factor;
  const aluguel = AVM_BASE.aluguel * factor;
  const adjusted = Math.abs(factor - 1) > 0.001;

  return (
    <div style={{ padding: isMobile ? "18px 16px 28px" : "26px 28px", maxWidth: 920, margin: "0 auto" }}>
      {/* HERO VALUE */}
      <div style={{ background: `linear-gradient(150deg, ${pal.primary}, ${pal.deep})`, borderRadius: 20, padding: isMobile ? 22 : 28, color: "#fff", position: "relative", overflow: "hidden", marginBottom: 18 }}>
        <div style={{ position: "absolute", right: -50, top: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.07)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, position: "relative" }}>
          <Ic n="gauge" s={17} c="rgba(255,255,255,.85)" /><span style={{ fontSize: 13, fontWeight: 600, opacity: 0.9 }}>Valor sugerido de {isLoc ? "locação" : "venda"}</span>
          {adjusted && <span style={{ fontSize: 10.5, fontWeight: 700, background: "rgba(255,255,255,.18)", borderRadius: 999, padding: "2px 9px" }}>ajustado</span>}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: isMobile ? 40 : 52, lineHeight: 1, letterSpacing: "-0.02em" }}>{fmtBRL(valor)}{isLoc && <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700 }}> /mês</span>}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, flexWrap: "wrap", position: "relative" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.14)", borderRadius: 999, padding: "7px 14px", fontSize: 13.5, fontWeight: 600 }}><Ic n="move-horizontal" s={15} c="#fff" /> entre {fmtBRL(min)} e {fmtBRL(max)}</span>
          {isLoc ? null : <span style={{ fontSize: 13, opacity: 0.85 }}>Aluguel sugerido: <strong>{fmtBRL(aluguel)}/mês</strong></span>}
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.18)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(255,255,255,.2)", overflow: "hidden", maxWidth: 160 }}><div style={{ height: "100%", width: AVM_BASE.confiancaPct + "%", borderRadius: 999, background: "#fff" }} /></div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700 }}><Ic n="shield-check" s={15} c="#fff" /> Confiança {AVM_BASE.confianca}</span>
            <span style={{ fontSize: 12, opacity: 0.75 }}>· baseado em {AVM_COMPS.length} comparáveis</span>
          </div>
        </div>
      </div>

      {/* property summary chip */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 22, fontSize: 13, color: pal.g600 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, color: pal.ink }}><Ic n="map-pin" s={14} c={pal.primary} /> {form.tipo} · {form.bairro || "Campo Belo"}</span>
        <span style={{ color: pal.g300 }}>·</span><span>{form.feat.area || 68} m²</span>
        <span style={{ color: pal.g300 }}>·</span><span>{form.feat.quartos || 2} quartos</span>
        {form.feat.suites > 0 && <React.Fragment><span style={{ color: pal.g300 }}>·</span><span>{form.feat.suites} suíte</span></React.Fragment>}
        {form.feat.vagas > 0 && <React.Fragment><span style={{ color: pal.g300 }}>·</span><span>{form.feat.vagas} vaga</span></React.Fragment>}
      </div>

      <div className="avm-cols" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr", gap: 16 }}>
        {/* COMPARÁVEIS */}
        <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 16, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Ic n="scale" s={17} c={pal.primary} /><span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: pal.ink }}>Como chegamos nesse valor</span>
          </div>
          <p style={{ fontSize: 12.5, color: pal.g500, margin: "0 0 14px", lineHeight: 1.45 }}>Imóveis parecidos na região, com preço e metragem reais.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {AVM_COMPS.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 56, height: 48, flexShrink: 0, borderRadius: 9, background: `linear-gradient(135deg, ${c.av[0]}, ${c.av[1]})`, display: "grid", placeItems: "center" }}><Ic n="building-2" s={19} c="rgba(255,255,255,.55)" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: pal.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.end}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 3 }}><span style={{ fontSize: 11.5, color: pal.g500 }}>{c.bairro} · {c.m2} m²</span><CompTag tag={c.tag} type={c.tagType} /></div>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14.5, color: pal.primary, flexShrink: 0 }}>{c.price}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, padding: "10px 13px", background: pal.lilac1, borderRadius: 10, fontSize: 11.5, color: pal.g600, lineHeight: 1.45 }}>
            <Ic n="shield" s={15} c={pal.primary} style={{ flexShrink: 0, marginTop: 1 } as React.CSSProperties} /><span>Exemplo da demonstração: no produto, a <strong style={{ color: pal.g700 }}>origem dos comparáveis</strong> será informada aqui.</span>
          </div>
        </div>

        {/* RIGHT: contexto + ajustes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 16, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Ic n="bar-chart-3" s={16} c={pal.primary} /><span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: pal.ink }}>Contexto de mercado</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {([ ["ruler", "Valor médio/m² na região", fmtBRL(AVM_BASE.m2region)], ["clock", "Tempo médio no mercado", AVM_BASE.tempoMercado + " dias"] ] as any[]).map(([ic, l, v]: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, background: pal.g100, display: "grid", placeItems: "center" }}><Ic n={ic} s={16} c={pal.g600} /></span>
                  <span style={{ flex: 1, fontSize: 12.5, color: pal.g600 }}>{l}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: pal.ink }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#fff", border: `1px solid ${pal.lilac2}`, borderRadius: 16, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><Ic n="sliders-horizontal" s={16} c={pal.primary} /><span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: pal.ink }}>Ajustar a avaliação</span></div>
            <p style={{ fontSize: 12, color: pal.g500, margin: "0 0 16px" }}>Mexa e o valor recalcula na hora.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Slider label="Conservação" icon="wrench"      value={conserv} onChange={setConserv} options={conservOpts} />
              <Slider label="Reforma"     icon="paintbrush"  value={reforma}  onChange={setReforma}  options={reformaOpts} />
              <Slider label="Vista"       icon="eye"          value={vista}    onChange={setVista}    options={vistaOpts} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${pal.g100}` }}>
              <span style={{ fontSize: 12.5, color: pal.g500 }}>Valor ajustado</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, color: pal.primary }}>{fmtBRL(valor)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <button onClick={onUseAnuncio} style={{ flex: "1 1 200px" as any, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: pal.primary, color: "#fff", borderRadius: 12, padding: "14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14.5, boxShadow: "var(--shadow-purple)" }}><Ic n="check" s={18} c="#fff" /> Usar no anúncio</button>
        <button onClick={onLaudo} style={{ flex: "1 1 160px" as any, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 12, padding: "14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}><Ic n="file-text" s={17} c={pal.primary} /> Gerar laudo (PDF)</button>
        <button onClick={() => onToast("Avaliação salva no imóvel", "bookmark")} title="Salvar" style={{ width: 50, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 12, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="bookmark" s={18} c={pal.g700} /></button>
        <button onClick={() => onToast("Link de compartilhamento copiado", "share-2")} title="Compartilhar" style={{ width: 50, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 12, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="share-2" s={18} c={pal.g700} /></button>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 7, fontSize: 11.5, color: pal.g500, lineHeight: 1.45 }}>
          <Ic n="info" s={14} c={pal.g500} style={{ flexShrink: 0, marginTop: 1 } as React.CSSProperties} /><span>Estimativa de mercado: não substitui laudo oficial de avaliação.</span>
        </div>
        <button onClick={onRestart} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "transparent", color: pal.primary, cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}><Ic n="rotate-ccw" s={15} c={pal.primary} /> Nova avaliação</button>
      </div>
    </div>
  );
}

/* ---------- Processing skeleton ---------- */
function Processing() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: pal.lilac2, color: pal.primary, borderRadius: 999, padding: "9px 18px", fontSize: 14, fontWeight: 700 }}>
        <span className="rec-dot" style={{ width: 10, height: 10, borderRadius: "50%", background: pal.primary }} /> Analisando comparáveis da região…
      </div>
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="sk" style={{ height: 120, borderRadius: 18 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
          <div className="sk" style={{ height: 200, borderRadius: 16 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}><div className="sk" style={{ height: 90, borderRadius: 16 }} /><div className="sk" style={{ height: 96, borderRadius: 16 }} /></div>
        </div>
      </div>
      <div style={{ marginTop: 18, fontSize: 12.5, color: pal.g500 }}>Cruzando vendas recentes, anúncios ativos e o valor/m² da região.</div>
    </div>
  );
}

/* ---------- wizard step labels ---------- */
const WZ = ["Endereço", "Características", "Diferenciais"];

/* ---------- PAGE ---------- */
export default function RadarAvaliacaoPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = React.useState(false);
  const [phase, setPhase] = React.useState<"wizard" | "processing" | "result">("wizard");
  const [step, setStep] = React.useState(0);
  const [toast, setToast] = React.useState<any>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [form, setForm] = React.useState<any>({
    cidade: "São Paulo, SP", cep: "", rua: "", bairro: "", compl: "", fin: "Venda",
    tipo: "Apartamento", feat: { area: "68", quartos: 2, suites: 1, vagas: 1, andar: "8", idade: "6" },
    conserv: "Bom", vista: "Cidade", reformado: false, mobiliado: false, lazer: ["Piscina", "Academia"],
  });

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const setFeat = (k: string, v: any) => setForm((f: any) => ({ ...f, feat: { ...f.feat, [k]: v } }));

  React.useEffect(() => {
    const onResize = () => { const w = window.innerWidth; setIsMobile(w < 1024); };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fire = (msg: string, icon?: string) => { setToast({ msg, icon, id: Date.now() }); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2800); };
  const avaliar = () => { setPhase("processing"); setTimeout(() => setPhase("result"), 1900); };
  const restart = () => { setPhase("wizard"); setStep(0); };

  const StepComp = [AvStep1, AvStep2, AvStep3][step];

  const wizard = (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "20px 16px 28px" : "26px 28px" }}>
      <StepComp form={form} set={set} setFeat={setFeat} onToast={fire} />
    </div>
  );

  const body = (
    <React.Fragment>
      {phase === "wizard" && (
        <div style={{ background: "#fff", borderBottom: `1px solid ${pal.g300}`, padding: isMobile ? "12px 16px" : "14px 28px", flexShrink: 0 }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: pal.g500, fontWeight: 600 }}>Passo {step + 1} de 3 · {WZ[step]}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: pal.primary, fontWeight: 600 }}><Ic n="gauge" s={14} c={pal.primary} /> Avaliação</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>{WZ.map((s, i) => <div key={s} style={{ flex: 1, height: 5, borderRadius: 999, background: i <= step ? pal.primary : pal.g300, transition: "background .2s" }} />)}</div>
          </div>
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, background: pal.page }}>
        {phase === "wizard" ? wizard : phase === "processing" ? <Processing /> : (
          <AvResult form={form} isMobile={isMobile} onToast={fire} onRestart={restart}
            onUseAnuncio={() => fire("Preço aplicado no cadastro do imóvel", "check")}
            onLaudo={() => fire("Laudo PDF gerado para o proprietário", "file-text")} />
        )}
      </div>
      {phase === "wizard" && (
        <div style={{ background: "#fff", borderTop: `1px solid ${pal.g300}`, padding: isMobile ? "12px 16px" : "14px 28px", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10, maxWidth: 760, margin: "0 auto" }}>
            <button onClick={() => (step === 0 ? router.push("/corretor/radar") : setStep((s) => s - 1))} style={{ display: "flex", alignItems: "center", gap: 7, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 11, padding: "11px 17px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: pal.g700 }}><Ic n="arrow-left" s={16} c={pal.g700} /> {step === 0 ? "Sair" : "Voltar"}</button>
            <button onClick={() => (step < 2 ? setStep((s) => s + 1) : avaliar())} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 11, padding: "11px 20px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}>{step < 2 ? <React.Fragment>Continuar <Ic n="arrow-right" s={16} c="#fff" /></React.Fragment> : <React.Fragment><Ic n="gauge" s={17} c="#fff" /> Avaliar imóvel</React.Fragment>}</button>
          </div>
        </div>
      )}
    </React.Fragment>
  );

  return (
    <CorretorChrome
      title="Radar"
      subtitle="Avaliação de imóvel: preço com comparáveis transparentes."
      searchPlaceholder="Buscar avaliação salva"
      radar="Avaliação"
      radarRight={<RadarCredits />}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
        {body}
        <Toast toast={toast} />
      </div>
    </CorretorChrome>
  );
}
