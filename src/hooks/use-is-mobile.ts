import { useEffect, useState } from "react";

/** Tailwind's `sm` breakpoint (640px) — below this we're on a mobile-sized viewport. */
const MOBILE_QUERY = "(max-width: 639px)";

/** True once mounted on a viewport narrower than Tailwind's `sm` breakpoint; false during SSR/initial render. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
