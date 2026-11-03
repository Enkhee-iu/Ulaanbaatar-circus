import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect } from "react";
import { applyPageMeta, BRAND_NAME } from "@/lib/page-meta";
import { useLanguage } from "./Language";
import { PageShell } from "./PageShell";

export function NotFoundPage() {
  const { t } = useLanguage();
  const message = t("The page you’re looking for has left the stage.");
  useEffect(() => {
    applyPageMeta(`${t("Page not found")} — ${BRAND_NAME}`, message);
  }, [t, message]);
  return (
    <PageShell>
      <section className="container not-found-page">
        <span className="eyebrow">404</span>
        <h1>{t("Page not found")}</h1>
        <p>{message}</p>
        <div className="not-found-actions">
          <Link to="/" className="button button-lime">
            {t("Back to home")}
            <ArrowUpRight size={18} />
          </Link>
          <Link to="/shows" className="button button-outline">
            {t("Explore our shows")}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
