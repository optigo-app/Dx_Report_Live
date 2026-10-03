import { getJson } from "./llmFetch";

/**
 * Fetch report-aware suggested questions for the chat empty state.
 * GET /suggested-questions?pid=<pid>
 * Returns { report_key, report_name, questions: string[] } or null on failure.
 */
const fetchSuggestedQuestions = async (pid, signal) => {
  if (!pid) return null;
  try {
    return await getJson(
      `/suggested-questions?pid=${encodeURIComponent(pid)}`,
      { signal }
    );
  } catch {
    return null;
  }
};

export default fetchSuggestedQuestions;
