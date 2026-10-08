import { useMemo, type Dispatch, type SetStateAction } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { brl, hora, type SessionWithPatient } from "@/lib/psicohub";

export type ViewMode = "mes" | "semana" | "dia";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOUR_START = 7;
const HOUR_END = 20;
const ROW_HEIGHT = 48;
const TOTAL_HEIGHT = (HOUR_END - HOUR_START) * ROW_HEIGHT;

function addDays(date: Date, amount: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return addDays(startOfDay(date), diffToMonday);
}

function monthGrid(cursor: Date) {
  const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

function sessionTone(status: SessionWithPatient["status"]) {
  switch (status) {
    case "cancelada":
      return "border-border/60 bg-muted/60 text-muted-foreground line-through";
    case "realizada":
      return "border-success/40 bg-success/10 text-foreground";
    case "confirmada":
      return "border-primary/40 bg-primary/10 text-foreground";
    default:
      return "border-border bg-accent text-foreground";
  }
}

function statusDot(status: SessionWithPatient["status"]) {
  switch (status) {
    case "cancelada":
      return "bg-muted-foreground";
    case "realizada":
      return "bg-success";
    case "confirmada":
      return "bg-primary";
    default:
      return "bg-accent-foreground";
  }
}

type LayoutItem = {
  session: SessionWithPatient;
  start: number;
  end: number;
  col: number;
  cols: number;
};

function layoutDay(sessions: SessionWithPatient[]): LayoutItem[] {
  const items = sessions
    .map((s) => {
      const start = new Date(s.starts_at).getTime();
      return { session: s, start, end: start + s.duracao_min * 60000 };
    })
    .sort((a, b) => a.start - b.start);

  const result: LayoutItem[] = [];
  let cluster: typeof items = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    if (cluster.length === 0) return;
    const colEnds: number[] = [];
    for (const item of cluster) {
      let col = colEnds.findIndex((end) => end <= item.start);
      if (col === -1) {
        col = colEnds.length;
        colEnds.push(item.end);
      } else {
        colEnds[col] = item.end;
      }
      result.push({ ...item, col, cols: 0 });
    }
    const cols = colEnds.length;
    for (let i = result.length - cluster.length; i < result.length; i++) {
      const entry = result[i];
      if (entry) entry.cols = cols;
    }
    cluster = [];
    clusterEnd = -Infinity;
  };

  for (const item of items) {
    if (cluster.length === 0 || item.start < clusterEnd) {
      cluster.push(item);
      clusterEnd = Math.max(clusterEnd, item.end);
    } else {
      flush();
      cluster.push(item);
      clusterEnd = item.end;
    }
  }
  flush();

  return result;
}

function timeTop(startIso: string) {
  const d = new Date(startIso);
  const hours = Math.min(Math.max(d.getHours() + d.getMinutes() / 60, HOUR_START), HOUR_END);
  return (hours - HOUR_START) * ROW_HEIGHT;
}

function timeHeight(startIso: string, duracaoMin: number) {
  const d = new Date(startIso);
  const startHours = Math.max(d.getHours() + d.getMinutes() / 60, HOUR_START);
  const endHours = Math.min(startHours + duracaoMin / 60, HOUR_END);
  return Math.max((endHours - startHours) * ROW_HEIGHT, 22);
}

function SessionBlock({ item, detailed }: { item: LayoutItem; detailed?: boolean }) {
  const s = item.session;
  const gap = 2;
  const widthPct = 100 / item.cols;
  return (
    <div
      className={`absolute overflow-hidden rounded-md border px-2 py-1 text-[11px] leading-tight shadow-sm ${sessionTone(s.status)}`}
      style={{
        top: timeTop(s.starts_at),
        height: timeHeight(s.starts_at, s.duracao_min),
        left: `calc(${item.col * widthPct}% + ${gap}px)`,
        width: `calc(${widthPct}% - ${gap * 2}px)`,
      }}
      title={`${s.patients?.nome ?? "Paciente"} • ${hora(s.starts_at)} • ${s.modalidade === "remoto" ? "Remoto" : "Presencial"} • ${brl(Number(s.valor))} • ${s.status}`}
    >
      <div className="font-semibold">{hora(s.starts_at)}</div>
      <div className="truncate">{s.patients?.nome ?? "Paciente"}</div>
      {detailed && (
        <div className="mt-0.5 truncate text-[10px] opacity-80">
          {s.modalidade === "remoto" ? "Remoto" : "Presencial"} • {brl(Number(s.valor))}
        </div>
      )}
    </div>
  );
}

function TimeGridBackground() {
  const hours = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
  return (
    <>
      {hours.map((h) => (
        <div
          key={h}
          className="absolute left-0 right-0 border-t border-border/60"
          style={{ top: (h - HOUR_START) * ROW_HEIGHT }}
        />
      ))}
    </>
  );
}

export function CalendarView({
  sessions,
  view,
  setView,
  cursor,
  setCursor,
}: {
  sessions: SessionWithPatient[];
  view: ViewMode;
  setView: (view: ViewMode) => void;
  cursor: Date;
  setCursor: Dispatch<SetStateAction<Date>>;
}) {
  const hoje = startOfDay(new Date());

  const navigate = (delta: number) => {
    if (view === "mes") setCursor((c) => addMonths(c, delta));
    else if (view === "semana") setCursor((c) => addDays(c, delta * 7));
    else setCursor((c) => addDays(c, delta));
  };

  const label = useMemo(() => {
    if (view === "mes") {
      const text = cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
    if (view === "semana") {
      const start = startOfWeek(cursor);
      const end = addDays(start, 6);
      const sameMonth = start.getMonth() === end.getMonth();
      const startLabel = start.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: sameMonth ? undefined : "short",
      });
      const endLabel = end.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return `${startLabel} – ${endLabel}`;
    }
    const text = cursor.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
    return text.charAt(0).toUpperCase() + text.slice(1);
  }, [view, cursor]);

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, SessionWithPatient[]>();
    for (const s of sessions) {
      const key = startOfDay(new Date(s.starts_at)).toISOString();
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    return map;
  }, [sessions]);

  const sessionsOn = (day: Date) => sessionsByDay.get(startOfDay(day).toISOString()) ?? [];

  return (
    <section className="overflow-hidden rounded-xl bg-surface shadow-ring">
      <div className="flex flex-col gap-3 border-b border-border bg-surface-muted px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium">Calendário</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(-1)}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Próximo"
            >
              <ChevronRight className="size-4" />
            </button>
            <button
              onClick={() => setCursor(startOfDay(new Date()))}
              className="ml-1 rounded bg-muted px-2 py-1 text-[11px] font-medium text-secondary-foreground transition-colors hover:bg-accent"
            >
              Hoje
            </button>
          </div>
          <span className="text-sm font-medium capitalize text-foreground">{label}</span>
        </div>

        <div className="flex gap-1">
          {(["mes", "semana", "dia"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded px-3 py-1.5 text-[11px] font-medium transition-colors ${
                view === v
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-secondary-foreground hover:bg-accent"
              }`}
            >
              {v === "mes" ? "Mês" : v === "semana" ? "Semana" : "Dia"}
            </button>
          ))}
        </div>
      </div>

      {view === "mes" && (
        <div>
          <div className="grid grid-cols-7 border-b border-border">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="label-eyebrow px-2 py-2 text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthGrid(cursor).map((day) => {
              const inMonth = day.getMonth() === cursor.getMonth();
              const isToday = sameDay(day, hoje);
              const daySessions = sessionsOn(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    setCursor(startOfDay(day));
                    setView("dia");
                  }}
                  className={`flex min-h-24 flex-col items-start gap-1 border-b border-r border-border p-1.5 text-left transition-colors hover:bg-muted/50 ${
                    inMonth ? "" : "bg-muted/20 text-muted-foreground"
                  }`}
                >
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-[11px] ${
                      isToday ? "bg-primary font-semibold text-primary-foreground" : ""
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  <div className="flex w-full flex-col gap-0.5">
                    {daySessions.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-1 truncate text-[10px]"
                        title={`${hora(s.starts_at)} • ${s.patients?.nome ?? "Paciente"}`}
                      >
                        <span className={`size-1.5 shrink-0 rounded-full ${statusDot(s.status)}`} />
                        <span className="shrink-0 text-muted-foreground">{hora(s.starts_at)}</span>
                        <span className="truncate">{s.patients?.nome ?? "Paciente"}</span>
                      </div>
                    ))}
                    {daySessions.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{daySessions.length - 3} mais
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === "semana" && (
        <div className="overflow-x-auto">
          <div className="flex min-w-[720px]">
            <div className="w-14 shrink-0">
              <div className="h-10 border-b border-border" />
              <div className="relative" style={{ height: TOTAL_HEIGHT }}>
                {Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i).map(
                  (h) => (
                    <div
                      key={h}
                      className="absolute right-2 -translate-y-2 text-[10px] text-muted-foreground"
                      style={{ top: (h - HOUR_START) * ROW_HEIGHT }}
                    >
                      {h}:00
                    </div>
                  ),
                )}
              </div>
            </div>
            {Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i)).map((day) => {
              const isToday = sameDay(day, hoje);
              const items = layoutDay(sessionsOn(day));
              return (
                <div key={day.toISOString()} className="min-w-0 flex-1 border-l border-border">
                  <button
                    onClick={() => {
                      setCursor(startOfDay(day));
                      setView("dia");
                    }}
                    className="flex h-10 w-full flex-col items-center justify-center border-b border-border hover:bg-muted/50"
                  >
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {DIAS_SEMANA[day.getDay()]}
                    </span>
                    <span
                      className={`text-xs font-medium ${isToday ? "text-primary" : "text-foreground"}`}
                    >
                      {day.getDate()}
                    </span>
                  </button>
                  <div className="relative" style={{ height: TOTAL_HEIGHT }}>
                    <TimeGridBackground />
                    {items.map((item) => (
                      <SessionBlock key={item.session.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "dia" && (
        <div className="overflow-x-auto">
          <div className="flex min-w-[420px]">
            <div className="w-14 shrink-0">
              <div className="relative" style={{ height: TOTAL_HEIGHT }}>
                {Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i).map(
                  (h) => (
                    <div
                      key={h}
                      className="absolute right-2 -translate-y-2 text-[10px] text-muted-foreground"
                      style={{ top: (h - HOUR_START) * ROW_HEIGHT }}
                    >
                      {h}:00
                    </div>
                  ),
                )}
              </div>
            </div>
            <div
              className="relative flex-1 border-l border-border"
              style={{ height: TOTAL_HEIGHT }}
            >
              <TimeGridBackground />
              {layoutDay(sessionsOn(cursor)).map((item) => (
                <SessionBlock key={item.session.id} item={item} detailed />
              ))}
              {sessionsOn(cursor).length === 0 && (
                <p className="absolute inset-x-0 top-4 text-center text-sm text-muted-foreground">
                  Nenhuma sessão neste dia.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
