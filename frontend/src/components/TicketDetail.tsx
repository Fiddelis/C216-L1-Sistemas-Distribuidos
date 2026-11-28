import { ArrowLeft } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { TicketForm } from "@/components/TicketForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/lib/actor";
import { formatWhen } from "@/lib/format";
import {
  categoryLabel,
  priorityLabel,
  statusAction,
  statusTone,
} from "@/lib/labels";
import { notifyTicketsChanged } from "@/lib/ticket-events";
import {
  deleteTicket,
  patchTicket,
  postMessage,
  type Status,
  type Ticket,
  transitionTicket,
} from "@/services/tickets";

type Props = {
  ticket: Ticket;
  onChanged: (ticket: Ticket | null) => void;
};

export function TicketDetail({ ticket, onChanged }: Props) {
  const { actor } = useActor();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const messages = ticket.messages ?? [];
  const events = ticket.events ?? [];
  const canEdit = ticket.allowed_patch_fields.length > 0;
  const closed = ticket.status === "Fechado";

  async function run(action: () => Promise<Ticket | undefined>) {
    setPending(true);
    setError(null);
    try {
      const result = await action();
      onChanged(result === undefined ? null : result);
      notifyTicketsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na ação");
    } finally {
      setPending(false);
    }
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setPending(true);
    setError(null);
    try {
      const updated = await postMessage(ticket.id, body);
      setDraft("");
      onChanged(updated);
      notifyTicketsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="border-b border-[var(--cf-border)] px-6 py-3 sm:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.16em] text-zinc-400 uppercase transition hover:text-zinc-950"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tickets
        </Link>
      </div>

      <article>
        <header className="flex items-start justify-between gap-3 border-b border-[var(--cf-border)] px-6 py-6 sm:px-8">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight">
              {ticket.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--cf-muted)]">
              #{ticket.id} · {categoryLabel[ticket.category]} ·{" "}
              {priorityLabel[ticket.priority]}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Aberto em {formatWhen(ticket.created_at)}
              <span className="px-1.5 text-zinc-300">·</span>
              Atualizado em {formatWhen(ticket.updated_at)}
            </p>
          </div>
          <Badge className={statusTone[ticket.status]}>{ticket.status}</Badge>
        </header>

        {!editing && (
          <p className="border-b border-[var(--cf-border)] px-6 py-6 text-sm leading-6 whitespace-pre-wrap sm:px-8">
            {ticket.description}
          </p>
        )}

        {editing && (
          <div className="border-b border-[var(--cf-border)] px-6 py-6 sm:px-8">
            <h3 className="mb-3 text-sm font-medium">Editar ticket</h3>
            <TicketForm
              key={`${ticket.id}-${ticket.updated_at}`}
              formId="ticket-edit"
              hideSubmit
              initial={ticket}
              submitLabel="Salvar"
              allowedFields={ticket.allowed_patch_fields}
              onBusy={setSaving}
              onSubmit={async (payload) => {
                const body: Record<string, string> = {};
                for (const field of ticket.allowed_patch_fields) {
                  body[field] = payload[
                    field as keyof typeof payload
                  ] as string;
                }
                const updated = await patchTicket(ticket.id, body);
                setEditing(false);
                onChanged(updated);
                notifyTicketsChanged();
              }}
            />
          </div>
        )}

        <section className="border-b border-[var(--cf-border)]">
          <h3 className="px-6 py-4 text-sm font-medium sm:px-8">Conversa</h3>
          <ul className="space-y-3 px-6 pb-6 sm:px-8">
            {messages.length === 0 && (
              <li className="text-sm text-zinc-500">
                Nenhuma mensagem ainda. Escreva para o outro lado do ticket.
              </li>
            )}
            {messages.map((message) => {
              const mine = message.author_user_id === actor?.id;
              return (
                <li
                  key={message.id}
                  className={
                    mine
                      ? "ml-auto max-w-[36rem] bg-zinc-950 px-4 py-3 text-white"
                      : "mr-auto max-w-[36rem] bg-zinc-100 px-4 py-3 text-zinc-950"
                  }
                >
                  <p className="text-xs font-medium tracking-wide uppercase">
                    {message.author_name}
                    <span className={mine ? "text-white/50" : "text-zinc-400"}>
                      {" "}
                      · {message.author_role === "it" ? "TI" : "Aluno"}
                    </span>
                  </p>
                  <p className="mt-1 text-sm leading-6 whitespace-pre-wrap">
                    {message.body}
                  </p>
                  <p
                    className={
                      mine
                        ? "mt-2 text-[11px] text-white/50"
                        : "mt-2 text-[11px] text-zinc-500"
                    }
                  >
                    {formatWhen(message.created_at)}
                  </p>
                </li>
              );
            })}
          </ul>
          {!closed && (
            <form
              className="flex items-stretch gap-2 border-t border-[var(--cf-border)] px-6 py-4 sm:px-8"
              onSubmit={send}
            >
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={2}
                placeholder="Escreva uma mensagem"
                aria-label="Mensagem"
              />
              <Button
                type="submit"
                className="h-auto shrink-0 px-6"
                disabled={pending || !draft.trim()}
              >
                Enviar
              </Button>
            </form>
          )}
        </section>

        <section className="border-b border-[var(--cf-border)]">
          <h3 className="px-6 py-4 text-sm font-medium sm:px-8">Histórico</h3>
          <ul>
            {events.length === 0 && (
              <li className="px-6 pb-6 text-sm text-zinc-500 sm:px-8">
                Nenhuma mudança de status ainda.
              </li>
            )}
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between gap-4 border-t border-[var(--cf-border)] px-6 py-3 sm:px-8"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Badge className={statusTone[event.to_status]}>
                    {event.to_status}
                  </Badge>
                  <p className="truncate text-sm">
                    {event.from_status
                      ? `a partir de ${event.from_status}`
                      : "Abertura"}
                    <span className="text-zinc-400">
                      {" "}
                      · {event.actor_name} ·{" "}
                      {event.actor_role === "it" ? "TI" : "Aluno"}
                    </span>
                  </p>
                </div>
                <p className="shrink-0 text-xs text-zinc-500">
                  {formatWhen(event.created_at)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {confirmingDelete && (
          <p className="border-b border-[var(--cf-border)] px-6 py-4 text-sm text-zinc-700 sm:px-8">
            Excluir “{ticket.title}”? Essa ação não volta.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 px-6 py-4 sm:px-8">
          {canEdit && !editing && (
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => setEditing(true)}
            >
              Editar
            </Button>
          )}
          {editing && (
            <>
              <Button
                type="submit"
                form="ticket-edit"
                disabled={pending || saving}
              >
                {saving ? "Salvando…" : "Salvar"}
              </Button>
              <Button
                variant="outline"
                disabled={pending || saving}
                onClick={() => setEditing(false)}
              >
                Cancelar
              </Button>
            </>
          )}
          {ticket.allowed_transitions.map((status: Status) => (
            <Button
              key={status}
              variant="outline"
              className={statusAction[status]}
              disabled={pending || saving}
              onClick={() => run(() => transitionTicket(ticket.id, status))}
            >
              {status}
            </Button>
          ))}
          {confirmingDelete ? (
            <>
              <Button
                variant="destructive"
                className="border-transparent bg-red-600 text-white hover:bg-red-700"
                disabled={pending || saving}
                onClick={() =>
                  run(async () => {
                    await deleteTicket(ticket.id);
                    return undefined;
                  })
                }
              >
                Excluir agora
              </Button>
              <Button
                variant="outline"
                disabled={pending || saving}
                onClick={() => setConfirmingDelete(false)}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              variant="destructive"
              className="border-transparent bg-red-600 text-white hover:bg-red-700"
              disabled={pending || saving}
              onClick={() => setConfirmingDelete(true)}
            >
              Excluir ticket
            </Button>
          )}
        </div>
      </article>

      {error && (
        <p className="px-6 py-3 text-sm text-red-600 sm:px-8">{error}</p>
      )}
    </div>
  );
}
