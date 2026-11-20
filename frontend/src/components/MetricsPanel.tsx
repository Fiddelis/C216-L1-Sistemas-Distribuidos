import type { Status, Ticket } from "@/services/tickets";

type Props = {
  tickets: Ticket[];
};

const STATUSES: Status[] = [
  "Aberto",
  "Em andamento",
  "Aguardando aluno",
  "Resolvido",
  "Fechado",
];

const OPEN_STATUSES: Status[] = [
  "Aberto",
  "Em andamento",
  "Aguardando aluno",
  "Resolvido",
];

function countByStatus(tickets: Ticket[]) {
  const map: Record<string, number> = {};
  for (const ticket of tickets) {
    map[ticket.status] = (map[ticket.status] ?? 0) + 1;
  }
  return map;
}

export function MetricsPanel({ tickets }: Props) {
  const byStatus = countByStatus(tickets);
  const open = tickets.filter((ticket) =>
    OPEN_STATUSES.includes(ticket.status),
  ).length;
  const closed = tickets.filter((ticket) => ticket.status === "Fechado").length;
  const total = tickets.length || 1;
  const maxBar = Math.max(
    ...STATUSES.map((status) => byStatus[status] ?? 0),
    1,
  );

  const cards = [
    { label: "Total", value: tickets.length },
    { label: "Em aberto", value: open },
    { label: "Fechados", value: closed },
    {
      label: "Taxa de fechamento",
      value: `${Math.round((closed / total) * 100)}%`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[var(--cf-border)] bg-white px-4 py-3.5 shadow-sm"
          >
            <p className="text-xs text-[var(--cf-muted)]">{card.label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--cf-border)] bg-white p-5 shadow-sm">
        <h3 className="font-medium">Tickets por status</h3>
        <p className="mt-0.5 text-xs text-[var(--cf-muted)]">
          Quantidade em cada etapa da fila
        </p>
        <div className="mt-5 space-y-3">
          {STATUSES.map((status) => {
            const value = byStatus[status] ?? 0;
            const width = `${Math.max((value / maxBar) * 100, value ? 6 : 0)}%`;
            const closedBar = status === "Fechado";
            return (
              <div
                key={status}
                className="grid grid-cols-[9.5rem_minmax(0,1fr)_1.5rem] items-center gap-3"
              >
                <span className="truncate text-sm text-zinc-600">{status}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      closedBar ? "bg-[var(--inatel)]" : "bg-[#7eb0d8]"
                    }`}
                    style={{ width }}
                  />
                </div>
                <span className="text-right text-sm font-medium tabular-nums text-zinc-700">
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
