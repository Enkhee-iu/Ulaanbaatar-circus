import { useLanguage } from "@/components/site/Language";
import { useEffect, type MouseEvent, type ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useRouterState } from "@tanstack/react-router";
import { useContentStatus } from "./SiteContent";

// A link to the page already open goes back to its top. The router would reload the page and restore
// the saved position instead, so it's kept out of this click. That also skips a Link's own onClick,
// so anything that must still run on these links uses onClickCapture.
function scrollUpOnCurrentPageLink(event: MouseEvent<HTMLDivElement>) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = (event.target as Element).closest("a");
  if (!link || link.target || link.hash) return;
  if (link.pathname !== window.location.pathname || link.search !== window.location.search) return;
  event.preventDefault();
  window.scrollTo({ top: 0 });
}

export function PageShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const navigating = useRouterState({ select: (state) => state.isLoading });
  const { refreshing, error, retry } = useContentStatus();
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(".home-scroll-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return (
    <div id="top" className="site-shell" onClickCapture={scrollUpOnCurrentPageLink}>
      <a href="#main-content" className="skip-link">
        {t("Skip to content")}
      </a>
      <Header />
      {(navigating || refreshing) && (
        <div className="navigation-progress" role="progressbar" aria-label={t("Loading…")} />
      )}
      {error && (
        <div className="content-refresh-error container" role="alert">
          <span>{t("Unable to refresh content. Your current page is still available.")}</span>
          <button type="button" onClick={() => void retry()}>
            {t("Try again")}
          </button>
        </div>
      )}
      <main id="main-content" className="site-theme">{children}</main>
      <Footer />
    </div>
  );
}
