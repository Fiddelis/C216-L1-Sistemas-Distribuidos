import { afterEach, describe, expect, it, vi } from "vitest";
import { type ApiError, request, setActorId } from "@/services/api";

afterEach(() => {
  setActorId(null);
  vi.unstubAllGlobals();
});

describe("request", () => {
  it("anexa X-Actor-Id", async () => {
    setActorId("stu-ana");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await request("/tickets");
    expect(fetchMock).toHaveBeenCalledOnce();
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get("X-Actor-Id")).toBe("stu-ana");
  });

  it("lança ApiError com code", async () => {
    setActorId("stu-ana");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({
          detail: "Invalid status transition",
          code: "invalid_transition",
        }),
      }),
    );

    await expect(
      request("/tickets/1/transitions", { method: "POST" }),
    ).rejects.toMatchObject({
      status: 409,
      code: "invalid_transition",
    } satisfies Partial<ApiError>);
  });
});
