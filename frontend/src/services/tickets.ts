import { request } from "./api";

export type Status =
  | "Aberto"
  | "Em andamento"
  | "Aguardando aluno"
  | "Resolvido"
  | "Fechado";

export type Category = "rede" | "software" | "hardware" | "conta";
export type Priority = "baixa" | "media" | "alta";

export type Actor = {
  id: string;
  name: string;
  role: "student" | "it";
};

export type TicketMessage = {
  id: number;
  author_user_id: string;
  author_name: string;
  author_role: "student" | "it";
  body: string;
  created_at: string;
};

export type TicketEvent = {
  id: number;
  actor_user_id: string;
  actor_name: string;
  actor_role: "student" | "it";
  from_status: Status | null;
  to_status: Status;
  created_at: string;
};

export type Ticket = {
  id: number;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
  allowed_transitions: Status[];
  allowed_patch_fields: string[];
  messages?: TicketMessage[];
  unread_message?: TicketMessage | null;
  events?: TicketEvent[];
};

export type TicketCreate = {
  title: string;
  description: string;
  category: Category;
};

export type TicketPatch = Partial<{
  title: string;
  description: string;
  category: Category;
  priority: Priority;
}>;

export async function listActors() {
  return request<Actor[]>("/actors", {}, false);
}

export async function listTickets() {
  return request<Ticket[]>("/tickets");
}

export async function getTicket(id: number) {
  return request<Ticket>(`/tickets/${id}`);
}

export async function createTicket(payload: TicketCreate) {
  return request<Ticket>("/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function patchTicket(id: number, payload: TicketPatch) {
  return request<Ticket>(`/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function transitionTicket(id: number, to_status: Status) {
  return request<Ticket>(`/tickets/${id}/transitions`, {
    method: "POST",
    body: JSON.stringify({ to_status }),
  });
}

export async function deleteTicket(id: number) {
  return request<void>(`/tickets/${id}`, { method: "DELETE" });
}

export async function postMessage(id: number, body: string) {
  return request<Ticket>(`/tickets/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}
