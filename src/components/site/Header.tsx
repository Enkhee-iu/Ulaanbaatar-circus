import { Link } from "@tanstack/react-router";
import { useState } from "react";

const NAV = [
  { to: "/shows", label: "Shows" },
  { to: "/events", label: "Events" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-foreground/15 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-3xl leading-none tracking-wide">UB Circus</span>
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:inline">
            Est. Ulaanbaatar
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="font-display text-lg uppercase tracking-[0.18em] text-foreground/80 transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground underline underline-offset-[6px]" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/contact"
          className="hidden items-center gap-2 border border-foreground px-4 py-2 font-display text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background md:inline-flex"
        >
          Book a Show →
        </Link>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden"
        >
          <span className="font-display text-lg uppercase tracking-[0.2em]">
            {open ? "Close" : "Menu"}
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-foreground/15 md:hidden">
          <nav className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-6">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="font-display text-2xl uppercase tracking-[0.15em]"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex w-fit items-center gap-2 border border-foreground px-4 py-2 font-display text-sm uppercase tracking-[0.2em]"
            >
              Book a Show →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
