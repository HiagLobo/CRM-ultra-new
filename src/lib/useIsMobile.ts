"use client";
import { useEffect, useState } from "react";

/**
 * SSR-safe media query hook. Renders desktop-first on the server (false),
 * then corrects on mount. Used for the few responsive behaviours that need
 * JS (navbar drawer, panel sidebar drawer).
 */
export function useIsMobile(breakpoint = 860): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isMobile;
}
