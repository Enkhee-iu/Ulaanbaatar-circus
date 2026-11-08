import { useLanguage } from "@/components/site/Language";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useSiteContent } from "./SiteContent";
import { LanguageSwitcher } from "./Language";

export const NAV = [
  { to: "/shows", label: "Shows" },
  { to: "/events", label: "Events" },
  { to: "/projects", label: "Our work" },
  { to: "/contact", label: "Contact" },
] as const;

export function Brand() {
  const { t } = useLanguage();
  const { settings } = useSiteContent();
  return (
    <Link to="/" className="brand" aria-label={t("Ulaanbaatar Circus home")}>
      <img className="brand-logo" src="/ubcircus-logo.png" alt="Ulaanbaatar Circus — Be different" />
      <span className="brand-name" title={settings.brandName}>
        {settings.brandName}
      </span>
    </Link>
  );
}

export function Header() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    }
    // While the menu is open the page behind it holds still, and the menu closes once the window is
    // wide enough for the desktop links.
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 901px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);
  return (
    <header className="site-header">
      <svg className="site-header-ear left" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M20 0V20C20 9 11 0 0 0Z" />
      </svg>
      <svg className="site-header-ear right" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M20 0V20C20 9 11 0 0 0Z" />
      </svg>
      <div className="container header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label={t("Main navigation")}>
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} activeProps={{ className: "nav-active" }}>
              {t(item.label)}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <div className="header-controls">
            <LanguageSwitcher />
          </div>
          <Link to="/contact" className="button button-lime header-booking">
            {t("Let's make a show")}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <button
          ref={menuButton}
          className="icon-button mobile-toggle"
          type="button"
          aria-label={t(open ? "Close navigation" : "Open navigation")}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-nav container"
          aria-label={t("Mobile navigation")}
        >
          {NAV.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              onClickCapture={() => setOpen(false)}
              activeProps={{ className: "nav-active" }}
            >
              <span className="nav-number">0{i + 1}</span>
              {t(item.label)}
              <ArrowUpRight size={22} />
            </Link>
          ))}
          <Link to="/contact" onClickCapture={() => setOpen(false)} className="button button-lime">
            {t("Let's make a show")}
            <ArrowUpRight size={18} />
          </Link>
        </nav>
      )}
    </header>
  );
}
