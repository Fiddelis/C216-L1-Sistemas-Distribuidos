import type { Category, Priority, Status } from "@/services/tickets";

export const categoryLabel: Record<Category, string> = {
  rede: "Rede",
  software: "Software",
  hardware: "Hardware",
  conta: "Conta",
};

export const priorityLabel: Record<Priority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const statusTone: Record<Status, string> = {
  Aberto: "bg-sky-100 text-sky-900",
  "Em andamento": "bg-amber-100 text-amber-950",
  "Aguardando aluno": "bg-violet-100 text-violet-950",
  Resolvido: "bg-emerald-100 text-emerald-950",
  Fechado: "bg-zinc-200 text-zinc-700",
};
