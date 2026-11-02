import { useLanguage } from "@/components/site/Language";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useSiteContent } from "./SiteContent";
import { Brand, NAV } from "./Header";

export function Footer() {
  const { t } = useLanguage();
  const { settings } = useSiteContent();
  return (
    <footer className="site-footer">
      <svg className="site-footer-ear left" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M20 0V20C20 9 11 0 0 0Z" />
      </svg>
      <svg className="site-footer-ear right" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M20 0V20C20 9 11 0 0 0Z" />
      </svg>
      <div className="footer-bar">
        <Brand />
        <nav className="footer-nav" aria-label={t("Footer navigation")}>
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} activeProps={{ className: "nav-active" }}>
              {t(item.label)}
            </Link>
          ))}
        </nav>
        <Link to="/contact" className="button footer-booking">
          {t("Let's make a show")}
          <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="footer-details">
        <p>
          {t("A little wonder goes a long way.")}
          <br />
          {t("Live shows, extraordinary people.")}
          <br />
          {t("Made in Ulaanbaatar.")}
        </p>
        <div className="footer-contact">
          <a href={"mailto:" + settings.email}>
            {settings.email} <ArrowUpRight size={15} />
          </a>
          <a href={"tel:" + settings.phone.replace(/\s/g, "")}>{settings.phone}</a>
        </div>
        <span className="footer-address">{settings.address}</span>
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
    </footer>
  );
}
