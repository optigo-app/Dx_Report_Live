import { postJson } from "./llmFetch";

const DEFAULT_COMPANY_CODE = "orail25";
const DEFAULT_RESPONSE_MODE = "wide";

// POST /v1/chat/action — resolves an interactive block click server-side
// against the pending state. Returns a normal ChatResponse.
const sendChatAction = async (req, signal) => {
  const body = {
    session_id: req.session_id,
    action: req.action,
    pid: req.pid,
    company_code: req.company_code || DEFAULT_COMPANY_CODE,
    user_id: req.user_id,
    yearcode: req.yearcode,
    response_mode: req.response_mode || DEFAULT_RESPONSE_MODE,
  };

  return postJson("/v1/chat/action", body, { signal });
};

export default sendChatAction;
