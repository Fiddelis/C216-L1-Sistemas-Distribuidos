import { ChartColumn, Inbox, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { UserAvatar } from "@/components/UserAvatar";
import { useActor } from "@/lib/actor";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition duration-200",
    isActive
      ? "bg-white font-medium text-zinc-900 shadow-sm ring-1 ring-black/5"
      : "text-zinc-600 hover:bg-white/70 hover:text-zinc-900",
  ].join(" ");

function headerTitle(pathname: string, role: "student" | "it") {
  if (pathname.startsWith("/tickets/")) return "Ticket";
  if (pathname.startsWith("/metrics")) return "Métricas";
  return role === "it" ? "Fila da TI" : "Meus chamados";
}

export function AppShell({ children }: { children: ReactNode }) {
  const { actor, setActor } = useActor();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!actor) return null;

  return (
    <div className="flex min-h-screen bg-[var(--cf-bg)] text-[var(--cf-text)]">
      <aside className="flex w-60 shrink-0 flex-col border-r border-[var(--cf-border)] bg-[#f3f4f6]">
        <div className="border-b border-[var(--cf-border)] px-4 py-4">
          <BrandMark />
          <p className="mt-3 text-sm font-medium text-zinc-800">Helpdesk</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          <p className="px-3 pt-1 pb-1 text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
            Principal
          </p>
          <NavLink to="/" end className={linkClass}>
            <Inbox className="h-4 w-4" aria-hidden />
            Tickets
          </NavLink>
          {actor.role === "it" && (
            <NavLink to="/metrics" className={linkClass}>
              <ChartColumn className="h-4 w-4" aria-hidden />
              Métricas
            </NavLink>
          )}
        </nav>

        <div className="border-t border-[var(--cf-border)] p-3">
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-zinc-600 transition duration-200 hover:bg-white/70 hover:text-zinc-900"
            onClick={() => {
              setActor(null);
              navigate("/");
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Trocar usuário
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[var(--cf-border)] bg-white px-6">
          <p className="text-sm font-medium text-zinc-800">
            {headerTitle(pathname, actor.role)}
          </p>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm leading-tight">
              <p className="font-medium text-zinc-800">{actor.name}</p>
              <p className="text-xs text-[var(--cf-muted)]">
                {actor.role === "it" ? "TI" : "Aluno"}
              </p>
            </div>
            <UserAvatar />
          </div>
        </header>
        <main className="flex-1 overflow-auto px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
