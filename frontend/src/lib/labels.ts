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

export const statusBar: Record<Status, string> = {
  Aberto: "bg-sky-500",
  "Em andamento": "bg-amber-500",
  "Aguardando aluno": "bg-violet-500",
  Resolvido: "bg-emerald-500",
  Fechado: "bg-zinc-500",
};

export const statusAction: Record<Status, string> = {
  Aberto: "border-transparent bg-sky-500 text-white hover:bg-sky-600",
  "Em andamento":
    "border-transparent bg-amber-400 text-zinc-950 hover:bg-amber-300",
  "Aguardando aluno":
    "border-transparent bg-violet-600 text-white hover:bg-violet-700",
  Resolvido:
    "border-transparent bg-emerald-600 text-white hover:bg-emerald-700",
  Fechado: "border-transparent bg-zinc-700 text-white hover:bg-zinc-800",
};
