// Local/dev hostnames hit the local LLM server; everything else uses production.
const isLocal =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(
    window.location.hostname
  );

export const LLM_API_BASE = isLocal
  ? "http://localhost:8001"
  : "http://optigollm.web";

const DEFAULT_TIMEOUT_MS = 30000;

// Combine the caller's abort signal with a timeout controller.
const combineSignal = (signal, timeoutMs) => {
  const timeoutCtrl = new AbortController();
  const timeoutId =
    timeoutMs > 0 ? setTimeout(() => timeoutCtrl.abort(), timeoutMs) : null;

  let combinedSignal = timeoutCtrl.signal;
  if (signal) {
    if (signal.aborted) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutCtrl.abort();
    } else {
      signal.addEventListener("abort", () => timeoutCtrl.abort(), { once: true });
      combinedSignal = signal;
    }
  }
  return { combinedSignal, timeoutId };
};

const requestJson = async (path, { method, body, signal, timeoutMs }) => {
  const url = /^https?:\/\//i.test(path) ? path : `${LLM_API_BASE}${path}`;
  const { combinedSignal, timeoutId } = combineSignal(signal, timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body != null ? { body: JSON.stringify(body) } : {}),
      signal: combinedSignal,
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    return await res.json();
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

/**
 * POST a JSON body to an endpoint and return the parsed response.
 * @param {string} path - Absolute URL, or a path appended to LLM_API_BASE.
 * @param {Object} body - Request body (JSON-serialized).
 * @param {Object} [opts]
 * @param {AbortSignal} [opts.signal] - External abort signal (e.g. Stop button).
 * @param {number} [opts.timeoutMs] - Timeout in ms (default 30s). Pass 0 to disable.
 */
export const postJson = (path, body, { signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) =>
  requestJson(path, { method: "POST", body, signal, timeoutMs });

/**
 * GET an endpoint and return the parsed response. Same opts as postJson.
 */
export const getJson = (path, { signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) =>
  requestJson(path, { method: "GET", signal, timeoutMs });

export default postJson;
