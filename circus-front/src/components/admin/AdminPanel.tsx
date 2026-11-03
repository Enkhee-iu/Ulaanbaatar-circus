import { useBlocker } from "@tanstack/react-router";
import {
  confirmLeave,
  hasUnsaved,
  hasUploads,
  useDirtyEditor,
  useUploadPending,
  uploadStarted,
  uploadFinished,
} from "./work-guard";
import { Spinner } from "@/components/site/Loading";
import { SmartImage } from "@/components/site/Loading";
import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Images,
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
  type CollectionName,
  type ContentItem,
  type MediaItem,
  type SiteContent,
} from "@/lib/content-types";
import { BUILTIN_IMAGES, imageSrc } from "@/lib/site-images";
import { EnquiriesPanel } from "./EnquiriesPanel";
import { apiUrl } from "@/lib/content";

type Auth = { configured: boolean; authenticated: boolean; email?: string };
type Section = "overview" | CollectionName | "gallery" | "media" | "settings" | "hero-video" | "enquiries";
const SECTIONS = [
  { id: "overview", label: "Хяналтын самбар", icon: LayoutDashboard },
  { id: "enquiries", label: "Захиалгын хүсэлт", icon: CalendarDays },
  { id: "shows", label: "Тоглолтууд", icon: Sparkles },
  { id: "events", label: "Эвентүүд", icon: CalendarDays },
  { id: "projects", label: "Төслүүд", icon: Film },
  { id: "gallery", label: "Галерей", icon: Images },
  { id: "media", label: "Зургийн сан", icon: ImagePlus },
  { id: "hero-video", label: "Hero видео", icon: Film },
  { id: "settings", label: "Тохиргоо", icon: Settings },
] as const;
async function adminApi<T>(action: string, method = "GET", body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(apiUrl("/api/admin/" + action), {
      signal: controller.signal,
      method,
      credentials: "include",
      headers:
        body instanceof FormData
          ? undefined
          : body === undefined
            ? undefined
            : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
    const data = await response.json().catch(() => {
      throw new Error("Серверээс хариу авч чадсангүй. Дахин оролдоно уу.");
    });
    if (!response.ok) throw new Error(data.error || "Хүсэлтийг гүйцэтгэж чадсангүй.");
    return data as T;
  } catch (error) {
    if (controller.signal.aborted)
      throw new Error("Хүсэлт удаж байна. Холболтоо шалгаад дахин оролдоно уу.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
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
  useBlocker({
    shouldBlockFn: () => !confirmLeave(),
    enableBeforeUnload: () => hasUnsaved() || hasUploads(),
  });
  const [health, setHealth] = useState<{ damaged: boolean; backupAvailable: boolean } | null>(null);

  async function load() {
    setError("");
    try {
      const status = await adminApi<Auth>("status");
      setAuth(status);
      if (status.authenticated) {
        const result = await adminApi<{ damaged: boolean; backupAvailable: boolean }>(
          "content-health",
        );
        setHealth(result);
        if (!result.damaged) setContent(await adminApi<SiteContent>("content"));
        else {
          setContent(null);
          setError(
            "Контентийн файл гэмтсэн байна. Эх файлыг хадгалж үлдээн нөөц хуулбарыг сэргээх боломжтой.",
          );
        }
      }
    } catch (e) {
      setError(message(e));
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function save(next: SiteContent) {
    if (busy || hasUploads()) return;
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const saved = await adminApi<SiteContent>("content", "PUT", next);
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
    if (!confirmLeave()) return;
    if (busy) return;
    setBusy(true);
    try {
      await adminApi("logout", "POST");
      setContent(null);
      queryClient.removeQueries({ queryKey: ["admin-enquiries"] });
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
        {!error && (
          <div className="ad-loading-skeleton" role="status" aria-label="Удирдлагыг ачаалж байна">
            <div className="skeleton skeleton-header" />
            <div className="skeleton skeleton-hero" />
            <div className="skeleton-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton skeleton-card" />
              ))}
            </div>
          </div>
        )}
        <p>{error || "Удирдлагыг нээж байна…"}</p>
        {error && <button onClick={() => void load()}>Дахин оролдох</button>}
        {health?.damaged &&
          (health.backupAvailable ? (
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await adminApi("content-recover", "POST");
                  await load();
                } catch (e) {
                  setError(message(e));
                } finally {
                  setBusy(false);
                }
              }}
            >
              Нөөц хуулбарыг сэргээх
            </button>
          ) : (
            <p>
              Нөөц хуулбар олдсонгүй. .ubcircus/data/content.json файлыг гараар сэргээх
              шаардлагатай.
            </p>
          ))}
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
                if (id !== section && !confirmLeave()) return;
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
            Ulaanbaatar Circus{" "}
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
              {busy ? <Spinner /> : <LogOut size={18} />}
            </button>
          </div>
        </header>
        <main className="ad-main" aria-busy={busy}>
          {busy && (
            <div className="ad-save-progress" role="status">
              <Spinner />
              Ажиллаж байна…
            </div>
          )}
          {error && (
            <div className="ad-alert" role="alert">
              {error}
              <button
                onClick={() => {
                  if (confirmLeave()) void load();
                }}
              >
                Мэдээллийг шинэчлэх
              </button>
            </div>
          )}
          {notice && (
            <div className="ad-success" role="status">
              <Check size={17} />
              {notice}
            </div>
          )}
          {section === "overview" && <Overview content={content} open={setSection} />}
          {section === "enquiries" && <EnquiriesPanel api={adminApi} />}
          {(section === "shows" || section === "events" || section === "projects") && (
            <Collection key={section} name={section} content={content} save={save} busy={busy} />
          )}
          {section === "gallery" && (
            <GalleryEditor content={content} save={save} busy={busy} open={setSection} />
          )}
          {section === "media" && <MediaLibrary />}
          {section === "hero-video" && (
            <HeroVideoEditor key={content.revision} content={content} save={save} busy={busy} />
          )}
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
    if (busy) return;
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
        ...(configured ? {} : { setupCode: data.get("setupCode") }),
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
          Ulaanbaatar Circus
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
          Local workspace · Ulaanbaatar Circus
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
                minLength={8}
                maxLength={200}
              />
              {!configured && <small>Хамгийн багадаа 8 тэмдэгт.</small>}
            </label>
            {!configured && (
              <label className="ad-field">
                Анхны admin setup код
                <input
                  name="setupCode"
                  type="password"
                  autoComplete="one-time-code"
                  required
                  minLength={24}
                  maxLength={300}
                />
                <small>Зөвхөн backend-ийн .env файл дахь ADMIN_SETUP_CODE-ийг ашиглана.</small>
              </label>
            )}
            {!configured && (
              <label className="ad-field">
                Нууц үг давтах
                <input
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
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
              {busy && <Spinner />}
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
        {collections.map((key) => {
          const items = content[key];
          const section = SECTIONS.find((item) => item.id === key)!;
          const Icon = section.icon;
          return (
            <button key={key} onClick={() => open(key)} className="ad-stat">
              <span>
                {section.label}
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
    categories: ["Aerial", "Theatre", "Touring"],
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
                  <SmartImage src={imageSrc(item.image)} alt={item.title} />
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
          if (!open && !busy && confirmLeave()) setEditing(null);
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
                {busy && <Spinner />}
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
  const dirty = useDirtyEditor();
  const uploading = useUploadPending();
  const [image, setImage] = useState("image" in item ? item.image : "");
  const [gallery, setGallery] = useState("duration" in item ? item.gallery || [] : []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (hasUploads()) return;
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
              details: String(f.get("details") || ""),
              detailsMn: String(f.get("detailsMn") || ""),
              videoUrl: String(f.get("videoUrl") || "").trim(),
              gallery,
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
    <form onSubmit={submit} onChange={dirty.mark} className="ad-edit-form">
      <fieldset className="ad-editor-fields" disabled={busy || uploading}>
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
                label="Видео холбоос (HTTPS · MP4/WebM файл)"
                name="videoUrl"
                value={item.videoUrl || ""}
                max={2000}
                required={false}
                wide
              />
              <label className="ad-field ad-wide">
                Дэлгэрэнгүй танилцуулга (English)
                <textarea
                  name="details"
                  defaultValue={item.details || ""}
                  rows={6}
                  maxLength={6000}
                />
                <small>
                  Хоосон бол үндсэн тайлбарыг ашиглана. Хоосон мөрөөр догол мөрүүдийг тусгаарлана.
                </small>
              </label>
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
              <label className="ad-field ad-wide">
                Дэлгэрэнгүй танилцуулга (Монгол)
                <textarea
                  name="detailsMn"
                  defaultValue={item.detailsMn || ""}
                  rows={6}
                  maxLength={6000}
                />
              </label>
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
        {"image" in item && (
          <ImagePicker
            value={image}
            onChange={(src) => {
              dirty.mark();
              setImage(src);
            }}
          />
        )}
        {"duration" in item && (
          <GalleryPicker
            value={gallery}
            onChange={(value) => {
              dirty.mark();
              setGallery(value);
            }}
            disabled={busy || uploading}
          />
        )}
        {error && (
          <p className="ad-alert" role="alert">
            {error}
          </p>
        )}
        <div className="ad-form-actions">
          <Dialog.Close className="ad-button" disabled={busy || uploading}>
            Болих
          </Dialog.Close>
          <button className="ad-button ad-primary" disabled={busy || uploading}>
            {busy && <Spinner />}
            {busy ? "Хадгалж байна…" : "Хадгалах"}
            <Check size={17} />
          </button>
        </div>
      </fieldset>
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
  const queryClient = useQueryClient();
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const query = useQuery({
    queryKey: ["admin-media"],
    queryFn: () => adminApi<MediaItem[]>("media"),
    staleTime: 10_000,
  });
  async function upload(file: File) {
    if (uploading) return;
    setUploadError("");
    if (!file.size || file.size > 5 * 1024 * 1024) {
      setUploadError("Зураг 5 MB-аас бага байх ёстой.");
      return;
    }
    setUploading(true);
    uploadStarted();
    try {
      const form = new FormData();
      form.set("file", file);
      const item = await adminApi<MediaItem>("media", "POST", form);
      queryClient.setQueryData<MediaItem[]>(["admin-media"], (old) => [item, ...(old || [])]);
      return item;
    } catch (e) {
      setUploadError(message(e));
    } finally {
      setUploading(false);
      uploadFinished();
    }
  }
  async function uploadMany(files: File[]) {
    const items: MediaItem[] = [];
    const failed: string[] = [];
    for (const file of files) {
      const item = await upload(file);
      if (item) items.push(item);
      else failed.push(file.name);
    }
    if (failed.length)
      setUploadError(
        `Дараах зураг орсонгүй: ${failed.join(", ")}. 5 MB-аас бага эсэхийг шалгаад дахин оруулна уу.`,
      );
    return items;
  }
  async function deleteMedia(id: string) {
    if (deletingId || !window.confirm("Delete this uploaded image permanently?")) return;
    setUploadError("");
    setDeletingId(id);
    try {
      await adminApi<{ ok: true }>(`media/${id}`, "DELETE");
      queryClient.setQueryData<MediaItem[]>(["admin-media"], (old) =>
        (old || []).filter((item) => item.id !== id),
      );
    } catch (e) {
      setUploadError(message(e));
    } finally {
      setDeletingId("");
    }
  }
  return {
    media: query.data || [],
    error: uploadError || (query.error ? message(query.error) : ""),
    uploading,
    deletingId,
    loading: query.isPending,
    retry: () => {
      setUploadError("");
      return query.refetch();
    },
    upload,
    uploadMany,
    deleteMedia,
  };
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
  const { media, error, uploading, loading, retry, upload } = useMedia();
  const all = [...BUILTIN_IMAGES, ...media];
  return (
    <fieldset className="ad-image-picker" disabled={uploading}>
      <legend>{label}</legend>
      <div className="ad-image-options" aria-busy={loading}>
        {loading && [1, 2, 3].map((i) => <div key={i} className="skeleton ad-media-placeholder" />)}
        {all.map((i) => (
          <button
            key={i.id}
            className={value === i.id || value === i.src ? "selected" : ""}
            type="button"
            aria-pressed={value === i.id || value === i.src}
            title={i.name}
            onClick={() => onChange(i.id.startsWith("builtin:") ? i.id : i.src)}
          >
            <SmartImage src={imageSrc(i.src)} alt={i.name} />
            {(value === i.id || value === i.src) && (
              <span>
                <Check size={15} />
              </span>
            )}
          </button>
        ))}
      </div>
      <label className="ad-upload">
        {uploading && <Spinner />}
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
          {error}{" "}
          <button type="button" className="ad-media-retry" onClick={() => void retry()}>
            Дахин оролдох
          </button>
        </p>
      )}
    </fieldset>
  );
}
// Matches the gallery limit in the API's content schema.
const GALLERY_LIMIT = 30;
function GalleryPicker({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  disabled: boolean;
}) {
  const { media, error, uploading, loading, retry, uploadMany } = useMedia();
  const [skipped, setSkipped] = useState(0);
  const all = [...BUILTIN_IMAGES, ...media];
  function add(src: string) {
    onChange((current) =>
      !current.includes(src) && current.length < GALLERY_LIMIT ? [...current, src] : current,
    );
  }
  function move(index: number, offset: number) {
    const next = [...value];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  }
  return (
    <fieldset className="ad-image-picker" disabled={disabled || uploading}>
      <legend>Тоглолтын галерей · {value.length}/{GALLERY_LIMIT}</legend>
      <small>
        Үндсэн зураг тоглолтын хуудас болон нүүр хуудасны галерейд автоматаар орно. Эдгээр зураг ч
        хоёуланд нь гарна.
      </small>
      <div className="ad-gallery-selected">
        {value.map((src, index) => (
          <div key={src}>
            <SmartImage src={imageSrc(src)} alt={`Галерейн зураг ${index + 1}`} />
            <div>
              <button
                type="button"
                className="ad-icon"
                aria-label={`Зураг ${index + 1} дээш`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                className="ad-icon"
                aria-label={`Зураг ${index + 1} доош`}
                disabled={index === value.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown size={15} />
              </button>
              <button
                type="button"
                className="ad-icon"
                aria-label={`Зураг ${index + 1} галерейгээс хасах`}
                onClick={() => onChange(value.filter((item) => item !== src))}
              >
                <X size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <label className="ad-upload">
        {uploading && <Spinner />}
        {uploading
          ? "Оруулж байна…"
          : value.length >= GALLERY_LIMIT
            ? `Галерей дүүрсэн · ${GALLERY_LIMIT}/${GALLERY_LIMIT}`
            : "+ Галерейн зураг оруулах"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading || value.length >= GALLERY_LIMIT}
          onChange={async (event) => {
            const files = [...(event.target.files ?? [])];
            event.target.value = "";
            const room = GALLERY_LIMIT - value.length;
            setSkipped(Math.max(files.length - room, 0));
            for (const item of await uploadMany(files.slice(0, room))) add(item.src);
          }}
        />
      </label>
      {skipped > 0 && (
        <p className="ad-muted" role="status">
          {GALLERY_LIMIT} зургийн хязгаарт багтаагүй тул {skipped} зураг оруулаагүй.
        </p>
      )}
      <small>Зургийн сангаас сонгох</small>
      <div className="ad-image-options" aria-busy={loading}>
        {all.map((item) => {
          const src = item.id.startsWith("builtin:") ? item.id : item.src;
          const selected = value.includes(src);
          return (
            <button
              key={item.id}
              type="button"
              title={item.name}
              aria-label={item.name}
              aria-pressed={selected}
              className={selected ? "selected" : ""}
              disabled={!selected && value.length >= GALLERY_LIMIT}
              onClick={() =>
                selected ? onChange(value.filter((entry) => entry !== src)) : add(src)
              }
            >
              <SmartImage src={imageSrc(item.src)} alt={item.name} />
              {selected && (
                <span>
                  <Check size={15} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="ad-alert" role="alert">
          {error}
          <button type="button" onClick={() => void retry()}>
            Дахин оролдох
          </button>
        </p>
      )}
    </fieldset>
  );
}
function GalleryEditor({
  content,
  save,
  busy,
  open,
}: {
  content: SiteContent;
  save: (c: SiteContent) => Promise<void>;
  busy: boolean;
  open: (s: Section) => void;
}) {
  const [showId, setShowId] = useState(content.shows[0]?.id);
  const show = content.shows.find((item) => item.id === showId) ?? content.shows[0];
  return (
    <>
      <Heading
        eyebrow="SHOW GALLERY"
        title="Галерей"
        description="Тоглолтоо сонгоод зургаа нэмнэ үү. Нийтлэгдсэн тоглолтын зургууд нүүр хуудас болон тоглолтын хуудсанд гарна."
      />
      {!show ? (
        <div className="ad-card ad-empty">
          <Images size={28} />
          <h2>Тоглолт алга</h2>
          <p>Галерейд зураг нэмэхийн тулд эхлээд тоглолт үүсгэнэ үү.</p>
          <button className="ad-button ad-primary" onClick={() => open("shows")}>
            Тоглолт нэмэх
          </button>
        </div>
      ) : (
        <>
          <div className="ad-gallery-tabs" role="group" aria-label="Тоглолт сонгох">
            {content.shows.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === show.id}
                disabled={busy}
                onClick={() => {
                  if (item.id !== show.id && confirmLeave()) setShowId(item.id);
                }}
              >
                <SmartImage src={imageSrc(item.image)} alt="" />
                <span>
                  {item.title}
                  <small>
                    {item.gallery?.length ?? 0}/{GALLERY_LIMIT}{item.status === "draft" && " · Ноорог"}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <ShowGalleryForm
            key={show.id + content.revision}
            show={show}
            content={content}
            save={save}
            busy={busy}
          />
        </>
      )}
    </>
  );
}
function ShowGalleryForm({
  show,
  content,
  save,
  busy,
}: {
  show: SiteContent["shows"][number];
  content: SiteContent;
  save: (c: SiteContent) => Promise<void>;
  busy: boolean;
}) {
  const dirty = useDirtyEditor();
  const uploading = useUploadPending();
  const saved = show.gallery ?? [];
  const [gallery, setGallery] = useState(saved);
  const changed = JSON.stringify(gallery) !== JSON.stringify(saved);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (hasUploads()) return;
    try {
      await save({
        ...content,
        shows: content.shows.map((item) => (item.id === show.id ? { ...item, gallery } : item)),
      });
      dirty.clean();
    } catch {
      /* parent displays error */
    }
  }
  return (
    <form className="ad-card ad-settings-form ad-gallery-form" onSubmit={submit}>
      <GalleryPicker
        value={gallery}
        onChange={(value) => {
          dirty.mark();
          setGallery(value);
        }}
        disabled={busy || uploading}
      />
      <div className="ad-form-actions">
        <button className="ad-button ad-primary" disabled={busy || uploading || !changed}>
          {busy && <Spinner />}
          {busy ? "Хадгалж байна…" : "Өөрчлөлт хадгалах"}
          <Check size={17} />
        </button>
      </div>
    </form>
  );
}
function MediaLibrary() {
  const { media, error, uploading, deletingId, loading, retry, upload, deleteMedia } = useMedia();
  return (
    <>
      <Heading
        eyebrow="VISUAL LIBRARY"
        title="Зургийн сан"
        description="Өөрийн зургийг оруулаад тоглолт, төсөл болон нүүр хуудсандаа ашиглаарай."
      >
        <label className="ad-button ad-primary ad-upload">
          <Plus size={18} />
          {uploading && <Spinner />}
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
          {error}{" "}
          <button type="button" className="ad-media-retry" onClick={() => void retry()}>
            Дахин оролдох
          </button>
        </p>
      )}
      <p className="ad-muted">
        JPG, PNG, WebP · нэг зураг 5 MB хүртэл. Оруулсан зургаа засварлах дэлгэцээс сонгоно.
      </p>
      <div className="ad-media-grid" aria-busy={loading}>
        {loading && [1, 2, 3].map((i) => <div key={i} className="skeleton ad-media-placeholder" />)}
        {[...media, ...BUILTIN_IMAGES].map((item) => (
          <article className="ad-card ad-media-card" key={item.id}>
            <SmartImage src={imageSrc(item.src)} alt={item.name} />
            <div>
              <h2>{item.name}</h2>
              <small>
                {"size" in item
                  ? Math.ceil(Number(item.size) / 1024) + " KB · Оруулсан зураг"
                  : "Суурь зураг · AI illustration"}
              </small>
              {"size" in item && (
                <button
                  type="button"
                  className="ad-button ad-delete"
                  disabled={Boolean(deletingId)}
                  aria-label={`Delete ${item.name}`}
                  onClick={() => void deleteMedia(item.id)}
                >
                  {deletingId === item.id ? <Spinner size={14} /> : <Trash2 size={14} />}
                  {deletingId === item.id ? "Deleting…" : "Delete"}
                </button>
              )}
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
  const dirty = useDirtyEditor();
  const uploading = useUploadPending();
  const [hero, setHero] = useState(content.settings.heroImage);
  const [about, setAbout] = useState(content.settings.aboutImage);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (hasUploads()) return;
    const data = new FormData(e.currentTarget);
    const settings = {
      ...content.settings,
      heroImage: hero,
      aboutImage: about,
    };
    for (const key of [...SETTINGS_FIELDS.map((x) => x[0]), "heroDescription", "address"] as const)
      settings[key] = String(data.get(key));
    for (const [key] of MONGOLIAN_SETTINGS) settings[key] = String(data.get(key) || "");
    try {
      await save({ ...content, settings });
      dirty.clean();
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
      <form className="ad-card ad-settings-form" onSubmit={submit} onChange={dirty.mark}>
        <fieldset className="ad-editor-fields" disabled={busy || uploading}>
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
          <ImagePicker
            label="Нүүр хуудасны зураг"
            value={hero}
            onChange={(src) => {
              dirty.mark();
              setHero(src);
            }}
          />
          <ImagePicker
            label="Танилцуулгын зураг"
            value={about}
            onChange={(src) => {
              dirty.mark();
              setAbout(src);
            }}
          />
          <div className="ad-form-actions">
            <button className="ad-button ad-primary" disabled={busy || uploading}>
              {busy && <Spinner />}
              {busy ? "Хадгалж байна…" : "Өөрчлөлт хадгалах"}
              <Check size={17} />
            </button>
          </div>
        </fieldset>
      </form>
      <PasswordForm />
    </>
  );
}

function HeroVideoEditor({
  content,
  save,
  busy,
}: {
  content: SiteContent;
  save: (c: SiteContent) => Promise<void>;
  busy: boolean;
}) {
  const dirty = useDirtyEditor();
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError("");
    try {
      await save({
        ...content,
        settings: { ...content.settings, heroVideoUrl: String(data.get("heroVideoUrl") || "").trim() },
      });
      dirty.clean();
    } catch (err) {
      setError(message(err));
    }
  }
  return (
    <>
      <Heading
        eyebrow="HERO SECTION"
        title="Нүүр хуудасны видео"
        description="Нүүр хуудасны эхний хэсэгт харагдах видеоны холбоосыг эндээс солино."
      />
      <form className="ad-card ad-settings-form" onSubmit={submit} onChange={dirty.mark}>
        <fieldset className="ad-editor-fields" disabled={busy}>
          <h2>Hero видео</h2>
          <p className="ad-muted">
            YouTube линк эсвэл HTTPS MP4/WebM линк оруулна. Хоосон үлдээвэл видео унтарна.
          </p>
          <label className="ad-field ad-wide">
            Видео URL
            <input
              name="heroVideoUrl"
              type="url"
              maxLength={2000}
              defaultValue={content.settings.heroVideoUrl || ""}
              placeholder="https://youtu.be/... эсвэл https://.../video.mp4"
            />
          </label>
          {error && <p className="ad-alert" role="alert">{error}</p>}
          <div className="ad-form-actions">
            <button className="ad-button ad-primary" disabled={busy}>
              {busy && <Spinner />}
              {busy ? "Хадгалж байна…" : "Видео холбоос хадгалах"}
              <Check size={17} />
            </button>
          </div>
        </fieldset>
      </form>
    </>
  );
}

function PasswordForm() {
  const dirty = useDirtyEditor();
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
      dirty.clean();
      setSuccess(true);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="ad-card ad-settings-form" onSubmit={submit} onChange={dirty.mark}>
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
            minLength={8}
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
            minLength={8}
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
          {busy && <Spinner />}
          {busy ? "Шинэчилж байна…" : "Нууц үг шинэчлэх"}
        </button>
      </div>
    </form>
  );
}
