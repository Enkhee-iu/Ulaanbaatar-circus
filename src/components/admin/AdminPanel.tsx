import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Asterisk,
  CalendarDays,
  Check,
  Eye,
  Film,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  contentSchema,
  type CollectionName,
  type ContentItem,
  type MediaItem,
  type SiteContent,
} from "@/lib/content-schema";
import { BUILTIN_IMAGES, imageSrc } from "@/lib/site-images";

type Auth = { configured: boolean; authenticated: boolean; email?: string };
type Section = "overview" | CollectionName | "media" | "settings";
const SECTIONS = [
  { id: "overview", label: "Хяналтын самбар", icon: LayoutDashboard },
  { id: "shows", label: "Тоглолтууд", icon: Sparkles },
  { id: "events", label: "Эвентүүд", icon: CalendarDays },
  { id: "projects", label: "Төслүүд", icon: Film },
  { id: "media", label: "Зургийн сан", icon: ImagePlus },
  { id: "settings", label: "Тохиргоо", icon: Settings },
] as const;
export async function adminApi<T>(action: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch("/api/admin/" + action, {
    method,
    credentials: "same-origin",
    headers:
      body instanceof FormData
        ? undefined
        : body === undefined
          ? undefined
          : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Хүсэлтийг гүйцэтгэж чадсангүй.");
  return data as T;
}
const message = (error: unknown) =>
  error instanceof Error ? error.message : "Алдаа гарлаа. Дахин оролдоно уу.";

export function AdminPanel() {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [section, setSection] = useState<Section>("overview");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  async function load() {
    setError("");
    try {
      const status = await adminApi<Auth>("status");
      setAuth(status);
      if (status.authenticated) setContent(await adminApi<SiteContent>("content"));
    } catch (e) {
      setError(message(e));
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function save(next: SiteContent) {
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const parsed = contentSchema.safeParse(next);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const saved = await adminApi<SiteContent>("content", "PUT", parsed.data);
      setContent(saved);
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      setNotice("Өөрчлөлт хадгалагдлаа.");
    } catch (e) {
      setError(message(e));
      throw e;
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await adminApi("logout", "POST");
      setContent(null);
      setAuth({ configured: true, authenticated: false });
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  if (!auth || (auth.authenticated && !content))
    return (
      <div className="ad-root ad-loading">
        <Asterisk size={36} />
        <p>{error || "Удирдлагыг нээж байна…"}</p>
        {error && <button onClick={() => void load()}>Дахин оролдох</button>}
      </div>
    );
  if (!auth.authenticated) return <AuthScreen configured={auth.configured} onSuccess={load} />;
  if (!content) return null;

  return (
    <div className="ad-root ad-layout">
      <aside className="ad-sidebar">
        <a href="/" className="ad-brand">
          <Asterisk size={30} />
          {content.settings.brandName}
        </a>
        <span className="ad-sidebar-label">УДИРДЛАГА</span>
        <nav aria-label="Удирдлагын цэс">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              aria-current={section === id ? "page" : undefined}
              className={section === id ? "active" : ""}
              onClick={() => {
                setSection(id);
                setError("");
                setNotice("");
              }}
            >
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>
        <div className="ad-sidebar-bottom">
          <div className="ad-local">
            <span />
            Local workspace
          </div>
          <small>Энэ компьютерт хадгалагдана</small>
          <a href="/" target="_blank" rel="noreferrer">
            Сайт харах <ArrowUpRight size={16} />
          </a>
        </div>
      </aside>
      <div className="ad-workspace">
        <header className="ad-topbar">
          <span>
            UB Circus{" "}
            <span className="ad-muted">/ {SECTIONS.find((s) => s.id === section)?.label}</span>
          </span>
          <div>
            <span className="ad-user">{auth.email}</span>
            <button
              className="ad-icon"
              disabled={busy}
              onClick={() => void logout()}
              title="Гарах"
              aria-label="Гарах"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="ad-main">
          {error && (
            <div className="ad-alert" role="alert">
              {error}
              <button onClick={() => void load()}>Мэдээллийг шинэчлэх</button>
            </div>
          )}
          {notice && (
            <div className="ad-success" role="status">
              <Check size={17} />
              {notice}
            </div>
          )}
          {section === "overview" && <Overview content={content} open={setSection} />}
          {(section === "shows" || section === "events" || section === "projects") && (
            <Collection key={section} name={section} content={content} save={save} busy={busy} />
          )}
          {section === "media" && <MediaLibrary />}
          {section === "settings" && (
            <SettingsEditor key={content.revision} content={content} save={save} busy={busy} />
          )}
        </main>
      </div>
    </div>
  );
}

function AuthScreen({
  configured,
  onSuccess,
}: {
  configured: boolean;
  onSuccess: () => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError("");
    if (!configured && data.get("password") !== data.get("confirm")) {
      setError("Нууц үгүүд таарахгүй байна.");
      return;
    }
    setBusy(true);
    try {
      await adminApi(configured ? "login" : "setup", "POST", {
        email: data.get("email"),
        password: data.get("password"),
      });
      await onSuccess();
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="ad-root ad-auth">
      <div className="ad-auth-art">
        <a className="ad-brand" href="/">
          <Asterisk size={30} />
          ub.circus
        </a>
        <div>
          <span className="ad-kicker">BEHIND THE EXTRAORDINARY</span>
          <h1>
            Тайзны арын
            <br />
            <em>таны орон зай.</em>
          </h1>
          <p>
            Тоглолт, эвент, зураг, мэдээллээ
            <br />
            нэг газраас удирдаарай.
          </p>
        </div>
        <span className="ad-local">
          <span />
          Local workspace · UB Circus
        </span>
      </div>
      <div className="ad-auth-form">
        <a href="/" className="ad-back">
          ← Сайт руу буцах
        </a>
        <div>
          <span className="ad-kicker">{configured ? "WELCOME BACK" : "LET’S GET STARTED"}</span>
          <h2>{configured ? "Тавтай морил." : "Админаа үүсгэе."}</h2>
          <p>
            {configured
              ? "Мэдээллээ удирдахын тулд нэвтэрнэ үү."
              : "Эхний тохиргоо. Өөрийн имэйл болон нууц үгийг үүсгээрэй."}
          </p>
          <form onSubmit={submit}>
            <label className="ad-field">
              Имэйл
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                maxLength={150}
                placeholder="you@example.com"
              />
            </label>
            <label className="ad-field">
              Нууц үг
              <input
                name="password"
                type="password"
                autoComplete={configured ? "current-password" : "new-password"}
                required
                minLength={12}
                maxLength={200}
              />
              {!configured && <small>Хамгийн багадаа 12 тэмдэгт.</small>}
            </label>
            {!configured && (
              <label className="ad-field">
                Нууц үг давтах
                <input
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={200}
                />
              </label>
            )}
            {error && (
              <p className="ad-alert" role="alert">
                {error}
              </p>
            )}
            <button className="ad-button ad-primary" disabled={busy}>
              {busy ? "Түр хүлээнэ үү…" : configured ? "Нэвтрэх" : "Админ үүсгэх"}
              <ArrowUpRight size={18} />
            </button>
          </form>
          <p className="ad-auth-note">Өгөгдөл энэ компьютерийн серверт хадгалагдана.</p>
        </div>
      </div>
    </div>
  );
}

function Heading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="ad-heading">
      <div>
        <span className="ad-kicker">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
function Overview({ content, open }: { content: SiteContent; open: (s: Section) => void }) {
  const collections = ["shows", "events", "projects"] as const;
  return (
    <>
      <Heading
        eyebrow="YOUR CREATIVE WORKSPACE"
        title="Бүх зүйл нэг дор."
        description="Сайтынхаа агуулгыг шинэчилж, дараагийн гайхалтай мөчийг бүтээгээрэй."
      >
        <a href="/" target="_blank" rel="noreferrer" className="ad-button">
          <Eye size={17} />
          Сайт харах
        </a>
      </Heading>
      <div className="ad-stats">
        {collections.map((key, i) => {
          const items = content[key];
          const Icon = SECTIONS[i + 1].icon;
          return (
            <button key={key} onClick={() => open(key)} className="ad-stat">
              <span>
                {SECTIONS[i + 1].label}
                <Icon size={20} />
              </span>
              <strong>{items.length.toString().padStart(2, "0")}</strong>
              <small>
                {items.filter((x) => x.status === "published").length} нийтэлсэн ·{" "}
                {items.filter((x) => x.status === "draft").length} ноорог
              </small>
            </button>
          );
        })}
      </div>
      <div className="ad-overview-grid">
        <section className="ad-card">
          <div className="ad-card-heading">
            <h2>Дараагийн алхам</h2>
            <span className="ad-pill">Quick actions</span>
          </div>
          {[
            {
              id: "shows",
              title: "Тоглолтуудаа шинэчлэх",
              desc: "Шинэ үзүүлбэр, тайлбар болон зураг нэмэх",
              icon: Sparkles,
            },
            {
              id: "media",
              title: "Зургаа солих",
              desc: "Өөрийн зураг оруулаад сайтдаа сонгох",
              icon: ImagePlus,
            },
            {
              id: "settings",
              title: "Сайтын мэдээлэл",
              desc: "Нүүр хуудас, холбоо барих мэдээлэл засах",
              icon: Settings,
            },
          ].map(({ id, title, desc, icon: Icon }) => (
            <button className="ad-action-row" key={id} onClick={() => open(id as Section)}>
              <span className="ad-action-icon">
                <Icon size={21} />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{desc}</small>
              </span>
              <ArrowUpRight size={19} />
            </button>
          ))}
        </section>
        <section className="ad-feature">
          <Asterisk size={58} />
          <span className="ad-kicker">MADE TO BE SEEN</span>
          <h2>
            Шинэ санаа.
            <br />
            Шинэ тайз.
          </h2>
          <p>
            Нийтэлсэн мэдээлэл сайт дээр харагдана. Ноорог мэдээллийг бэлдэж байгаад хүссэн үедээ
            нийтлээрэй.
          </p>
          <button className="ad-button ad-primary" onClick={() => open("shows")}>
            Агуулгаа удирдах <ArrowUpRight size={18} />
          </button>
        </section>
      </div>
      <div className="ad-save-info">
        <span className="ad-local">
          <span />
          Файлд хадгалдаг
        </span>
        <span>
          {content.updatedAt
            ? "Сүүлд шинэчилсэн: " + new Date(content.updatedAt).toLocaleString("mn-MN")
            : "Анхны агуулга · өөрчлөлт хараахан хадгалаагүй"}
        </span>
      </div>
    </>
  );
}

const CONFIG = {
  shows: {
    title: "Тоглолтууд",
    singular: "Тоглолт",
    categories: ["Aerial", "Theatre", "Illusion", "Touring"],
  },
  events: {
    title: "Эвентүүд",
    singular: "Эвент",
    categories: ["Public", "Family", "Private", "Touring"],
  },
  projects: { title: "Төслүүд", singular: "Төсөл", categories: ["Film", "Brand", "Stage"] },
};
function blankItem(name: CollectionName): ContentItem {
  const base = { id: crypto.randomUUID(), title: "", status: "draft" as const };
  if (name === "shows")
    return {
      ...base,
      category: "Aerial",
      duration: "20 min",
      image: "builtin:acrobatics",
      description: "",
      tags: [],
    };
  if (name === "events")
    return {
      ...base,
      category: "Public",
      date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ulaanbaatar" }),
      time: "19:00",
      venue: "",
    };
  return {
    ...base,
    category: "Stage",
    type: "Live production",
    client: "",
    year: String(new Date().getFullYear()),
    image: "builtin:hero",
    description: "",
    scope: [],
  };
}
function Collection({
  name,
  content,
  save,
  busy,
}: {
  name: CollectionName;
  content: SiteContent;
  save: (c: SiteContent) => Promise<void>;
  busy: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [deleting, setDeleting] = useState<ContentItem | null>(null);
  const [dialogError, setDialogError] = useState("");
  const items: ContentItem[] = content[name];
  const visible = items.filter(
    (x) =>
      x.title.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "all" || x.status === filter),
  );
  async function persist(list: ContentItem[]) {
    await save({ ...content, [name]: list });
  }
  async function move(index: number, offset: number) {
    const list = [...items];
    [list[index], list[index + offset]] = [list[index + offset], list[index]];
    try {
      await persist(list);
    } catch {
      /* parent displays error */
    }
  }
  return (
    <>
      <Heading
        eyebrow="CONTENT COLLECTION"
        title={CONFIG[name].title}
        description="Нэмэх, засах, нийтлэх болон харагдах дарааллыг өөрчлөх."
      >
        <button
          className="ad-button ad-primary"
          disabled={busy}
          onClick={() => {
            setDialogError("");
            setEditing(blankItem(name));
          }}
        >
          <Plus size={18} />
          {CONFIG[name].singular} нэмэх
        </button>
      </Heading>
      <div className="ad-toolbar">
        <label className="ad-search">
          <Search size={18} />
          <input
            aria-label="Нэрээр хайх"
            placeholder="Нэрээр хайх…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Төлөвөөр шүүх"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Бүх төлөв</option>
          <option value="published">Нийтэлсэн</option>
          <option value="draft">Ноорог</option>
        </select>
        <span>{visible.length} бичлэг</span>
      </div>
      <div className="ad-card ad-collection">
        {visible.length === 0 ? (
          <div className="ad-empty">
            <Search size={30} />
            <h2>Бичлэг олдсонгүй</h2>
            <p>Хайлтаа өөрчлөх эсвэл шинэ бичлэг нэмээрэй.</p>
          </div>
        ) : (
          visible.map((item) => {
            const index = items.findIndex((x) => x.id === item.id);
            return (
              <div className="ad-item" key={item.id}>
                {"image" in item ? (
                  <img src={imageSrc(item.image)} alt={item.title} />
                ) : (
                  <div className="ad-date">
                    <strong>{item.date.slice(8)}</strong>
                    <small>{item.date.slice(0, 7)}</small>
                  </div>
                )}
                <div className="ad-item-info">
                  <h2>{item.title}</h2>
                  <p>
                    {item.category}
                    {"date" in item
                      ? " · " + item.date + " · " + item.time
                      : "duration" in item
                        ? " · " + item.duration
                        : " · " + item.client}
                  </p>
                </div>
                <span className={"ad-status " + item.status}>
                  {item.status === "published" ? "Нийтэлсэн" : "Ноорог"}
                </span>
                <div className="ad-item-actions">
                  <button
                    className="ad-icon"
                    aria-label={item.title + " дээш"}
                    title="Дээш"
                    disabled={busy || index === 0}
                    onClick={() => void move(index, -1)}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    className="ad-icon"
                    aria-label={item.title + " доош"}
                    title="Доош"
                    disabled={busy || index === items.length - 1}
                    onClick={() => void move(index, 1)}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    className="ad-icon"
                    title="Засах"
                    aria-label={item.title + " засах"}
                    disabled={busy}
                    onClick={() => {
                      setDialogError("");
                      setEditing(item);
                    }}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    className="ad-icon ad-danger"
                    title="Устгах"
                    aria-label={item.title + " устгах"}
                    disabled={busy}
                    onClick={() => {
                      setDialogError("");
                      setDeleting(item);
                    }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <Dialog.Root
        open={!!editing}
        onOpenChange={(open) => {
          if (!open && !busy) setEditing(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="ad-overlay" />
          <Dialog.Content className="ad-dialog ad-root">
            <div className="ad-dialog-heading">
              <Dialog.Title>
                {CONFIG[name].singular}{" "}
                {editing && items.some((x) => x.id === editing.id) ? "засах" : "нэмэх"}
              </Dialog.Title>
              <Dialog.Close disabled={busy} className="ad-icon" aria-label="Хаах">
                <X size={21} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="ad-muted">
              Мэдээллээ бөглөөд хадгална уу. Ноорог сайт дээр харагдахгүй.
            </Dialog.Description>
            {editing && (
              <ItemEditor
                key={editing.id}
                item={editing}
                name={name}
                busy={busy}
                error={dialogError}
                onSave={async (item) => {
                  try {
                    const exists = items.some((x) => x.id === item.id);
                    await persist(
                      exists ? items.map((x) => (x.id === item.id ? item : x)) : [...items, item],
                    );
                    setEditing(null);
                  } catch (e) {
                    setDialogError(message(e));
                  }
                }}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleting(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="ad-overlay" />
          <Dialog.Content className="ad-dialog ad-root ad-small-dialog">
            <Dialog.Title>Бичлэг устгах уу?</Dialog.Title>
            <Dialog.Description>
              “{deleting?.title}” сайт болон удирдлагаас устна.
            </Dialog.Description>
            {dialogError && (
              <p className="ad-alert" role="alert">
                {dialogError}
              </p>
            )}
            <div className="ad-form-actions">
              <Dialog.Close disabled={busy} className="ad-button">
                Болих
              </Dialog.Close>
              <button
                disabled={busy}
                className="ad-button ad-delete"
                onClick={async () => {
                  try {
                    await persist(items.filter((x) => x.id !== deleting?.id));
                    setDeleting(null);
                  } catch (e) {
                    setDialogError(message(e));
                  }
                }}
              >
                {busy ? "Устгаж байна…" : "Устгах"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function ItemEditor({
  item,
  name,
  busy,
  error,
  onSave,
}: {
  item: ContentItem;
  name: CollectionName;
  busy: boolean;
  error: string;
  onSave: (item: ContentItem) => Promise<void>;
}) {
  const [image, setImage] = useState("image" in item ? item.image : "");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const next = {
      ...item,
      title: String(f.get("title")),
      titleMn: String(f.get("titleMn") || ""),
      category: String(f.get("category")),
      status: String(f.get("status")),
    };
    const value =
      name === "events"
        ? {
            ...next,
            date: String(f.get("date")),
            time: String(f.get("time")),
            venue: String(f.get("venue")),
            venueMn: String(f.get("venueMn") || ""),
          }
        : name === "shows"
          ? {
              ...next,
              image,
              description: String(f.get("description")),
              descriptionMn: String(f.get("descriptionMn") || ""),
              tagsMn: String(f.get("tagsMn") || "")
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
              duration: String(f.get("duration")),
              tags: String(f.get("tags"))
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
            }
          : {
              ...next,
              image,
              description: String(f.get("description")),
              descriptionMn: String(f.get("descriptionMn") || ""),
              typeMn: String(f.get("typeMn") || ""),
              scopeMn: String(f.get("scopeMn") || "")
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
              type: String(f.get("type")),
              client: String(f.get("client")),
              year: String(f.get("year")),
              scope: String(f.get("scope"))
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
            };
    await onSave(value as ContentItem);
  }
  return (
    <form onSubmit={submit} className="ad-edit-form">
      <div className="ad-form-grid">
        <Field label="Нэр (English)" name="title" value={item.title} max={150} wide />
        <label className="ad-field">
          Ангилал
          <select name="category" defaultValue={item.category}>
            {CONFIG[name].categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="ad-field">
          Төлөв
          <select name="status" defaultValue={item.status}>
            <option value="draft">Ноорог</option>
            <option value="published">Нийтлэх</option>
          </select>
        </label>
        {"date" in item && (
          <>
            <Field label="Огноо" name="date" value={item.date} type="date" />
            <Field label="Цаг" name="time" value={item.time} type="time" />
            <Field label="Байршил" name="venue" value={item.venue} max={200} wide />
          </>
        )}
        {"duration" in item && (
          <>
            <Field label="Үргэлжлэх хугацаа" name="duration" value={item.duration} max={30} />
            <Field
              label="Шошго (таслалаар тусгаарлах)"
              name="tags"
              value={item.tags.join(", ")}
              max={730}
              required={false}
            />
          </>
        )}
        {"client" in item && (
          <>
            <Field label="Төрөл" name="type" value={item.type} max={100} />
            <Field label="Он" name="year" value={item.year} max={4} pattern="[0-9]{4}" />
            <Field label="Харилцагч" name="client" value={item.client} max={150} />
            <Field
              label="Хамрах хүрээ (таслалаар)"
              name="scope"
              value={item.scope.join(", ")}
              max={730}
              required={false}
            />
          </>
        )}
        {"description" in item && (
          <label className="ad-field ad-wide">
            Тайлбар (English)
            <textarea
              name="description"
              defaultValue={item.description}
              rows={4}
              required
              maxLength={1600}
            />
          </label>
        )}
      </div>
      <details className="ad-translations" open={Boolean(item.titleMn)}>
        <summary>Монгол хэлний хувилбар</summary>
        <p className="ad-muted">
          Монгол хувилбарыг энд бичээрэй. Хоосон талбарт суурь орчуулга, эсвэл Англи текст
          харагдана.
        </p>
        <div className="ad-form-grid">
          <Field
            label="Нэр (Монгол)"
            name="titleMn"
            value={item.titleMn || ""}
            max={150}
            required={false}
            wide
          />
          {"description" in item && (
            <label className="ad-field ad-wide">
              Тайлбар (Монгол)
              <textarea
                name="descriptionMn"
                defaultValue={item.descriptionMn || ""}
                rows={4}
                maxLength={1600}
              />
            </label>
          )}
          {"venue" in item && (
            <Field
              label="Байршил (Монгол)"
              name="venueMn"
              value={item.venueMn || ""}
              max={200}
              required={false}
              wide
            />
          )}
          {"tags" in item && (
            <Field
              label="Шошго (Монгол, таслалаар)"
              name="tagsMn"
              value={item.tagsMn?.join(", ") || ""}
              max={730}
              required={false}
              wide
            />
          )}
          {"type" in item && (
            <Field
              label="Төрөл (Монгол)"
              name="typeMn"
              value={item.typeMn || ""}
              max={100}
              required={false}
            />
          )}
          {"scope" in item && (
            <Field
              label="Хамрах хүрээ (Монгол, таслалаар)"
              name="scopeMn"
              value={item.scopeMn?.join(", ") || ""}
              max={730}
              required={false}
            />
          )}
        </div>
      </details>
      {"image" in item && <ImagePicker value={image} onChange={setImage} />}
      {error && (
        <p className="ad-alert" role="alert">
          {error}
        </p>
      )}
      <div className="ad-form-actions">
        <Dialog.Close className="ad-button" disabled={busy}>
          Болих
        </Dialog.Close>
        <button className="ad-button ad-primary" disabled={busy}>
          {busy ? "Хадгалж байна…" : "Хадгалах"}
          <Check size={17} />
        </button>
      </div>
    </form>
  );
}
function Field({
  label,
  name,
  value,
  type = "text",
  max = 300,
  wide = false,
  required = true,
  pattern,
}: {
  label: string;
  name: string;
  value: string;
  type?: string;
  max?: number;
  wide?: boolean;
  required?: boolean;
  pattern?: string;
}) {
  return (
    <label className={"ad-field" + (wide ? " ad-wide" : "")}>
      {label}
      <input
        name={name}
        defaultValue={value}
        type={type}
        maxLength={max}
        required={required}
        pattern={pattern}
      />
    </label>
  );
}

function useMedia() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    adminApi<MediaItem[]>("media")
      .then(setMedia)
      .catch((e) => setError(message(e)));
  }, []);
  async function upload(file: File) {
    setError("");
    if (file.size > 5 * 1024 * 1024) {
      setError("Зураг 5 MB-аас бага байх ёстой.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const item = await adminApi<MediaItem>("media", "POST", form);
      setMedia((old) => [item, ...old]);
      return item;
    } catch (e) {
      setError(message(e));
    } finally {
      setUploading(false);
    }
  }
  return { media, error, uploading, upload };
}
function ImagePicker({
  value,
  onChange,
  label = "Зураг",
}: {
  value: string;
  onChange: (s: string) => void;
  label?: string;
}) {
  const { media, error, uploading, upload } = useMedia();
  const all = [...BUILTIN_IMAGES, ...media];
  return (
    <fieldset className="ad-image-picker">
      <legend>{label}</legend>
      <div className="ad-image-options">
        {all.map((i) => (
          <button
            key={i.id}
            className={value === i.id || value === i.src ? "selected" : ""}
            type="button"
            aria-pressed={value === i.id || value === i.src}
            title={i.name}
            onClick={() => onChange(i.id.startsWith("builtin:") ? i.id : i.src)}
          >
            <img src={i.src} alt={i.name} />
            {(value === i.id || value === i.src) && (
              <span>
                <Check size={15} />
              </span>
            )}
          </button>
        ))}
      </div>
      <label className="ad-upload">
        {uploading ? "Оруулж байна…" : "+ Зураг оруулах"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const result = await upload(file);
              if (result) onChange(result.src);
            }
            e.target.value = "";
          }}
        />
      </label>
      <small>JPG, PNG, WebP · 5 MB хүртэл</small>
      {error && (
        <p className="ad-alert" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
function MediaLibrary() {
  const { media, error, uploading, upload } = useMedia();
  return (
    <>
      <Heading
        eyebrow="VISUAL LIBRARY"
        title="Зургийн сан"
        description="Өөрийн зургийг оруулаад тоглолт, төсөл болон нүүр хуудсандаа ашиглаарай."
      >
        <label className="ad-button ad-primary ad-upload">
          <Plus size={18} />
          {uploading ? "Оруулж байна…" : "Зураг оруулах"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) await upload(f);
              e.target.value = "";
            }}
          />
        </label>
      </Heading>
      {error && (
        <p className="ad-alert" role="alert">
          {error}
        </p>
      )}
      <p className="ad-muted">
        JPG, PNG, WebP · нэг зураг 5 MB хүртэл. Оруулсан зургаа засварлах дэлгэцээс сонгоно.
      </p>
      <div className="ad-media-grid">
        {[...media, ...BUILTIN_IMAGES].map((item) => (
          <article className="ad-card ad-media-card" key={item.id}>
            <img src={item.src} alt={item.name} />
            <div>
              <h2>{item.name}</h2>
              <small>
                {"size" in item
                  ? Math.ceil(Number(item.size) / 1024) + " KB · Оруулсан зураг"
                  : "Суурь зураг · AI illustration"}
              </small>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

const SETTINGS_FIELDS = [
  ["brandName", "Логоны нэр"],
  ["companyName", "Байгууллагын нэр"],
  ["heroEyebrow", "Нүүр хуудасны жижиг гарчиг"],
  ["heroTitle", "Үндсэн гарчиг"],
  ["heroAccent", "Онцлох гарчиг"],
  ["email", "Холбоо барих имэйл"],
  ["phone", "Утас"],
  ["statsShows", "Тоглолтын тоо"],
  ["statsArtists", "Уран бүтээлчдийн тоо"],
  ["since", "Үүсгэн байгуулагдсан он"],
] as const;
const MONGOLIAN_SETTINGS = [
  ["heroEyebrowMn", "Жижиг гарчиг (Монгол)", 140],
  ["heroTitleMn", "Үндсэн гарчиг (Монгол)", 70],
  ["heroAccentMn", "Онцлох гарчиг (Монгол)", 70],
  ["heroDescriptionMn", "Нүүр хуудасны тайлбар (Монгол)", 500],
  ["addressMn", "Хаяг (Монгол)", 300],
] as const;
function SettingsEditor({
  content,
  save,
  busy,
}: {
  content: SiteContent;
  save: (c: SiteContent) => Promise<void>;
  busy: boolean;
}) {
  const [hero, setHero] = useState(content.settings.heroImage);
  const [about, setAbout] = useState(content.settings.aboutImage);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const settings = { ...content.settings, heroImage: hero, aboutImage: about };
    for (const key of [...SETTINGS_FIELDS.map((x) => x[0]), "heroDescription", "address"] as const)
      settings[key] = String(data.get(key));
    for (const [key] of MONGOLIAN_SETTINGS) settings[key] = String(data.get(key) || "");
    try {
      await save({ ...content, settings });
    } catch {
      /* parent displays error */
    }
  }
  return (
    <>
      <Heading
        eyebrow="SITE SETTINGS"
        title="Таны сайтын мэдээлэл"
        description="Нүүр хуудас болон холбоо барих мэдээллээ эндээс шинэчлээрэй."
      />
      <form className="ad-card ad-settings-form" onSubmit={submit}>
        <h2>Ерөнхий мэдээлэл</h2>
        <div className="ad-form-grid">
          {SETTINGS_FIELDS.map(([key, label]) => (
            <Field
              key={key}
              label={label}
              name={key}
              value={content.settings[key]}
              type={key === "email" ? "email" : "text"}
              max={key === "since" ? 4 : key.startsWith("stats") ? 20 : 150}
            />
          ))}
          <label className="ad-field ad-wide">
            Нүүр хуудасны тайлбар
            <textarea
              name="heroDescription"
              defaultValue={content.settings.heroDescription}
              rows={3}
              maxLength={500}
              required
            />
          </label>
          <label className="ad-field ad-wide">
            Хаяг
            <textarea
              name="address"
              defaultValue={content.settings.address}
              rows={2}
              maxLength={300}
              required
            />
          </label>
        </div>
        <details className="ad-translations" open>
          <summary>Монгол хэлний хувилбар</summary>
          <p className="ad-muted">
            Дээрх гарчиг, тайлбар, хаяг нь English хувилбар. Монгол хувилбарыг доор бичнэ үү.
          </p>
          <div className="ad-form-grid">
            {MONGOLIAN_SETTINGS.map(([key, label, max]) => (
              <label key={key} className="ad-field ad-wide">
                {label}
                <textarea
                  name={key}
                  defaultValue={content.settings[key] || ""}
                  rows={key === "heroDescriptionMn" ? 3 : 2}
                  maxLength={max}
                />
              </label>
            ))}
          </div>
        </details>
        <ImagePicker label="Нүүр хуудасны зураг" value={hero} onChange={setHero} />
        <ImagePicker label="Танилцуулгын зураг" value={about} onChange={setAbout} />
        <div className="ad-form-actions">
          <button className="ad-button ad-primary" disabled={busy}>
            {busy ? "Хадгалж байна…" : "Өөрчлөлт хадгалах"}
            <Check size={17} />
          </button>
        </div>
      </form>
      <PasswordForm />
    </>
  );
}
function PasswordForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setError("");
    setSuccess(false);
    if (data.get("newPassword") !== data.get("confirm")) {
      setError("Нууц үгүүд таарахгүй байна.");
      return;
    }
    setBusy(true);
    try {
      await adminApi("account", "POST", {
        currentPassword: data.get("currentPassword"),
        newPassword: data.get("newPassword"),
      });
      form.reset();
      setSuccess(true);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="ad-card ad-settings-form" onSubmit={submit}>
      <h2>Нууц үг өөрчлөх</h2>
      <p className="ad-muted">Бусад нэвтэрсэн сессүүд гарна.</p>
      <div className="ad-form-grid">
        <label className="ad-field">
          Одоогийн нууц үг
          <input
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            required
            maxLength={200}
          />
        </label>
        <label className="ad-field">
          Шинэ нууц үг
          <input
            type="password"
            name="newPassword"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={200}
          />
        </label>
        <label className="ad-field">
          Шинэ нууц үг давтах
          <input
            type="password"
            name="confirm"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={200}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="ad-alert">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="ad-success">
          Нууц үг шинэчлэгдлээ.
        </p>
      )}
      <div className="ad-form-actions">
        <button className="ad-button" disabled={busy}>
          {busy ? "Шинэчилж байна…" : "Нууц үг шинэчлэх"}
        </button>
      </div>
    </form>
  );
}
