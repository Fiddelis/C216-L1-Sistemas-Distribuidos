import { ChevronRight } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { UserAvatar } from "@/components/UserAvatar";
import { useActor } from "@/lib/actor";

export function LoginScreen() {
  const { actors, setActor, loading, error } = useActor();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cf-bg)] px-4">
      <div className="animate-fade-up w-full max-w-md rounded-2xl border border-[var(--cf-border)] bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandMark className="h-8" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Helpdesk</h1>
            <p className="mt-1 text-sm text-[var(--cf-muted)]">
              Selecione quem está usando o sistema
            </p>
          </div>
        </div>

        {loading && (
          <p className="text-center text-sm text-[var(--cf-muted)]">
            Carregando…
          </p>
        )}
        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <ul className="space-y-3">
          {actors.map((row, index) => (
            <li key={row.id} className={`animate-fade-up stagger-${index + 1}`}>
              <button
                type="button"
                data-testid={`login-${row.id}`}
                onClick={() => setActor(row)}
                className="group flex w-full items-center gap-3 rounded-xl border border-[var(--cf-border)] bg-white px-4 py-3 text-left transition duration-300 hover:border-[var(--inatel)] hover:shadow-md"
              >
                <UserAvatar className="h-11 w-11" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{row.name}</span>
                  <span className="block text-xs text-[var(--cf-muted)]">
                    {row.role === "it" ? "Tecnologia da Informação" : "Aluno"}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-zinc-400 transition group-hover:text-[var(--inatel)]" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
