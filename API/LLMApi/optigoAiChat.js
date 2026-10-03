import { postJson } from "./llmFetch";

const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
        window.location.hostname === "nzen" || window.location.hostname === "dxreport.web");

const optigoAiChat = async (body) => {
    try {
        const APIURL = isLocal
            ? "http://apioptigoai.web/api/chat"
            : "https://apioptigoai.optigoapps.com/api/chat";

        // timeoutMs: 0 — this endpoint can legitimately run longer than the
        // default 30s used by the LLM endpoints.
        return await postJson(APIURL, body, { timeoutMs: 0 });
    } catch (error) {
        console.error("Error in optigoAiChat:", error);
        throw error;
    }
};

export default optigoAiChat;
