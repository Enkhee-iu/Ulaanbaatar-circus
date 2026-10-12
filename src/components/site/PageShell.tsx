import { useLanguage } from "@/components/site/Language";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useRouterState } from "@tanstack/react-router";
import { useContentStatus } from "./SiteContent";

export function PageShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const navigating = useRouterState({ select: (state) => state.isLoading });
  const { refreshing, error, retry } = useContentStatus();
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
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}
