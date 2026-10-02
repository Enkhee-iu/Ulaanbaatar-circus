import { useLanguage } from "@/components/site/Language";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Asterisk, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useSiteContent } from "./SiteContent";
import { LanguageSwitcher } from "./Language";

const NAV = [
  { to: "/shows", label: "Shows" },
  { to: "/events", label: "Events" },
  { to: "/projects", label: "Our work" },
  { to: "/contact", label: "Contact" },
] as const;

export function Brand() {
  const { t } = useLanguage();
  const { settings } = useSiteContent();
  return (
    <Link to="/" className="brand" aria-label={t("UB Circus home")}>
      <span className="brand-symbol">
        <Asterisk size={27} strokeWidth={2.4} />
      </span>
      <span>{settings.brandName}</span>
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
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label={t("Main navigation")}>
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} activeProps={{ className: "nav-active" }}>
              {t(item.label)}
            </Link>
          ))}
        </nav>
        <LanguageSwitcher />
        <Link to="/contact" className="button button-lime header-booking">
          {t("Let’s make a show ")}
          <ArrowUpRight size={17} />
        </Link>
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
              onClick={() => setOpen(false)}
              activeProps={{ className: "nav-active" }}
            >
              <span className="nav-number">0{i + 1}</span>
              {t(item.label)}
              <ArrowUpRight size={22} />
            </Link>
          ))}
          <Link to="/contact" onClick={() => setOpen(false)} className="button button-lime">
            {t("Let’s make a show ")}
            <ArrowUpRight size={18} />
          </Link>
        </nav>
      )}
    </header>
  );
}
