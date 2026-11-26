import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { LoginScreen } from "@/components/LoginScreen";
import { MetricsPanel } from "@/components/MetricsPanel";
import { ProgressiveTicketComposer } from "@/components/ProgressiveTicketComposer";
import { TicketDetail } from "@/components/TicketDetail";
import { TicketList } from "@/components/TicketList";
import { FilterSelect } from "@/components/ui/filter-select";
import { useActor } from "@/lib/actor";
import { categoryLabel, priorityLabel } from "@/lib/labels";
import { notifyTicketsChanged } from "@/lib/ticket-events";
import {
  type Category,
  createTicket,
  getTicket,
  listTickets,
  type Priority,
  type Status,
  type Ticket,
} from "@/services/tickets";

function useTickets() {
  const { actor } = useActor();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actor) {
      setTickets([]);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    listTickets()
      .then((rows) => {
        if (alive) setTickets(rows);
      })
      .catch((err: Error) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [actor]);

  return { tickets, setTickets, loading, error };
}

function HomePage() {
  const { actor } = useActor();
  const { tickets, setTickets, loading, error } = useTickets();
  const [status, setStatus] = useState<Status | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [priority, setPriority] = useState<Priority | "all">("all");

  if (!actor) return null;

  const isStudent = actor.role === "student";
  const filtered = tickets.filter((ticket) => {
    if (status !== "all" && ticket.status !== status) return false;
    if (category !== "all" && ticket.category !== category) return false;
    if (priority !== "all" && ticket.priority !== priority) return false;
    return true;
  });
  const filtering =
    status !== "all" || category !== "all" || priority !== "all";

  return (
    <div>
      {isStudent && (
        <section className="border-b border-[var(--cf-border)] px-6 py-8 sm:px-8">
          <p className="text-[11px] font-medium tracking-[0.18em] text-zinc-400 uppercase">
            Abrir um chamado
          </p>
          <h2 className="mt-2 max-w-xl text-4xl font-semibold tracking-tight">
            Como podemos ajudar?
          </h2>
          <div className="mt-6 max-w-3xl">
            <ProgressiveTicketComposer
              onSubmit={async (payload) => {
                const ticket = await createTicket(payload);
                setTickets((prev) => [ticket, ...prev]);
              }}
            />
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-col divide-y divide-[var(--cf-border)] border-b border-[var(--cf-border)] lg:flex-row lg:divide-x lg:divide-y-0">
          <div className="grid min-w-0 flex-1 grid-cols-1 divide-y divide-[var(--cf-border)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            <FilterSelect
              label="Status"
              value={status}
              onValueChange={(value) => setStatus(value as Status | "all")}
              options={[
                { value: "all", label: "Todos" },
                { value: "Aberto", label: "Aberto" },
                { value: "Em andamento", label: "Em andamento" },
                { value: "Aguardando aluno", label: "Aguardando aluno" },
                { value: "Resolvido", label: "Resolvido" },
                { value: "Fechado", label: "Fechado" },
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
              onClick={() => {
                setStatus("all");
                setCategory("all");
                setPriority("all");
              }}
            >
              Limpar filtros
            </button>
          </div>
          <p className="flex shrink-0 items-center px-4 py-3 text-sm whitespace-nowrap text-zinc-500 tabular-nums">
            {loading
              ? "Carregando…"
              : filtering
                ? `${filtered.length} de ${tickets.length}`
                : `${tickets.length} na fila`}
          </p>
        </div>
        <TicketList
          tickets={filtered}
          loading={loading}
          error={error}
          emptyLabel={
            filtering
              ? "Nenhum ticket com esses filtros."
              : "Nenhum ticket ainda."
          }
        />
      </section>
    </div>
  );
}

function MetricsPage() {
  const { actor } = useActor();
  const { tickets, loading, error } = useTickets();

  if (!actor) return null;
  if (actor.role !== "it") return <Navigate to="/" replace />;
  if (loading) {
    return (
      <p className="text-sm text-[var(--cf-muted)]">Carregando métricas…</p>
    );
  }
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return <MetricsPanel tickets={tickets} />;
}

function TicketDetailPage() {
  const { actor } = useActor();
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actor || !id) return;
    let alive = true;
    setLoading(true);
    getTicket(Number(id))
      .then((row) => {
        if (alive) setTicket(row);
        notifyTicketsChanged();
      })
      .catch((err: Error) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [actor, id]);

  if (!actor) return null;
  if (loading) {
    return <p className="text-sm text-[var(--cf-muted)]">Carregando…</p>;
  }
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!ticket) {
    return (
      <p className="text-sm text-[var(--cf-muted)]">Ticket não encontrado.</p>
    );
  }

  return (
    <TicketDetail
      key={ticket.id}
      ticket={ticket}
      onChanged={(next) => {
        if (next === null) navigate("/");
        else setTicket(next);
        notifyTicketsChanged();
      }}
    />
  );
}

function GuardedApp() {
  const { actor, loading } = useActor();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--cf-muted)]">
        Carregando…
      </div>
    );
  }

  if (!actor) return <LoginScreen />;

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/metrics" element={<MetricsPage />} />
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return <GuardedApp />;
}
