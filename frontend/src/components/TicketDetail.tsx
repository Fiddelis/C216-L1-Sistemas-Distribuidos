import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { TicketForm } from "@/components/TicketForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { categoryLabel, priorityLabel, statusTone } from "@/lib/labels";
import {
  deleteTicket,
  patchTicket,
  type Status,
  type Ticket,
  transitionTicket,
} from "@/services/tickets";

type Props = {
  ticket: Ticket;
  onChanged: (ticket: Ticket | null) => void;
};

export function TicketDetail({ ticket, onChanged }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseText, setResponseText] = useState(ticket.description);

  async function run(action: () => Promise<Ticket | undefined>) {
    setPending(true);
    setError(null);
    try {
      const result = await action();
      onChanged(result === undefined ? null : result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na ação");
    } finally {
      setPending(false);
    }
  }

  const canRespond =
    ticket.status === "Aguardando aluno" &&
    ticket.allowed_transitions.includes("Em andamento") &&
    ticket.allowed_patch_fields.includes("description");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Tickets
      </Link>

      <div className="flex items-start justify-between gap-3 rounded-xl border border-[var(--cf-border)] bg-white p-5 shadow-sm">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight">
            {ticket.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--cf-muted)]">
            #{ticket.id} · {categoryLabel[ticket.category]} ·{" "}
            {priorityLabel[ticket.priority]}
          </p>
        </div>
        <Badge className={statusTone[ticket.status]}>{ticket.status}</Badge>
      </div>

      <p className="rounded-xl border border-[var(--cf-border)] bg-white p-4 text-sm leading-6 whitespace-pre-wrap shadow-sm">
        {ticket.description}
      </p>

      {ticket.allowed_patch_fields.length > 0 && (
        <div className="rounded-xl border border-[var(--cf-border)] bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-medium">Editar campos</h3>
          <TicketForm
            initial={ticket}
            submitLabel="Salvar"
            allowedFields={ticket.allowed_patch_fields}
            onSubmit={async (payload) => {
              const body: Record<string, string> = {};
              for (const field of ticket.allowed_patch_fields) {
                body[field] = payload[field as keyof typeof payload] as string;
              }
              const updated = await patchTicket(ticket.id, body);
              onChanged(updated);
            }}
          />
        </div>
      )}

      {canRespond && (
        <div className="space-y-2 rounded-xl border border-[var(--cf-border)] bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium">Responder</h3>
          <Textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={3}
          />
          <Button
            disabled={pending}
            onClick={() =>
              run(async () => {
                await patchTicket(ticket.id, { description: responseText });
                return transitionTicket(ticket.id, "Em andamento");
              })
            }
          >
            Enviar resposta
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {ticket.allowed_transitions.map((status: Status) => (
          <Button
            key={status}
            variant="outline"
            disabled={pending}
            onClick={() => run(() => transitionTicket(ticket.id, status))}
          >
            Ir para {status}
          </Button>
        ))}
        <Button
          variant="destructive"
          className={
            ticket.allowed_transitions.length > 0 ? "sm:ml-auto" : undefined
          }
          disabled={pending}
          onClick={() =>
            run(async () => {
              await deleteTicket(ticket.id);
              return undefined;
            })
          }
        >
          Excluir ticket
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
