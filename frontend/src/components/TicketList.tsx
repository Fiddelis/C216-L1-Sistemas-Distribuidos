import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { categoryLabel, priorityLabel, statusTone } from "@/lib/labels";
import type { Ticket } from "@/services/tickets";

type Props = {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
};

export function TicketList({ tickets, loading, error }: Props) {
  if (loading) {
    return (
      <p className="text-sm text-[var(--cf-muted)]">Carregando tickets…</p>
    );
  }
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--cf-border)] bg-white px-4 py-8 text-center text-sm text-[var(--cf-muted)]">
        Nenhum ticket ainda.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[var(--cf-border)] overflow-hidden rounded-xl border border-[var(--cf-border)] bg-white shadow-sm">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <Link
            to={`/tickets/${ticket.id}`}
            className="flex items-center justify-between gap-4 px-4 py-3.5 transition duration-200 hover:bg-zinc-50"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{ticket.title}</p>
              <p className="mt-0.5 text-xs text-[var(--cf-muted)]">
                #{ticket.id} · {categoryLabel[ticket.category]} ·{" "}
                {priorityLabel[ticket.priority]}
              </p>
            </div>
            <Badge className={`shrink-0 ${statusTone[ticket.status]}`}>
              {ticket.status}
            </Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}
