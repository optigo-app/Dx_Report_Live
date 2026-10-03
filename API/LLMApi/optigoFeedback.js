import { postJson } from "./llmFetch";

/**
 * Submit feedback (thumbs up/down) for a chat answer.
 * @param {Object} params
 * @param {string} params.session_id - Conversation session ID
 * @param {string} params.question - The original user question
 * @param {string} [params.answer] - The answer being rated
 * @param {string} [params.report_key] - e.g. 'sales_report'
 * @param {string} [params.metric] - e.g. 'Amount'
 * @param {string} params.rating - 'up' or 'down'
 * @param {string} [params.comment] - User's explanation (for down votes)
 * @param {string} [params.company_code] - e.g. 'DEMO'
 * @param {string} [params.user_id] - e.g. 'u123'
 */
const submitFeedback = async (params) => {
  const body = {
    session_id: params.session_id,
    question: params.question,
    answer: params.answer || "",
    report_key: params.report_key || "",
    metric: params.metric || "",
    rating: params.rating,
    comment: params.rating === "down" ? params.comment || "" : "",
    company_code: params.company_code || "",
    user_id: params.user_id || "",
  };

  try {
    return await postJson("/v1/feedback", body);
  } catch {
    return { status: "error", message: "Failed to submit feedback" };
  }
};

export default submitFeedback;
