import { API_BASE } from "../config";

const BASE_URL = `${API_BASE}/api/events`;

// Small helper to survive Render cold starts (server sleeping).
// - Retries a few times with backoff
// - Uses AbortController timeout so UI doesn't hang forever
async function fetchJsonWithRetry(url, { retries = 3, timeoutMs = 15000, onAttempt } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      onAttempt?.(attempt);

      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(t);

      if (!res.ok) {
        // treat 5xx as retryable, 4xx as final
        if (res.status >= 500 && attempt < retries) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw new Error(`Request failed (${res.status})`);
      }

      return await res.json();
    } catch (e) {
      lastErr = e;
      // Retry on network errors / timeouts
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }
    }
  }
  const err = new Error("Failed to fetch (server may be waking up)");
  err.cause = lastErr;
  throw err;
}

export const getEvents = async (opts) => {
  return fetchJsonWithRetry(BASE_URL, opts);
};

export const getEventById = async (id, opts) => {
  return fetchJsonWithRetry(`${BASE_URL}/${id}`, opts);
};

// Create a new event (not used by admin form since it uses multipart)
export const createEvent = async (event) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });

  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
};
