import { useLanguage } from "@/components/site/Language";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Check, CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { PageShell } from "@/components/site/PageShell";
import { PageIntro } from "@/components/site/Sections";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): { show?: string } => ({
    show: typeof search.show === "string" ? search.show : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Let’s create — UB Circus" },
      {
        name: "description",
        content:
          "Start a conversation about your next show, brand event or creative production with UB Circus.",
      },
    ],
  }),
  component: ContactPage,
});
import { useSiteContent } from "@/components/site/SiteContent";

const EVENT_TYPES = ["Gala", "Festival", "Brand launch", "Private event", "Film / media"] as const;
const BUDGETS = ["Not sure yet", "Under $5k", "$5k–$15k", "$15k–$40k", "$40k+"] as const;

function ContactPage() {
  const { t } = useLanguage();
  const { settings } = useSiteContent();
  const { show } = Route.useSearch();
  const [eventType, setEventType] = useState<string>("Gala");
  const [budget, setBudget] = useState<string>("Not sure yet");
  const [draft, setDraft] = useState<string | null>(null);

  function prepareDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = [
      t("Hello UB Circus,"),
      "",
      String(data.get("brief")),
      "",
      ...(show ? [t("Interested in:") + " " + show] : []),
      t("Name:") + " " + data.get("name"),
      t("Email:") + " " + data.get("email"),
      t("Company / venue:") + " " + (data.get("company") || t("Not specified")),
      t("Event date:") + " " + (data.get("date") || t("Flexible")),
      t("City:") + " " + (data.get("city") || t("Not specified")),
      t("Audience:") + " " + (data.get("audience") || t("Not specified")),
      t("Event type:") + " " + t(eventType),
      t("Budget:") + " " + t(budget),
    ].join("\n");
    setDraft(
      "mailto:" +
        settings.email +
        "?subject=" +
        encodeURIComponent(show ? t("Show enquiry:") + " " + show : t("Let’s create a show")) +
        "&body=" +
        encodeURIComponent(body),
    );
  }

  return (
    <PageShell>
      <PageIntro
        eyebrow={t("Good things start here")}
        title={
          <>
            {t("Your idea.")}
            <br />
            <span className="accent-text">{t("Our next act.")}</span>
          </>
        }
        description={t(
          "A big vision or a small spark — we’d love to hear it. Tell us a little about your event and let’s see what’s possible.",
        )}
      />
      <section className="container contact-layout">
        <aside className="contact-aside">
          <div className="contact-panel">
            <span className="eyebrow">{t("Let’s talk")}</span>
            <h2>
              {t("Real people.")}
              <br />
              {t("Fresh possibilities.")}
            </h2>
            <p>
              {t(
                "We’ll help you find the right performers, production and feeling for your audience.",
              )}
            </p>
            <a href={"mailto:" + settings.email} className="contact-detail">
              <span className="contact-detail-icon">
                <Mail size={19} />
              </span>
              <span>
                <small>{t("Email us")}</small>
                {settings.email}
              </span>
              <ArrowUpRight size={18} />
            </a>
            <a href={"tel:" + settings.phone.replace(/\s/g, "")} className="contact-detail">
              <span className="contact-detail-icon">
                <Phone size={19} />
              </span>
              <span>
                <small>{t("Give us a call")}</small>
                {settings.phone}
              </span>
              <ArrowUpRight size={18} />
            </a>
            <div className="contact-detail">
              <span className="contact-detail-icon">
                <MapPin size={19} />
              </span>
              <span>
                <small>{t("Find the studio")}</small>
                <span style={{ whiteSpace: "pre-line" }}>{settings.address}</span>
              </span>
            </div>
          </div>
          <div className="contact-process">
            <span className="eyebrow">{t("From spark to spotlight")}</span>
            {[
              ["01", "Tell us the idea", "Your date, venue, audience and what you have in mind."],
              [
                "02",
                "Shape it together",
                "We suggest the acts, creative direction and production.",
              ],
              ["03", "Make it happen", "The artists, rehearsals and final show, brought together."],
            ].map(([number, title, text]) => (
              <div key={number}>
                <span>{number}</span>
                <div>
                  <h3>{t(title)}</h3>
                  <p>{t(text)}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
        <div className="enquiry-panel">
          {draft && (
            <div className="draft-ready" tabIndex={-1} ref={(node) => node?.focus()}>
              <span className="draft-check">
                <CheckCircle2 size={38} />
              </span>
              <span className="eyebrow">{t("One last step")}</span>
              <h2>
                {t("Your brief")}
                <br />
                {t("is ready.")}
              </h2>
              <p>
                {t(
                  "Open the draft in your email app, review it, then send it to our team. Your request hasn’t been sent yet.",
                )}
              </p>
              <a href={draft} className="button button-lime">
                {t("Open email draft")}
                <ArrowUpRight size={18} />
              </a>
              <p className="draft-help">
                {t("No email app? Email us directly at")}{" "}
                <a href={"mailto:" + settings.email}>{settings.email}</a>.
              </p>
              <button className="text-link" type="button" onClick={() => setDraft(null)}>
                <ArrowLeft size={16} />
                {t("Back to the form")}
              </button>
            </div>
          )}
          <form hidden={Boolean(draft)} onSubmit={prepareDraft}>
            <div className="form-heading">
              <span className="eyebrow">{t("A little about your event")}</span>
              <h2>{t("Let’s build the brief.")}</h2>
              <p>{t("Fields marked * are required.")}</p>
            </div>
            {show && (
              <div className="selected-show">
                <Check size={16} />
                {t("Interested in: ")}
                <strong>{show}</strong>
                <Link to="/contact" search={{ show: undefined }}>
                  {t("Clear")}
                </Link>
              </div>
            )}
            <div className="form-grid">
              <Field
                label={t("Your name")}
                name="name"
                placeholder={t("Your full name")}
                autoComplete="name"
                required
              />
              <Field
                label={t("Email address")}
                name="email"
                type="email"
                placeholder={t("you@company.com")}
                autoComplete="email"
                required
              />
              <Field
                label={t("Company or venue")}
                name="company"
                placeholder={t("Company / venue name")}
                autoComplete="organization"
              />
              <Field label={t("Event date")} name="date" type="date" />
              <Field
                label={t("City")}
                name="city"
                placeholder={t("Ulaanbaatar, or further afield")}
                autoComplete="address-level2"
              />
              <Field
                label={t("Audience size")}
                name="audience"
                type="number"
                placeholder={t("Approximate guests")}
                min="1"
              />
            </div>
            <fieldset className="form-fieldset">
              <legend>{t("What are you planning?")}</legend>
              <div className="choice-group">
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={eventType === type}
                    className={"choice-chip" + (eventType === type ? " selected" : "")}
                    onClick={() => setEventType(type)}
                  >
                    {t(type)}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="form-field">
              <label htmlFor="budget">
                {t("Budget range ")}
                <span>{t("(optional)")}</span>
              </label>
              <select
                id="budget"
                name="budget"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
              >
                {BUDGETS.map((item) => (
                  <option key={item} value={item}>
                    {t(item)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="brief">
                {t("What do you have in mind? ")}
                <span>*</span>
              </label>
              <textarea
                id="brief"
                name="brief"
                required
                rows={5}
                maxLength={2000}
                defaultValue={show ? t("I’m interested in") + " " + show + ". " : ""}
                placeholder={t(
                  "The feeling, the occasion, the big idea. Tell us what you’re imagining.",
                )}
              />
            </div>
            <div className="form-bottom">
              <p>{t("We’ll prepare an email draft for you to review and send.")}</p>
              <button type="submit" className="button button-lime">
                {t("Prepare my enquiry")}
                <ArrowUpRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </section>
    </PageShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  required,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  min?: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {t(label)}
        {required && <span> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        min={min}
        maxLength={type === "text" || type === "email" ? 150 : undefined}
      />
    </div>
  );
}
