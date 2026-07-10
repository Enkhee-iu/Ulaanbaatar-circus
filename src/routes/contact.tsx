import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact - UB Circus" },
      { name: "description", content: "Book a show, collaborate, or say hello to UB Circus." },
      { property: "og:title", content: "Contact - UB Circus" },
      { property: "og:description", content: "Book a show or collaborate with UB Circus." },
    ],
  }),
  component: ContactPage,
});

const EVENT_TYPES = ["Gala", "Festival", "Brand launch", "Private event", "Film / media"] as const;
const BUDGETS = ["Under $5k", "$5k - $15k", "$15k - $40k", "$40k+"] as const;
const PROCESS = [
  { step: "01", title: "Brief", copy: "Share the venue, date, audience and the feeling you want in the room." },
  { step: "02", title: "Shape", copy: "We suggest acts, duration, technical notes and a production direction." },
  { step: "03", title: "Stage", copy: "Artists, rehearsal, lighting cues and show management arrive as one package." },
] as const;

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [eventType, setEventType] = useState<(typeof EVENT_TYPES)[number]>("Gala");
  const [budget, setBudget] = useState<(typeof BUDGETS)[number]>("$5k - $15k");

  return (
    <PageShell>
      <section className="paper-grid border-b border-foreground/15">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-6 pb-20 pt-16 md:grid-cols-12 md:px-10 md:pb-28 md:pt-24">
          <div className="md:col-span-5">
            <div className="border-y border-foreground/15 py-3 font-display text-xs uppercase tracking-[0.32em] text-muted-foreground">
              Booking office / Ulaanbaatar
            </div>
            <h1 className="mt-7 font-display text-7xl leading-[0.82] sm:text-8xl md:text-9xl">
              Build the
              <br />
              next act.
            </h1>
            <p className="mt-8 max-w-lg border-l-2 border-foreground pl-5 text-lg leading-relaxed text-foreground/80">
              Send a compact brief and we will come back with a show shape,
              production notes and availability within two working days.
            </p>

            <div className="mt-10 grid gap-px bg-foreground/15">
              <ContactTile label="Email" value="hello@ubcircus.mn" href="mailto:hello@ubcircus.mn" />
              <ContactTile label="Phone" value="+976 9900 0000" href="tel:+97699000000" />
              <ContactTile label="Studio" value="Peace Ave 42, Sukhbaatar, UB" />
            </div>

            <div className="mt-10 border border-foreground/20 bg-background/70 p-5">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Fast track
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                For events inside 14 days, include stage dimensions, call time,
                ceiling height and whether aerial rigging is possible.
              </p>
            </div>
          </div>

          <div className="md:col-span-7">
            {sent ? (
              <div className="border border-foreground bg-foreground p-8 text-background md:p-10">
                <p className="font-display text-xs uppercase tracking-[0.3em] text-background/60">
                  Message received
                </p>
                <h2 className="mt-4 font-display text-6xl leading-none">Thank you.</h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-background/75">
                  Your brief is staged. We will reply within two working days with
                  the first shape for the production.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-8 border border-background/70 px-5 py-3 font-display text-sm uppercase tracking-[0.2em] transition-colors hover:bg-background hover:text-foreground"
                >
                  Send another brief
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="border border-foreground bg-background/80"
              >
                <div className="border-b border-foreground px-6 py-5 md:px-8">
                  <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Production brief
                  </p>
                  <h2 className="mt-2 font-display text-4xl leading-none">Tell us what to build.</h2>
                </div>

                <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
                  <Field label="Name" name="name" required />
                  <Field label="Email" name="email" type="email" required />
                  <Field label="Company / Venue" name="company" />
                  <Field label="Event date" name="date" type="date" />
                  <Field label="City" name="city" />
                  <Field label="Audience size" name="audience" type="number" min="1" />
                </div>

                <div className="grid gap-6 border-t border-foreground/15 p-6 md:grid-cols-2 md:p-8">
                  <SegmentedField
                    label="Event type"
                    options={EVENT_TYPES}
                    value={eventType}
                    onChange={setEventType}
                  />
                  <SegmentedField
                    label="Budget range"
                    options={BUDGETS}
                    value={budget}
                    onChange={setBudget}
                  />
                </div>

                <div className="border-t border-foreground/15 p-6 md:p-8">
                  <label className="block font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    What should the audience feel?
                  </label>
                  <textarea
                    name="brief"
                    required
                    rows={6}
                    placeholder="Aerial opener, roaming performers, reveal moment, full evening production..."
                    className="mt-3 w-full resize-none border border-foreground/30 bg-transparent p-4 text-base outline-none transition-colors placeholder:text-foreground/35 focus:border-foreground"
                  />
                </div>

                <div className="flex flex-col gap-4 border-t border-foreground p-6 md:flex-row md:items-center md:justify-between md:p-8">
                  <p className="max-w-sm text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    We reply with availability, show direction and next production steps.
                  </p>
                  <button
                    type="submit"
                    className="inline-flex w-fit items-center gap-3 bg-foreground px-6 py-4 font-display text-base uppercase tracking-[0.2em] text-background shadow-[6px_6px_0_0_oklch(0.12_0_0_/_0.18)] transition-transform hover:-translate-y-0.5"
                  >
                    Send brief &rarr;
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-foreground/15">
        <div className="mx-auto grid max-w-[1440px] gap-px bg-foreground/15 px-6 py-16 md:grid-cols-3 md:px-10 md:py-24">
          {PROCESS.map((item) => (
            <article key={item.step} className="bg-background p-6 md:p-8">
              <div className="flex items-baseline justify-between border-b border-foreground/15 pb-4">
                <span className="font-display text-5xl text-foreground/20">{item.step}</span>
                <span className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Process
                </span>
              </div>
              <h3 className="mt-6 font-display text-4xl leading-none">{item.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/70">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function ContactTile({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-baseline justify-between gap-4 bg-background/80 px-4 py-4">
      <span className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </span>
      <span className="text-right font-display text-xl leading-none">{value}</span>
    </div>
  );

  return href ? (
    <a href={href} className="transition-colors hover:bg-foreground hover:text-background">
      {content}
    </a>
  ) : (
    content
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: string;
}) {
  return (
    <div>
      <label className="block font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        className="mt-3 w-full border-b border-foreground bg-transparent py-2 text-base outline-none transition-colors focus:border-b-2"
      />
    </div>
  );
}

function SegmentedField<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-3 grid gap-px bg-foreground/20">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-4 py-3 text-left font-display text-sm uppercase tracking-[0.18em] transition-colors ${
              value === option
                ? "bg-foreground text-background"
                : "bg-background text-foreground hover:bg-foreground/10"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
