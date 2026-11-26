import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatWhen } from "@/lib/format";
import { categoryLabel, priorityLabel, statusTone } from "@/lib/labels";
import type { Ticket } from "@/services/tickets";

type Props = {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  emptyLabel?: string;
};

export function TicketList({
  tickets,
  loading,
  error,
  emptyLabel = "Nenhum ticket ainda.",
}: Props) {
  if (loading) {
    return (
      <p className="px-6 py-6 text-sm text-[var(--cf-muted)] sm:px-8">
        Carregando tickets…
      </p>
    );
  }
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (tickets.length === 0) {
    return (
      <p className="px-6 py-8 text-sm text-[var(--cf-muted)] sm:px-8">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--cf-border)]">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <Link
            to={`/tickets/${ticket.id}`}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-4 transition duration-200 hover:bg-zinc-50 sm:px-8"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{ticket.title}</p>
              <p className="mt-0.5 text-xs text-[var(--cf-muted)]">
                #{ticket.id} · {categoryLabel[ticket.category]} ·{" "}
                {priorityLabel[ticket.priority]}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Aberto em {formatWhen(ticket.created_at)}
                <span className="px-1.5 text-zinc-300">·</span>
                Atualizado em {formatWhen(ticket.updated_at)}
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
