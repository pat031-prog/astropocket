import { useEffect } from "react";

// Safari's keyboard resizes the visual viewport, while the layout viewport can
// stay full height. Keep the composer and modal actions inside the visible area.
export default function useMobileViewport() {
  useEffect(() => {
    const viewport = window.visualViewport;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Let pinch zoom pan normally; never resize the app around a zoomed view.
        if (viewport && viewport.scale !== 1) return;
        document.documentElement.style.setProperty("--app-height", `${viewport?.height ?? window.innerHeight}px`);
        document.documentElement.style.setProperty("--app-top", `${viewport?.offsetTop ?? 0}px`);
      });
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    viewport?.addEventListener("resize", update, { passive: true });
    viewport?.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      document.documentElement.style.removeProperty("--app-height");
      document.documentElement.style.removeProperty("--app-top");
    };
  }, []);
}
