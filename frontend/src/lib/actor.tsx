import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { setActorId } from "@/services/api";
import { type Actor, listActors } from "@/services/tickets";

type ActorContextValue = {
  actors: Actor[];
  actor: Actor | null;
  setActor: (actor: Actor | null) => void;
  loading: boolean;
  error: string | null;
};

const ActorContext = createContext<ActorContextValue | null>(null);
const STORAGE_KEY = "helpdesk-actor-id";

export function ActorProvider({ children }: { children: ReactNode }) {
  const [actors, setActors] = useState<Actor[]>([]);
  const [actor, setActorState] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listActors()
      .then((rows) => {
        if (!alive) return;
        setActors(rows);
        const saved = sessionStorage.getItem(STORAGE_KEY);
        const selected = rows.find((row) => row.id === saved) ?? null;
        setActorState(selected);
        setActorId(selected?.id ?? null);
      })
      .catch((err: Error) => {
        if (!alive) return;
        setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const setActor = useCallback((next: Actor | null) => {
    setActorState(next);
    setActorId(next?.id ?? null);
    if (next) sessionStorage.setItem(STORAGE_KEY, next.id);
    else sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ actors, actor, setActor, loading, error }),
    [actors, actor, setActor, loading, error],
  );

  return (
    <ActorContext.Provider value={value}>{children}</ActorContext.Provider>
  );
}

export function useActor() {
  const ctx = useContext(ActorContext);
  if (!ctx) throw new Error("useActor precisa de ActorProvider");
  return ctx;
}
