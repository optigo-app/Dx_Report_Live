import { useState, useCallback, useRef, useEffect } from "react";
import sendChatMessage from "@/API/LLMApi/optigoBotChat";

const readUserId = () => {
  if (typeof window === "undefined") return "anonymous";
  try {
    const raw = sessionStorage.getItem("reportVarible");
    if (!raw) return "anonymous";
    const data = JSON.parse(raw);
    return data?.LUId || "anonymous";
  } catch {
    return "anonymous";
  }
};

// Read the `pid` URL search param (e.g. ?pid=18351) used to identify the
// current report context. When present, source/citation blocks are hidden.
const readPid = () => {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("pid") || null;
  } catch {
    return null;
  }
};

export function useChatbot({ responseMode = "wide" } = {}) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [lastUserQuestion, setLastUserQuestion] = useState("");
  const sessionIdRef = useRef(null);
  const idCounterRef = useRef(0);
  const abortRef = useRef(null);
  const userIdRef = useRef(readUserId());
  const pidRef = useRef(readPid());

  const nextId = () => ++idCounterRef.current;

  const resetChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    sessionIdRef.current = null;
    setSessionId(null);
    setMessages([]);
    setIsLoading(false);
    setLastUserQuestion("");
  }, []);

  // Abort the in-flight request without clearing the conversation.
  const cancelRequest = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (question, options = {}) => {
      const trimmed = (question || "").trim();
      if (!trimmed || isLoading) return;

      setLastUserQuestion(trimmed);
      const userMsg = {
        id: nextId(),
        role: "user",
        blocks: [{ type: "text", content: trimmed }],
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await sendChatMessage(
          {
            question: trimmed,
            user_id: userIdRef.current,
            session_id: sessionIdRef.current || undefined,
            response_mode: responseMode,
            pid: pidRef.current || undefined,
            // When regenerating a response, tell the backend to skip any
            // cached answer and generate a fresh one.
            regenerate: options.regenerate === true,
          },
          ctrl.signal
        );

        const newSessionId = res?.session_id || res?.metadata?.session_id;
        if (newSessionId) {
          sessionIdRef.current = newSessionId;
          setSessionId(newSessionId);
        }

        // `answer` can be a string or a structured object
        // { title, value, subtext } — flatten it for fallback/copy.
        const answerText =
          typeof res?.answer === "string"
            ? res.answer
            : res?.answer && typeof res.answer === "object"
              ? [res.answer.title, res.answer.value, res.answer.subtext]
                  .filter(Boolean)
                  .join("\n")
              : null;

        // Build blocks: use res.blocks if present, else fall back to answer.
        let botBlocks =
          (Array.isArray(res?.blocks) && res.blocks.length
            ? res.blocks
            : res?.error
              ? [{ type: "error", content: res.error }]
              : [{ type: "text", content: answerText || "No response received." }]);

        // When pid is present (report context is known), drop "Sources:" text
        // blocks and `sources` blocks — the source is already implied.
        if (pidRef.current && Array.isArray(botBlocks)) {
          botBlocks = botBlocks.filter(
            (b) =>
              b?.type !== "sources" &&
              !(b?.type === "text" &&
                /^sources?\s*:/i.test(String(b.content || "").trim()))
          );
        }

        // Drop heading blocks that duplicate the latest user question — the
        // header already shows it.
        if (Array.isArray(botBlocks) && botBlocks.length) {
          const latestQ = trimmed.toLowerCase().trim();
          botBlocks = botBlocks.filter(
            (b) =>
              !(b?.type === "heading" &&
                String(b.content || "").toLowerCase().trim() === latestQ)
          );
        }

        // Surface a download link as a dedicated block when the API returns one.
        const downloadUrl = res?.download_url || res?.actions?.download_url;
        if (downloadUrl) {
          botBlocks = [...botBlocks, { type: "download", url: downloadUrl }];
        }

        // Follow-up suggestions live under actions.suggestions in the new shape.
        const suggestions = res?.actions?.suggestions;
        if (Array.isArray(suggestions) && suggestions.length) {
          botBlocks = [...botBlocks, { type: "suggestions", items: suggestions }];
        }

        // Collapse consecutive identical blocks — guards against the backend
        // emitting the same card (e.g. a report summary metric) twice in a row.
        if (Array.isArray(botBlocks) && botBlocks.length) {
          botBlocks = botBlocks.filter((b, i) => {
            if (i === 0) return true;
            const prev = botBlocks[i - 1];
            return !(
              b?.type === prev?.type &&
              JSON.stringify(b) === JSON.stringify(prev)
            );
          });
        }

        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            blocks: botBlocks,
            raw: {
              ...res,
              _originalQuestion: trimmed,
              // report_key moved under report.key; answer is now an object —
              // keep flattened copies for copy/feedback actions.
              report_key: res?.report_key || res?.report?.key,
              answer_text: answerText,
            },
          },
        ]);
      } catch (err) {
        if (err?.name === "AbortError") {
          // Cancelled mid-request — drop the dangling user bubble; the
          // question is handed back via lastUserQuestion for a quick resend.
          setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            blocks: [
              {
                type: "error",
                content: "The assistant is temporarily unavailable. Please try again.",
              },
            ],
          },
        ]);
      } finally {
        if (abortRef.current === ctrl) abortRef.current = null;
        setIsLoading(false);
      }
    },
    [isLoading, responseMode]
  );

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { messages, isLoading, sendMessage, resetChat, cancelRequest, sessionId, lastUserQuestion };
};

export default useChatbot;
