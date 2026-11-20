import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import { ActorProvider } from "@/lib/actor";
import { setActorId } from "@/services/api";

afterEach(() => {
  setActorId(null);
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("mostra login e lista após escolher ator", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo) => {
      const url = String(input);
      if (url.endsWith("/actors")) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            { id: "stu-ana", name: "Ana Silva", role: "student" },
            { id: "it-carla", name: "Carla Mendes", role: "it" },
          ],
        };
      }
      if (url.endsWith("/tickets")) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            {
              id: 1,
              title: "Wi-Fi",
              description: "Sem sinal",
              category: "rede",
              priority: "alta",
              status: "Aberto",
              owner_user_id: "stu-ana",
              created_at: "2026-01-01T00:00:00Z",
              updated_at: "2026-01-01T00:00:00Z",
              allowed_transitions: [],
              allowed_patch_fields: [],
            },
          ],
        };
      }
      throw new Error(`unexpected ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <ActorProvider>
          <App />
        </ActorProvider>
      </MemoryRouter>,
    );

    const login = await screen.findByTestId("login-stu-ana");
    await userEvent.click(login);
    await waitFor(() => {
      expect(screen.getByText("Wi-Fi")).toBeInTheDocument();
    });
    expect(screen.getByText("Como podemos ajudar?")).toBeInTheDocument();
    expect(screen.queryByLabelText(/prioridade/i)).not.toBeInTheDocument();
  });
});
