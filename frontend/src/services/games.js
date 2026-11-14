import { request } from "./api.js";

function queryString(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function listGames({ genero, limite = 100 } = {}) {
  return request(`/games${queryString({ genero, limite })}`);
}

export function getGame(id) {
  return request(`/games/${id}`);
}

export function createGame(data) {
  return request("/games", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function replaceGame(id, data) {
  return request(`/games/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function updateGame(id, data) {
  return request(`/games/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteGame(id) {
  return request(`/games/${id}`, { method: "DELETE" });
}
