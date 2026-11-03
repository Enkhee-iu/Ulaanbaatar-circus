import { confirmLeave, useDirtyEditor } from "./work-guard";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, RefreshCw, Search } from "lucide-react";
import { Spinner } from "@/components/site/Loading";
import { ENQUIRY_STATUSES, type Enquiry } from "@/lib/enquiry-types";
import { translate } from "@/lib/translations";

type Api = <T>(action: string, method?: string, body?: unknown) => Promise<T>;
const dateLabel = (value: string) =>
  new Date(value).toLocaleString("mn-MN", { timeZone: "Asia/Ulaanbaatar" });
export function EnquiriesPanel({ api }: { api: Api }) {
  const query = useQuery({
    queryKey: ["admin-enquiries"],
    queryFn: () => api<Enquiry[]>("enquiries"),
    refetchInterval: 15000,
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const enquiries = query.data || [];
  const visible = enquiries.filter(
    (item) =>
      (filter === "all" || item.status === filter) &&
      [item.name, item.email, item.company, item.show, item.id.slice(0, 8)]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const current = enquiries.find((item) => item.id === selected);
  return (
    <section>
      <div className="ad-heading">
        <div>
          <span className="ad-kicker">ЗАХИАЛГЫН ХҮСЭЛТ</span>
          <h1>Хүсэлтүүд</h1>
          <p>
            Сайтаас ирсэн хүсэлтүүд · {enquiries.filter((item) => item.status === "new").length}{" "}
            шинэ
          </p>
        </div>
        <button
          className="ad-button"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          {query.isFetching ? <Spinner /> : <RefreshCw size={16} />}Шинэчлэх
        </button>
      </div>
      <div className="ad-enquiry-toolbar">
        <label className="ad-enquiry-search">
          <Search size={17} />
          <input
            aria-label="Хүсэлт хайх"
            placeholder="Нэр, имэйл, байгууллагаар хайх…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label="Хүсэлтийн төлөвөөр шүүх"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Бүх төлөв</option>
          {Object.entries(ENQUIRY_STATUSES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {query.isPending && (
        <p role="status">
          <Spinner /> Хүсэлтүүдийг ачаалж байна…
        </p>
      )}
      {query.isError && (
        <div className="ad-alert" role="alert">
          {query.error.message}
          <button onClick={() => void query.refetch()}>Дахин оролдох</button>
        </div>
      )}
      <div className="ad-enquiry-layout">
        <div className="ad-enquiry-list">
          {!query.isPending && !query.isError && visible.length === 0 && (
            <div className="ad-enquiry-empty">
              {enquiries.length
                ? "Хайлтад тохирох хүсэлт алга."
                : "Одоогоор хүсэлт ирээгүй байна. Сайтын холбоо барих хэсгээр илгээсэн хүсэлт энд харагдана."}
            </div>
          )}
          {visible.map((item) => (
            <button
              key={item.id}
              className={"ad-enquiry-row" + (item.id === selected ? " selected" : "")}
              onClick={() => {
                if (item.id === selected || confirmLeave()) setSelected(item.id);
              }}
            >
              <div>
                <strong>{item.name}</strong>
                <span className={"ad-enquiry-status status-" + item.status}>
                  {ENQUIRY_STATUSES[item.status]}
                </span>
              </div>
              <span>{item.company || item.email}</span>
              <span>
                {translate(item.eventType, "mn")} · {item.date || "Огноо уян хатан"}
              </span>
              <small>
                {dateLabel(item.createdAt)} · #{item.id.slice(0, 8).toUpperCase()}
              </small>
            </button>
          ))}
        </div>
        {current ? (
          <EnquiryDetail key={current.id} item={current} api={api} />
        ) : (
          <div className="ad-enquiry-empty ad-enquiry-detail">
            Хүсэлт сонгож дэлгэрэнгүйг үзнэ үү.
          </div>
        )}
      </div>
    </section>
  );
}
function EnquiryDetail({ item, api }: { item: Enquiry; api: Api }) {
  const dirty = useDirtyEditor();
  const [status, setStatus] = useState(item.status);
  const [baseline, setBaseline] = useState(item);
  const [notes, setNotes] = useState(item.notes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const client = useQueryClient();
  useEffect(() => {
    if (
      item.revision > baseline.revision &&
      status === baseline.status &&
      notes === baseline.notes
    ) {
      setBaseline(item);
      setStatus(item.status);
      setNotes(item.notes);
    }
  }, [item, baseline, status, notes]);
  useEffect(() => {
    dirty.set(status !== baseline.status || notes !== baseline.notes);
  });
  async function save() {
    if (busy) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const result = await api<Enquiry>("enquiries", "PUT", {
        id: item.id,
        revision: baseline.revision,
        status,
        notes,
      });
      setBaseline(result);
      setStatus(result.status);
      setNotes(result.notes);
      client.setQueryData<Enquiry[]>(["admin-enquiries"], (current) =>
        current?.map((entry) => (entry.id === result.id ? result : entry)),
      );
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Хадгалахад алдаа гарлаа.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="ad-enquiry-detail">
      <span className="ad-kicker">
        #{item.id.slice(0, 8).toUpperCase()} · {dateLabel(item.createdAt)}
      </span>
      <h2>{item.name}</h2>
      <a
        className="ad-button"
        href={
          "mailto:" +
          item.email +
          "?subject=" +
          encodeURIComponent("Ulaanbaatar Circus · Хүсэлт #" + item.id.slice(0, 8).toUpperCase())
        }
      >
        <Mail size={16} />
        Имэйлээр хариулах
      </a>
      <dl className="ad-enquiry-facts">
        {[
          ["Имэйл", item.email],
          ["Байгууллага", item.company],
          ["Сонирхсон тоглолт", item.show],
          ["Эвент", translate(item.eventType, "mn")],
          ["Огноо", item.date || "Уян хатан"],
          ["Хот", item.city],
          ["Үзэгчид", item.audience],
          ["Төсөв", translate(item.budget, "mn")],
        ]
          .filter(([, value]) => Boolean(value))
          .map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
      <h3>Хүсэлтийн агуулга</h3>
      <p className="ad-enquiry-brief">{item.brief}</p>
      <label className="ad-field">
        Төлөв
        <select
          value={status}
          disabled={busy}
          onChange={(e) => {
            setStatus(e.target.value as Enquiry["status"]);
            setSaved(false);
          }}
        >
          {Object.entries(ENQUIRY_STATUSES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="ad-field">
        Дотоод тэмдэглэл
        <textarea
          rows={5}
          maxLength={4000}
          disabled={busy}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
          placeholder="Ярилцсан зүйл, дараагийн алхам…"
        />
        <small>Зөвхөн admin хэсэгт харагдана.</small>
      </label>
      {error && (
        <div className="ad-alert" role="alert">
          {error}
          <button
            onClick={async () => {
              if (busy || !confirmLeave()) return;
              setBusy(true);
              try {
                const result = await client.fetchQuery({
                  queryKey: ["admin-enquiries"],
                  queryFn: () => api<Enquiry[]>("enquiries"),
                });
                const latest = result.find((entry) => entry.id === item.id);
                if (latest) {
                  setBaseline(latest);
                  setStatus(latest.status);
                  setNotes(latest.notes);
                  setError("");
                }
              } catch (e) {
                setError(e instanceof Error ? e.message : "Шинэчилж чадсангүй.");
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
          >
            Шинэ мэдээлэл авах
          </button>
        </div>
      )}
      {saved && <p role="status">Хадгалагдлаа.</p>}
      <button
        className="ad-button ad-primary"
        disabled={busy || (status === baseline.status && notes === baseline.notes)}
        onClick={() => void save()}
      >
        {busy && <Spinner />}Хадгалах
      </button>
    </div>
  );
}
