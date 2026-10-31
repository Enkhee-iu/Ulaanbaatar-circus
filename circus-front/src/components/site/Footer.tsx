import { useLanguage } from "@/components/site/Language";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useSiteContent } from "./SiteContent";
import { Brand } from "./Header";

export function Footer() {
  const { t } = useLanguage();
  const { settings } = useSiteContent();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-about">
            <Brand />
            <p>
              {t("A little wonder goes a long way.")}
              <br />
              {t("Live shows, extraordinary people.")}
              <br />
              {t("Made in Ulaanbaatar.")}
            </p>
          </div>
          <div className="footer-links">
            <span className="eyebrow">{t("Explore")}</span>
            <Link to="/shows">{t("Our shows")}</Link>
            <Link to="/events">{t("Events & dates")}</Link>
            <Link to="/projects">{t("Selected work")}</Link>
            <Link to="/contact">{t("Let’s talk")}</Link>
          </div>
          <div className="footer-links">
            <span className="eyebrow">{t("Say hello")}</span>
            <a href={"mailto:" + settings.email}>
              {settings.email} <ArrowUpRight size={15} />
            </a>
            <a href={"tel:" + settings.phone.replace(/\s/g, "")}>{settings.phone}</a>
            <span className="footer-address" style={{ whiteSpace: "pre-line" }}>
              {settings.address}
            </span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {settings.companyName}
          </span>
          <span>
            <span className="status-dot" />
            {t(" From Mongolia, with wonder.")}
          </span>
          <a href="#top">{t("Back to top ↑")}</a>
        </div>
      </div>
    </footer>
  );
}
