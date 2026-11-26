import type { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { UnreadNotices } from "@/components/UnreadNotices";
import { useActor } from "@/lib/actor";

function navClass(active: boolean) {
  return [
    "inline-flex items-center px-3 py-2 text-[11px] font-medium tracking-[0.18em] uppercase transition duration-200",
    active
      ? "bg-zinc-950 !text-white"
      : "text-zinc-400 hover:text-zinc-950",
  ].join(" ");
}

export function AppShell({ children }: { children: ReactNode }) {
  const { actor, setActor } = useActor();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onTickets = pathname === "/" || pathname.startsWith("/tickets");

  if (!actor) return null;

  return (
    <div className="h-screen bg-[var(--cf-bg)] p-3 text-[var(--cf-text)] sm:p-4">
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
        <header className="flex h-16 shrink-0 items-center gap-8 border-b border-[var(--cf-border)] px-6 sm:px-8">
          <BrandMark className="h-6" />

          <nav className="flex items-center gap-2">
            <NavLink to="/" end className={navClass(onTickets)}>
              Tickets
            </NavLink>
            {actor.role === "it" && (
              <NavLink
                to="/metrics"
                className={({ isActive }) => navClass(isActive)}
              >
                Métricas
              </NavLink>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <p className="hidden text-right text-sm leading-tight sm:block">
              <span className="block font-medium">{actor.name}</span>
              <span className="text-[11px] tracking-[0.14em] text-zinc-400 uppercase">
                {actor.role === "it" ? "TI" : "Aluno"}
              </span>
            </p>
            <button
              type="button"
              className="cursor-pointer bg-zinc-950 px-4 py-2 text-[11px] font-medium tracking-[0.14em] text-white uppercase transition hover:bg-zinc-800"
              onClick={() => {
                setActor(null);
                navigate("/");
              }}
            >
              Trocar usuário
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
        <UnreadNotices />
      </div>
    </div>
  );
}
