import { useEffect, useState } from "react";

export const MOBILE_BREAKPOINT_QUERY = "(max-width: 768px)";

function matchesNow(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => matchesNow());

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const handler = (event: MediaQueryListEvent): void => {
      setIsMobile(event.matches);
    };
    setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => {
      mql.removeEventListener("change", handler);
    };
  }, []);

  return isMobile;
}
