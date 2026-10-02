import { useLanguage } from "@/components/site/Language";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function PageShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <div id="top" className="site-shell">
      <a href="#main-content" className="skip-link">
        {t("Skip to content")}
      </a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}
