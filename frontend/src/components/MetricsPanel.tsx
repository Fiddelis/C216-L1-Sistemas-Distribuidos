import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { FilterSelect } from "@/components/ui/filter-select";
import {
  categoryLabel,
  priorityLabel,
  statusBar,
  statusTone,
} from "@/lib/labels";
import type { Category, Priority, Status, Ticket } from "@/services/tickets";

type Props = {
  tickets: Ticket[];
};

type Period = "all" | "today" | "7" | "30" | "month" | "custom";
type DateField = "created_at" | "updated_at";

const STATUSES: Status[] = [
  "Aberto",
  "Em andamento",
  "Aguardando aluno",
  "Resolvido",
  "Fechado",
];

const CATEGORIES: Category[] = ["rede", "software", "hardware", "conta"];
const PRIORITIES: Priority[] = ["baixa", "media", "alta"];

const OPEN_STATUSES: Status[] = [
  "Aberto",
  "Em andamento",
  "Aguardando aluno",
  "Resolvido",
];

function count(tickets: Ticket[], key: (ticket: Ticket) => string) {
  const map: Record<string, number> = {};
  for (const ticket of tickets) {
    const name = key(ticket);
    map[name] = (map[name] ?? 0) + 1;
  }
  return map;
}

function toInput(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseInput(value: string, end: boolean) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(
    year,
    month - 1,
    day,
    end ? 23 : 0,
    end ? 59 : 0,
    end ? 59 : 0,
    end ? 999 : 0,
  ).getTime();
}

function rangeFor(period: Period) {
  const now = new Date();
  const today = toInput(now);
  if (period === "today") return { from: today, to: today };
  if (period === "7" || period === "30") {
    const start = new Date(now);
    start.setDate(start.getDate() - (period === "7" ? 6 : 29));
    return { from: toInput(start), to: today };
  }
  if (period === "month") {
    return {
      from: toInput(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: today,
    };
  }
  return { from: "", to: "" };
}

const dayLabel = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDay(value: string) {
  const time = parseInput(value, false);
  if (time === null) return "Qualquer";
  return dayLabel.format(time);
}

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const monthLabel = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

function formatMonth(year: number, month: number) {
  const text = monthLabel.format(new Date(year, month, 1));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function viewFrom(value: string) {
  const time = parseInput(value, false);
  const date = time === null ? new Date() : new Date(time);
  return { year: date.getFullYear(), month: date.getMonth() };
}

function monthCells(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ key: string; day: number | null }> = [];
  for (let index = 0; index < first; index += 1) {
    cells.push({ key: `pad-${year}-${month}-${index}`, day: null });
  }
  for (let day = 1; day <= total; day += 1) {
    cells.push({ key: `day-${year}-${month}-${day}`, day });
  }
  let tail = 0;
  while (cells.length % 7 !== 0) {
    tail += 1;
    cells.push({ key: `tail-${year}-${month}-${tail}`, day: null });
  }
  return cells;
}

function DateFieldControl({
  label,
  value,
  align = "left",
  onChange,
}: {
  label: string;
  value: string;
  align?: "left" | "right";
  onChange: (value: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => viewFrom(value));
  const today = toInput(new Date());
  const cells = monthCells(cursor.year, cursor.month);

  useEffect(() => {
    if (!open) return;
    function close(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  function toggle() {
    setCursor(viewFrom(value));
    setOpen((current) => !current);
  }

  function pick(day: number) {
    onChange(toInput(new Date(cursor.year, cursor.month, day)));
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative h-full min-h-14">
      <button
        type="button"
        aria-expanded={open}
        onClick={toggle}
        className="flex h-full min-h-14 w-full cursor-pointer items-center justify-between gap-3 px-6 py-2 text-left outline-none hover:bg-zinc-50 sm:px-8"
      >
        <span className="min-w-0">
          <span className="block text-[11px] tracking-[0.14em] text-zinc-400 uppercase">
            {label}
          </span>
          <span
            className={`block truncate text-sm ${value ? "text-zinc-950" : "text-zinc-400"}`}
          >
            {formatDay(value)}
          </span>
        </span>
        <Calendar className="h-4 w-4 shrink-0 text-zinc-400" />
      </button>
      {open && (
        <div
          className={`absolute top-full z-50 w-64 border border-[var(--cf-border)] bg-white p-3 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Mês anterior"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
              onClick={() =>
                setCursor((current) =>
                  current.month === 0
                    ? { year: current.year - 1, month: 11 }
                    : { year: current.year, month: current.month - 1 },
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-medium">
              {formatMonth(cursor.year, cursor.month)}
            </p>
            <button
              type="button"
              aria-label="Próximo mês"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
              onClick={() =>
                setCursor((current) =>
                  current.month === 11
                    ? { year: current.year + 1, month: 0 }
                    : { year: current.year, month: current.month + 1 },
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="py-1 text-center text-[10px] tracking-[0.08em] text-zinc-400 uppercase"
              >
                {day}
              </span>
            ))}
            {cells.map((cell) => {
              const day = cell.day;
              if (day === null) {
                return <span key={cell.key} />;
              }
              const iso = toInput(new Date(cursor.year, cursor.month, day));
              const selected = iso === value;
              const isToday = iso === today;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => pick(day)}
                  className={`inline-flex h-8 cursor-pointer items-center justify-center text-sm ${
                    selected
                      ? "bg-zinc-950 text-white"
                      : isToday
                        ? "text-zinc-950 ring-1 ring-zinc-950 ring-inset hover:bg-zinc-100"
                        : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {value && (
            <button
              type="button"
              className="mt-2 w-full cursor-pointer py-1.5 text-left text-xs text-zinc-500 hover:text-zinc-950"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Limpar data
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function MetricsPanel({ tickets }: Props) {
  const [period, setPeriod] = useState<Period>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dateField, setDateField] = useState<DateField>("created_at");
  const [status, setStatus] = useState<Status | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [priority, setPriority] = useState<Priority | "all">("all");

  const filtering =
    period !== "all" ||
    from !== "" ||
    to !== "" ||
    dateField !== "created_at" ||
    status !== "all" ||
    category !== "all" ||
    priority !== "all";

  const filtered = useMemo(() => {
    const start = from ? parseInput(from, false) : null;
    const end = to ? parseInput(to, true) : null;
    return tickets.filter((ticket) => {
      if (status !== "all" && ticket.status !== status) return false;
      if (category !== "all" && ticket.category !== category) return false;
      if (priority !== "all" && ticket.priority !== priority) return false;
      if (start !== null || end !== null) {
        const time = new Date(ticket[dateField]).getTime();
        if (Number.isNaN(time)) return false;
        if (start !== null && time < start) return false;
        if (end !== null && time > end) return false;
      }
      return true;
    });
  }, [tickets, status, category, priority, from, to, dateField]);

  const byStatus = count(filtered, (ticket) => ticket.status);
  const byCategory = count(filtered, (ticket) => ticket.category);
  const byPriority = count(filtered, (ticket) => ticket.priority);
  const open = filtered.filter((ticket) =>
    OPEN_STATUSES.includes(ticket.status),
  ).length;
  const closed = filtered.filter(
    (ticket) => ticket.status === "Fechado",
  ).length;
  const total = filtered.length || 1;
  const maxStatus = Math.max(...STATUSES.map((item) => byStatus[item] ?? 0), 1);

  const stats = [
    { label: "Total", value: String(filtered.length) },
    { label: "Em aberto", value: String(open) },
    { label: "Fechados", value: String(closed) },
    {
      label: "Taxa de fechamento",
      value: `${Math.round((closed / total) * 100)}%`,
    },
  ];

  function choosePeriod(next: string) {
    const periodNext = next as Period;
    setPeriod(periodNext);
    if (periodNext === "custom") return;
    const range = rangeFor(periodNext);
    setFrom(range.from);
    setTo(range.to);
  }

  function chooseBound(which: "from" | "to", value: string) {
    const nextFrom = which === "from" ? value : from;
    const nextTo = which === "to" ? value : to;
    setFrom(nextFrom);
    setTo(nextTo);
    setPeriod(nextFrom || nextTo ? "custom" : "all");
  }

  function clearFilters() {
    setPeriod("all");
    setFrom("");
    setTo("");
    setDateField("created_at");
    setStatus("all");
    setCategory("all");
    setPriority("all");
  }

  return (
    <section>
      <div className="border-b border-[var(--cf-border)] px-6 py-8 sm:px-8">
        <p className="text-[11px] font-medium tracking-[0.18em] text-zinc-400 uppercase">
          Fila da TI
        </p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight">Métricas</h2>
      </div>

      <div className="flex flex-col divide-y divide-[var(--cf-border)] border-b border-[var(--cf-border)] lg:flex-row lg:divide-x lg:divide-y-0">
        <div className="grid min-w-0 flex-1 grid-cols-1 divide-y divide-[var(--cf-border)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x xl:grid-cols-8">
          <FilterSelect
            label="Data"
            value={dateField}
            onValueChange={(value) => setDateField(value as DateField)}
            options={[
              { value: "created_at", label: "Abertura" },
              { value: "updated_at", label: "Atualização" },
            ]}
          />
          <FilterSelect
            label="Período"
            value={period}
            onValueChange={choosePeriod}
            options={[
              { value: "all", label: "Qualquer" },
              { value: "today", label: "Hoje" },
              { value: "7", label: "7 dias" },
              { value: "30", label: "30 dias" },
              { value: "month", label: "Este mês" },
              ...(period === "custom"
                ? [{ value: "custom", label: "Personalizado" }]
                : []),
            ]}
          />
          <DateFieldControl
            label="De"
            value={from}
            onChange={(value) => chooseBound("from", value)}
          />
          <DateFieldControl
            label="Até"
            value={to}
            align="right"
            onChange={(value) => chooseBound("to", value)}
          />
          <FilterSelect
            label="Status"
            value={status}
            onValueChange={(value) => setStatus(value as Status | "all")}
            options={[
              { value: "all", label: "Todos" },
              ...STATUSES.map((item) => ({ value: item, label: item })),
            ]}
          />
          <FilterSelect
            label="Categoria"
            value={category}
            onValueChange={(value) => setCategory(value as Category | "all")}
            options={[
              { value: "all", label: "Todas" },
              ...Object.entries(categoryLabel).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <FilterSelect
            label="Prioridade"
            value={priority}
            onValueChange={(value) => setPriority(value as Priority | "all")}
            options={[
              { value: "all", label: "Todas" },
              ...Object.entries(priorityLabel).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <button
            type="button"
            className="cursor-pointer px-6 py-3 text-left text-sm text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-default disabled:opacity-40 sm:px-8"
            disabled={!filtering}
            onClick={clearFilters}
          >
            Limpar filtros
          </button>
        </div>
        <p className="flex shrink-0 items-center px-4 py-3 text-sm whitespace-nowrap text-zinc-500 tabular-nums">
          {filtering
            ? `${filtered.length} de ${tickets.length}`
            : `${tickets.length} na fila`}
        </p>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-[var(--cf-border)] border-b border-[var(--cf-border)] sm:grid-cols-4 sm:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="px-5 py-4">
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-[var(--cf-muted)]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid divide-y divide-[var(--cf-border)] lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)] lg:divide-x lg:divide-y-0">
        <div className="px-5 py-5">
          <h3 className="text-sm font-medium">Por status</h3>
          <ul className="mt-5 space-y-3">
            {STATUSES.map((item) => {
              const value = byStatus[item] ?? 0;
              const width = `${Math.max((value / maxStatus) * 100, value ? 4 : 0)}%`;
              return (
                <li
                  key={item}
                  className="grid grid-cols-[9.5rem_minmax(0,1fr)_1.75rem] items-center gap-3"
                >
                  <Badge className={`w-fit ${statusTone[item]}`}>{item}</Badge>
                  <div className="h-2 overflow-hidden bg-zinc-100">
                    <div
                      className={`metric-bar h-full ${statusBar[item]}`}
                      style={{ width }}
                    />
                  </div>
                  <span className="text-right text-sm font-medium tabular-nums">
                    {value}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="px-5 py-5">
          <h3 className="text-sm font-medium">Por categoria</h3>
          <ul className="mt-4 divide-y divide-[var(--cf-border)]">
            {CATEGORIES.map((item) => (
              <li
                key={item}
                className="flex items-baseline justify-between gap-3 py-2.5"
              >
                <span className="text-sm">{categoryLabel[item]}</span>
                <span className="text-sm font-medium tabular-nums">
                  {byCategory[item] ?? 0}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-[var(--cf-border)] border-t border-b border-[var(--cf-border)]">
        {PRIORITIES.map((item) => (
          <div key={item} className="px-5 py-4">
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {byPriority[item] ?? 0}
            </p>
            <p className="mt-1 text-sm text-[var(--cf-muted)]">
              Prioridade {priorityLabel[item].toLowerCase()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
