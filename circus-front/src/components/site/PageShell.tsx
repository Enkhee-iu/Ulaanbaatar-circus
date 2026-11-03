import { useLanguage } from "@/components/site/Language";
import { useEffect, type ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useRouterState } from "@tanstack/react-router";
import { useContentStatus } from "./SiteContent";

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
    <div id="top" className="site-shell">
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
