import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  PencilLine,
  X,
  ArrowUp,
  Square,
  ChevronDown,
  Plus,
} from "lucide-react";
import ChatMessage from "./ChatMessage";
import { useChatbot } from "./useChatbot";
import fetchSuggestedQuestions from "@/API/LLMApi/optigoSuggestedQuestions";

const PREMADE_QUESTIONS_MASTER = [
  {
    matchers: ["/mainreport", "pid="],
    suggestions: [
      "Total sales",
      "Show top 5 insights",
      "Summarize this report",
      "What changed from last period?",
    ],
  },
  {
    matchers: ["/home.do", "/home1.do"],
    suggestions: [
      "What should I focus on today?",
      "Show key performance summary",
      "List biggest opportunities",
    ],
  },
];

const DEFAULT_SUGGESTIONS = [
  "Show top 5 insights",
  "Summarize this report",
  "What changed from last period?",
];

const getUrlWiseSuggestions = (url) => {
  const normalizedUrl = (url || "").toLowerCase();
  const matchedRule = PREMADE_QUESTIONS_MASTER.find((rule) =>
    rule.matchers.some((matcher) => normalizedUrl.includes(matcher))
  );
  return matchedRule?.suggestions ?? DEFAULT_SUGGESTIONS;
};

export default function ChatWindow({ onClose }) {
  const {
    messages,
    isLoading,
    sendMessage,
    resetChat,
    cancelRequest,
    sessionId,
    lastUserQuestion,
  } = useChatbot({ responseMode: "wide" });
  const [inputValue, setInputValue] = useState("");
  const [showScrollPill, setShowScrollPill] = useState(false);
  const [currentUrl] = useState(() =>
    typeof window !== "undefined" ? window.location.href : ""
  );
  const [apiQuestions, setApiQuestions] = useState(null);
  const [userName] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const raw = sessionStorage.getItem("reportVarible");
      const data = raw ? JSON.parse(raw) : null;
      return (
        data?.UserName ||
        data?.user_name ||
        data?.username ||
        data?.Name ||
        data?.FirstName ||
        ""
      );
    } catch {
      return "";
    }
  });
  const scrollRef = useRef(null);

  // Report-aware suggested questions from the API; URL-based list is the fallback.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const pid = new URLSearchParams(window.location.search).get("pid");
    if (!pid) return;
    const ctrl = new AbortController();
    fetchSuggestedQuestions(pid, ctrl.signal).then((res) => {
      if (res?.questions?.length) setApiQuestions(res.questions);
    });
    return () => ctrl.abort();
  }, []);

  const suggestions = apiQuestions?.length
    ? apiQuestions
    : getUrlWiseSuggestions(currentUrl);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      setShowScrollPill(false);
    }
  }, [messages, isLoading]);

  // Show a "scroll to bottom" pill when the user has scrolled up.
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollPill(distanceFromBottom > 80);
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      setShowScrollPill(false);
    }
  };

  const handleSend = (text) => {
    const next = (text ?? inputValue).trim();
    if (!next || isLoading) return;
    setInputValue("");
    sendMessage(next);
  };

  const handleRegenerate = (question) => {
    if (!isLoading) sendMessage(question, { regenerate: true });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    resetChat();
    setInputValue("");
  };

  // Stop mid-request: the dangling question is removed from the chat and
  // restored into the input so it can be resent with one click.
  const handleCancel = () => {
    cancelRequest();
    setInputValue((prev) => (prev ? prev : lastUserQuestion));
  };

  // Latest user question to display in the header row.
  const latestUserQuestion = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        const textBlock = messages[i].blocks?.find((b) => b?.type === "text");
        return textBlock?.content || "";
      }
    }
    return "";
  }, [messages]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          px: 1.5,
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
          flexShrink: 0,
          backgroundColor: "grey.50",
          borderBottom: "1px solid", borderBottomColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
            {latestUserQuestion ? (
              <Tooltip title={latestUserQuestion}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--primary-btncolor-start)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {latestUserQuestion}
                </Typography>
              </Tooltip>
            ) : (
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#6400b8",
                }}
              >
                Optigo AI
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
          <Tooltip title="New chat">
            <IconButton
              onClick={handleNewChat}
              size="small"
              sx={{
                color: "var(--primary-btncolor-start)",
                backgroundColor: "#efe8ff",
                border: "1px solid #dfd1ff",
                "&:hover": { backgroundColor: "#e7dbff" },
              }}
            >
              <PencilLine size={16} />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
            <X size={20} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          className="optigobot-scroll"
          sx={{ flex: 1, overflowY: "auto", px: 2, pt: 1.5, pb: 1 }}
        >
          {messages.length === 0 ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-end",
                textAlign: "left",
                px: 1,
                pb: 1,
                // Shared entrance keyframe — children stagger via animationDelay.
                "@keyframes fadeUp": {
                  from: { opacity: 0, transform: "translateY(10px)" },
                  to: { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 25,
                  fontWeight: 500,
                  color: "#6400b8",
                  animation: "fadeUp 0.45s ease both",
                }}
              >
                Hello{userName ? `, ${userName}` : ""}
              </Typography>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 500,
                  color: "text.primary",
                  mb: 0.5,
                  animation: "fadeUp 0.45s ease 0.08s both",
                }}
              >
                How can I help you today?
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  mb: 3,
                  animation: "fadeUp 0.45s ease 0.16s both",
                }}
              >
                Ask about sales, performance, trends, or this report.
              </Typography>

              {/* One suggestion pill per row — sized to its content */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 1,
                  width: "100%",
                }}
              >
                {suggestions.slice(0, 3).map((question, i) => (
                  <Box
                    key={i}
                    onClick={() => handleSend(question)}
                    sx={{
                      px: 2,
                      py: 1.25,
                      borderRadius: "999px",
                      backgroundColor: "#f5f3ff",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "text.primary",
                      width: "fit-content",
                      maxWidth: "100%",
                      transition: "all 0.2s ease",
                      animation: `fadeUp 0.4s ease ${0.24 + i * 0.07}s both`,
                      "&:hover": {
                        backgroundColor: "#ede8ff",
                        transform: "translateY(-1px)",
                      },
                      "&:active": {
                        transform: "translateY(0) scale(0.98)",
                      },
                    }}
                  >
                    {question}
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, py: 1 }}>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  blocks={msg.blocks}
                  isLoading={false}
                  onSuggestionClick={handleSend}
                  raw={msg.raw}
                  sessionId={sessionId}
                  onRegenerate={handleRegenerate}
                />
              ))}
              {isLoading && (
                <ChatMessage role="assistant" blocks={[]} isLoading />
              )}
            </Box>
          )}
        </Box>

        {showScrollPill && (
          <Box
            onClick={scrollToBottom}
            sx={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: "16px",
              backgroundColor: "grey.900",
              color: "common.white",
              fontSize: 11.5,
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
              zIndex: 5,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "grey.800",
                transform: "translateX(-50%) translateY(-2px)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.24)",
              },
            }}
          >
            <ChevronDown size={13} />
            Latest
          </Box>
        )}
      </Box>

      <Box sx={{ px: 2, pb: 2, pt: 1, flexShrink: 0, backgroundColor: "grey.50" }}>
        <Paper
          elevation={0}
          sx={{
            p: "12px 16px",
            display: "flex",
            flexDirection: "column",
            minHeight: 100,
            border: "1px solid", borderColor: "divider",
            borderRadius: "16px",
            backgroundColor: "common.white",
            transition: "border-color 0.2s",
            "&:focus-within": {
              borderColor: "#c4b5fd",
            },
          }}
        >
          <InputBase
            placeholder="Ask Optigo AI"
            fullWidth
            multiline
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            sx={{ fontSize: 15, flex: 1, alignItems: "flex-start" }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 0.75, mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {false && (
                <Tooltip title="Attach file">
                  <IconButton
                    size="small"
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      color: "text.secondary",
                      border: "1px solid", borderColor: "divider",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        color: "var(--primary-btncolor-start)",
                        borderColor: "var(--primary-btncolor-start)",
                        backgroundColor: "#f5f3ff",
                      },
                    }}
                  >
                    <Plus size={15} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {isLoading ? (
              <Tooltip title="Stop generating">
                <IconButton
                  onClick={handleCancel}
                  size="small"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "grey.900",
                    color: "common.white",
                    transition: "all 0.2s ease",
                    "&:hover": { backgroundColor: "grey.800" },
                  }}
                >
                  <Square size={14} fill="currentColor" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Send message">
                <span>
                  <IconButton
                    onClick={() => handleSend()}
                    size="small"
                    disabled={!inputValue.trim()}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: inputValue.trim()
                        ? "#6400b8"
                        : "grey.100",
                      backgroundImage: inputValue.trim()
                        ? "linear-gradient(to right, #6400b8, #8d0096)"
                        : "none",
                      color: inputValue.trim() ? "common.white" : "text.disabled",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: inputValue.trim()
                          ? "#6400b8"
                          : "grey.200",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "grey.100",
                        backgroundImage: "none",
                        color: "text.disabled",
                      },
                    }}
                  >
                    <ArrowUp size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>
        </Paper>
        <Typography
          sx={{
            fontSize: 10.5,
            color: "text.disabled",
            fontStyle: "italic",
            lineHeight: 1.3,
            textAlign: "center",
            mt: 1,
          }}
        >
          Optigo AI can make mistakes. Please verify important information.
        </Typography>
      </Box>
    </Box>
  );
}
