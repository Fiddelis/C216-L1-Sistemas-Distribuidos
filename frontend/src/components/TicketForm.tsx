import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categoryLabel, priorityLabel } from "@/lib/labels";
import type {
  Category,
  Priority,
  TicketCreate,
  TicketPatch,
} from "@/services/tickets";

type Props = {
  initial?: Partial<TicketCreate & { priority?: Priority }>;
  submitLabel: string;
  onSubmit: (payload: TicketPatch & TicketCreate) => Promise<void>;
  allowedFields?: string[];
};

const categories: Category[] = ["rede", "software", "hardware", "conta"];
const priorities: Priority[] = ["baixa", "media", "alta"];

export function TicketForm({
  initial,
  submitLabel,
  onSubmit,
  allowedFields,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<Category>(
    initial?.category ?? "rede",
  );
  const [priority, setPriority] = useState<Priority>(
    initial?.priority ?? "media",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const can = (field: string) =>
    !allowedFields || allowedFields.includes(field);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload: TicketPatch & TicketCreate = {
        title,
        description,
        category,
      };
      if (can("priority")) payload.priority = priority;
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {can("title") && (
        <label className="block space-y-1 text-sm" htmlFor="ticket-title">
          Título
          <Input
            id="ticket-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
      )}
      {can("description") && (
        <label className="block space-y-1 text-sm" htmlFor="ticket-description">
          Descrição
          <Textarea
            id="ticket-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </label>
      )}
      {can("category") && (
        <label className="block space-y-1 text-sm" htmlFor="ticket-category">
          Categoria
          <Select
            id="ticket-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {categoryLabel[item]}
              </option>
            ))}
          </Select>
        </label>
      )}
      {can("priority") && (
        <label className="block space-y-1 text-sm" htmlFor="ticket-priority">
          Prioridade
          <Select
            id="ticket-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            {priorities.map((item) => (
              <option key={item} value={item}>
                {priorityLabel[item]}
              </option>
            ))}
          </Select>
        </label>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : submitLabel}
      </Button>
    </form>
  );
}
