import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-foreground/15 bg-foreground text-background">
      <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="font-display text-6xl leading-[0.9] md:text-8xl">
              The show
              <br />
              never sleeps.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-background/70">
              UB Circus — Ulaanbaatar-based show production house creating live
              performances, brand events, and cinematic projects across Mongolia
              and beyond.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="mb-4 font-display text-xs uppercase tracking-[0.3em] text-background/50">
              Contact
            </p>
            <ul className="space-y-2 text-sm text-background/85">
              <li>Peace Ave 42, Sükhbaatar District</li>
              <li>Ulaanbaatar, Mongolia</li>
              <li>
                <a href="mailto:hello@ubcircus.mn" className="underline-offset-4 hover:underline">
                  hello@ubcircus.mn
                </a>
              </li>
              <li>
                <a href="tel:+97699000000" className="underline-offset-4 hover:underline">
                  +976 9900 0000
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="mb-4 font-display text-xs uppercase tracking-[0.3em] text-background/50">
              Explore
            </p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shows" className="hover:underline">Shows</Link></li>
              <li><Link to="/events" className="hover:underline">Events</Link></li>
              <li><Link to="/projects" className="hover:underline">Projects</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="mb-4 font-display text-xs uppercase tracking-[0.3em] text-background/50">
              Follow
            </p>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:underline">Instagram</a></li>
              <li><a href="#" className="hover:underline">YouTube</a></li>
              <li><a href="#" className="hover:underline">Facebook</a></li>
              <li><a href="#" className="hover:underline">TikTok</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-background/15 pt-6 text-xs uppercase tracking-[0.2em] text-background/50 md:flex-row">
          <span>© {new Date().getFullYear()} UB Circus. All rights reserved.</span>
          <span>Made in Ulaanbaatar</span>
        </div>
      </div>
    </footer>
  );
}
