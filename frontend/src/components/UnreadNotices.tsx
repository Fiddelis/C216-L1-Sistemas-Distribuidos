import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useActor } from "@/lib/actor";
import { TICKETS_CHANGED } from "@/lib/ticket-events";
import { listTickets, type Ticket } from "@/services/tickets";

export function UnreadNotices() {
  const { actor } = useActor();
  const { pathname } = useLocation();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (!actor) {
      setTickets([]);
      return;
    }
    let alive = true;
    async function load() {
      try {
        const rows = await listTickets();
        if (alive) setTickets(rows);
      } catch {
        return;
      }
    }
    load();
    const timer = window.setInterval(load, 15000);
    window.addEventListener(TICKETS_CHANGED, load);
    return () => {
      alive = false;
      window.clearInterval(timer);
      window.removeEventListener(TICKETS_CHANGED, load);
    };
  }, [actor]);

  const openMatch = pathname.match(/^\/tickets\/(\d+)/);
  const openId = openMatch ? Number(openMatch[1]) : null;
  const notices = tickets.filter(
    (ticket) => ticket.unread_message && ticket.id !== openId,
  );

  if (notices.length === 0) return null;

  return (
    <aside className="pointer-events-none fixed right-6 bottom-6 z-40 flex w-[19rem] max-h-[calc(100vh-7rem)] flex-col justify-end gap-3 overflow-auto">
      {notices.map((ticket) => {
        const message = ticket.unread_message;
        if (!message) return null;
        return (
          <Link
            key={ticket.id}
            to={`/tickets/${ticket.id}`}
            className="pointer-events-auto block bg-zinc-950 px-4 py-4 text-white transition hover:bg-zinc-900"
          >
            <p className="text-[11px] font-medium tracking-[0.16em] text-white/55 uppercase">
              Mensagem nova
            </p>
            <p className="mt-2 text-sm leading-snug font-medium">
              {ticket.title}
            </p>
            <p className="mt-1 text-xs text-white/60">
              #{ticket.id} · {ticket.status}
            </p>
            <p className="mt-3 text-sm text-white/90">{message.author_name}</p>
            <p className="mt-1 line-clamp-3 text-sm leading-5 text-white/70">
              {message.body}
            </p>
          </Link>
        );
      })}
    </aside>
  );
}
