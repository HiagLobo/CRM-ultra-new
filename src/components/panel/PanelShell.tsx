"use client";
import * as React from "react";

/**
 * Layout base dos painéis (corretor / CEO).
 * Sidebar fixa no desktop; vira drawer off-canvas no mobile (classes em globals.css).
 */
export default function PanelShell({
  renderSidebar,
  renderTopbar,
  children,
}: {
  renderSidebar: (open: boolean, close: () => void) => React.ReactNode;
  renderTopbar: (openDrawer: () => void) => React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {open && <div className="ds-sidebar-overlay" onClick={close} />}
      {renderSidebar(open, close)}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {renderTopbar(() => setOpen(true))}
        <main className="ds-panel-main" style={{ padding: 28, flex: 1, overflow: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
