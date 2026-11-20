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
import { useActor } from "@/lib/actor";
import {
  createTicket,
  getTicket,
  listTickets,
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

  if (!actor) return null;

  const isStudent = actor.role === "student";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {isStudent && (
        <div className="text-center">
          <p className="mb-2 inline-flex rounded-full border border-[var(--cf-border)] bg-white px-3 py-1 text-xs text-[var(--cf-muted)]">
            Abrir um chamado
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Como podemos ajudar?
          </h2>
        </div>
      )}

      {isStudent && (
        <ProgressiveTicketComposer
          onSubmit={async (payload) => {
            const ticket = await createTicket(payload);
            setTickets((prev) => [ticket, ...prev]);
          }}
        />
      )}

      {!isStudent && !loading && !error && <MetricsPanel tickets={tickets} />}

      <section className="space-y-3">
        <div>
          <h3 className="font-medium">
            {isStudent ? "Meus tickets" : "Tickets"}
          </h3>
          <p className="text-xs text-[var(--cf-muted)]">
            Clique em um item para ver detalhes e ações
          </p>
        </div>
        <TicketList tickets={tickets} loading={loading} error={error} />
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
      ticket={ticket}
      onChanged={(next) => {
        if (next === null) navigate("/");
        else setTicket(next);
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
