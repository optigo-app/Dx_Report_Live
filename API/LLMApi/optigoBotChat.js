import { postJson } from "./llmFetch";

const DEFAULT_COMPANY_CODE = "orail25";
const DEFAULT_RESPONSE_MODE = "wide";

const sendChatMessage = async (req, signal) => {
  const body = {
    question: req.question,
    pid: req.pid,
    company_code: req.company_code || DEFAULT_COMPANY_CODE,
    user_id: req.user_id,
    session_id: req.session_id,
    response_mode: req.response_mode || DEFAULT_RESPONSE_MODE,
    filters: req.filters,
    export: req.export,
    regenerate: req.regenerate === true,
  };

  return postJson("/v1/chat", body, { signal });
};

export default sendChatMessage;
