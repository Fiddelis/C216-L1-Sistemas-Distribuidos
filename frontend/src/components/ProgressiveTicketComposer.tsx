import { type FormEvent, type KeyboardEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { categoryLabel } from "@/lib/labels";
import type { Category, TicketCreate } from "@/services/tickets";

type Props = {
  onSubmit: (payload: TicketCreate) => Promise<void>;
};

const categories: Category[] = ["rede", "software", "hardware", "conta"];

export function ProgressiveTicketComposer({ onSubmit }: Props) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("rede");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function advanceFromDescription(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (description.trim().length < 3) return;
    setStep(1);
  }

  function maybeShowSave(value = title) {
    if (value.trim().length >= 3) setStep(2);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setPending(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
      });
      setDescription("");
      setTitle("");
      setCategory("rede");
      setStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao abrir ticket");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl">
      <label className="block">
        <span className="mb-2 block text-center text-sm text-[var(--cf-muted)]">
          Descreva o problema. Pressione Enter para continuar.
        </span>
        <div className="rounded-full border border-[var(--cf-border)] bg-white shadow-sm transition duration-300 focus-within:border-[var(--inatel)] focus-within:shadow-md">
          <textarea
            id="compose-description"
            rows={1}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={advanceFromDescription}
            placeholder="O que está acontecendo?"
            className="block max-h-32 w-full resize-none rounded-full border-0 bg-transparent px-5 py-3 text-sm leading-6 outline-none placeholder:text-zinc-400"
          />
        </div>
      </label>

      <div
        inert={step < 1}
        className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
          step >= 1
            ? "mt-3 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-3 px-0.5 pt-0.5 sm:grid-cols-[4fr_1fr]">
            <label className="block min-w-0">
              <span className="mb-1 block text-xs font-medium text-zinc-500">
                Título
              </span>
              <input
                id="compose-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  maybeShowSave(e.target.value);
                }}
                onBlur={() => maybeShowSave()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    maybeShowSave();
                  }
                }}
                placeholder="Resumo curto do chamado"
                className="h-10 w-full rounded-lg border border-[var(--cf-border)] bg-white px-3 text-sm shadow-sm outline-none transition focus:border-[var(--inatel)]"
                required={step >= 1}
              />
            </label>
            <label className="block min-w-0" htmlFor="compose-category">
              <span className="mb-1 block text-xs font-medium text-zinc-500">
                Categoria
              </span>
              <Select
                id="compose-category"
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
          </div>
        </div>
      </div>

      <div
        inert={step < 2}
        className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
          step >= 2
            ? "mt-3 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <Button
            type="submit"
            disabled={
              pending || step < 2 || !title.trim() || !description.trim()
            }
            className="w-full"
          >
            {pending ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-center text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}
