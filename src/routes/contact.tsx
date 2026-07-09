import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — UB Circus" },
      { name: "description", content: "Book a show, collaborate, or say hello to UB Circus." },
      { property: "og:title", content: "Contact — UB Circus" },
      { property: "og:description", content: "Book a show or collaborate with UB Circus." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <PageShell>
      <section className="border-b border-foreground/15">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-6 pt-16 pb-20 md:grid-cols-12 md:px-10 md:pt-24">
          <div className="md:col-span-6">
            <p className="font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Say hello
            </p>
            <h1 className="mt-4 font-display text-[14vw] leading-[0.85] md:text-[8vw]">
              Book a
              <br />
              show.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/75">
              Tell us about the stage, the audience and the date. We'll come back
              within two working days with a shape for the show.
            </p>

            <dl className="mt-12 space-y-6 border-t border-foreground/20 pt-6">
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Studio</dt>
                <dd className="mt-1 font-display text-xl">Peace Ave 42, Sükhbaatar, UB</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Email</dt>
                <dd className="mt-1 font-display text-xl">
                  <a href="mailto:hello@ubcircus.mn" className="underline underline-offset-4">
                    hello@ubcircus.mn
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Phone</dt>
                <dd className="mt-1 font-display text-xl">+976 9900 0000</dd>
              </div>
            </dl>
          </div>

          <div className="md:col-span-6">
            {sent ? (
              <div className="border border-foreground p-8">
                <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Message received
                </p>
                <h2 className="mt-4 font-display text-4xl leading-none">Thank you.</h2>
                <p className="mt-4 text-sm text-foreground/75">
                  We'll be in touch within two working days.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="border border-foreground p-6 md:p-10"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Name" name="name" required />
                  <Field label="Email" name="email" type="email" required />
                  <Field label="Company / Venue" name="company" />
                  <Field label="Date" name="date" type="date" />
                </div>
                <div className="mt-6">
                  <label className="block font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    What are you planning?
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="mt-2 w-full resize-none border-b border-foreground bg-transparent py-2 text-base outline-none focus:border-b-2"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-8 inline-flex items-center gap-3 bg-foreground px-6 py-4 font-display text-base uppercase tracking-[0.2em] text-background transition-transform hover:-translate-y-0.5"
                >
                  Send message →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
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
        className="mt-2 w-full border-b border-foreground bg-transparent py-2 text-base outline-none focus:border-b-2"
      />
    </div>
  );
}
