import { ChevronRight } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { UserAvatar } from "@/components/UserAvatar";
import { useActor } from "@/lib/actor";

export function LoginScreen() {
  const { actors, setActor, loading, error } = useActor();

  return (
    <div className="h-screen bg-[var(--cf-bg)] p-3 sm:p-4">
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
        <header className="flex h-16 shrink-0 items-center border-b border-[var(--cf-border)] px-6 sm:px-8">
          <BrandMark className="h-6" />
        </header>

        <div className="min-h-0 flex-1 overflow-auto">
          <div className="border-b border-[var(--cf-border)] px-6 py-10 sm:px-8">
            <p className="font-display text-5xl leading-none font-medium tracking-tight text-zinc-950 sm:text-6xl">
              Helpdesk
            </p>
            <p className="mt-4 max-w-md text-base text-[var(--cf-muted)]">
              Selecione quem está usando o sistema.
            </p>
          </div>

          {loading && (
            <p className="px-6 py-6 text-sm text-[var(--cf-muted)] sm:px-8">
              Carregando…
            </p>
          )}
          {error && (
            <p className="px-6 py-6 text-sm text-red-600 sm:px-8">{error}</p>
          )}

          <ul className="divide-y divide-[var(--cf-border)]">
            {actors.map((row, index) => (
              <li
                key={row.id}
                className={`animate-fade-up stagger-${index + 1}`}
              >
                <button
                  type="button"
                  data-testid={`login-${row.id}`}
                  onClick={() => setActor(row)}
                  className="group flex w-full cursor-pointer items-center gap-4 px-6 py-4 text-left transition duration-200 hover:bg-zinc-50 sm:px-8"
                >
                  <UserAvatar className="h-11 w-11" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{row.name}</span>
                    <span className="block text-xs text-[var(--cf-muted)]">
                      {row.role === "it" ? "Tecnologia da Informação" : "Aluno"}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-400 transition group-hover:text-zinc-950" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
