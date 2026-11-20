const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  code?: string;
  detail?: string;

  constructor(status: number, payload: { detail?: string; code?: string }) {
    super(payload.detail ?? `HTTP ${status}`);
    this.status = status;
    this.code = payload.code;
    this.detail = payload.detail;
  }
}

let actorId: string | null = null;

export function setActorId(id: string | null) {
  actorId = id;
}

export function getActorId() {
  return actorId;
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  requireActor = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (requireActor) {
    if (!actorId) {
      throw new ApiError(401, {
        detail: "Selecione um ator",
        code: "unauthorized_actor",
      });
    }
    headers.set("X-Actor-Id", actorId);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, payload);
  }
  return payload as T;
}
