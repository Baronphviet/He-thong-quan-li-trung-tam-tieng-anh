const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function apiGet(path) {
  return apiFetch(path);
}

export function apiPost(path, body) {
  return apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function apiPut(path, body) {
  return apiFetch(path, {
    method: "PUT",
    body: JSON.stringify(body)
  });
}

export function apiDelete(path) {
  return apiFetch(path, {
    method: "DELETE"
  });
}
