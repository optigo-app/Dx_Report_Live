import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  InputBase,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { PencilLine, Sparkles, X } from "lucide-react";
import "./AskOptigoAiDrawer.scss";
import optigoAiChat from "@/API/LLMApi/optigoAiChat";

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

const AskOptigoAiDrawer = ({ open, onClose }) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const scrollRef = useRef(null);

  const suggestions = getUrlWiseSuggestions(currentUrl);
  const lastUserQuestion = [...messages].reverse().find((msg) => msg.isUser)?.text;

  const handleNewChat = () => {
    setMessages([]);
    setInputValue("");
    setIsTyping(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, open]);

  useEffect(() => {
    if (open && typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, [open]);

  const handleSend = async (text) => {
    const nextMessage = (text ?? inputValue).trim();
    if (!nextMessage) return;

    const outgoingMessages = [
      ...messages.map((msg) => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: nextMessage },
    ];

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: nextMessage, isUser: true },
    ]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await optigoAiChat({
        messages: outgoingMessages,
      });
      // if (!response.ok) {
      //   throw new Error(`API failed with status ${response.status}`);
      // }
      const replyText = response?.reply || "I couldn't generate a response right now.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: replyText,
          isUser: false,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Unable to connect to Optigo AI right now. Please try again.",
          isUser: false,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer
      anchor="right"
      variant="persistent"
      open={open}
      onClose={onClose}
      className="ask-optigo-ai-drawer"
      ModalProps={{
        hideBackdrop: true,
        keepMounted: true,
      }}
      sx={{
        "& .MuiDrawer-paper": {
          width: 380,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f8f9ff",
          borderLeft: "1px solid #e0e0e0",
          boxShadow: "-4px 0 12px rgba(0,0,0,0.05)",
        },
      }}
    >
      <Box sx={{ px: 1.5, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            title={lastUserQuestion || ""}
            sx={{
              color: "#1f2937",
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitMaskImage: "linear-gradient(to right, black 78%, transparent 100%)",
              maskImage: "linear-gradient(to right, black 78%, transparent 100%)",
            }}
          >
            {lastUserQuestion || ""}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
          <IconButton onClick={onClose} size="small" sx={{ color: "#5f6368" }}>
            <X size={20} />
          </IconButton>
        </Box>
      </Box>

      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 3,
          py: 1,
          // backgroundColor: "#f8f9ff",
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 500, color: "var(--primary-btncolor-start)", mb: 1 }}>
              Hello
            </Typography>
            <Typography variant="h5" sx={{ color: "#202124", fontWeight: 400, mb: 4 }}>
              How can I help you today?
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {suggestions.map((question, i) => (
                <Button
                  key={i}
                  variant="contained"
                  onClick={() => handleSend(question)}
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                    backgroundColor: "#f1f3f4",
                    color: "#3c4043",
                    borderRadius: "16px",
                    padding: "10px 18px",
                    boxShadow: "none",
                    width: "fit-content",
                    "&:hover": {
                      backgroundColor: "#e8eaed",
                      boxShadow: "none",
                    },
                  }}
                >
                  {question}
                </Button>
              ))}
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent: msg.isUser ? "flex-end" : "flex-start",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: "10px 13px",
                    borderRadius: msg.isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    maxWidth: "82%",
                    fontSize: "0.9rem",
                    lineHeight: 1.4,
                    background: msg.isUser ? "var(--primary-btncolor)" : "#ffffff",
                    color: msg.isUser ? "#ffffff" : "#202124",
                    border: msg.isUser ? "none" : "1px solid #eceff5",
                    boxShadow: msg.isUser
                      ? "0 3px 10px rgba(100, 0, 184, 0.18)"
                      : "0 1px 3px rgba(15, 23, 42, 0.06)",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </Paper>
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", py: 0.5 }}>
                <Box sx={{ position: "relative", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CircularProgress
                    size={34}
                    thickness={4.5}
                    sx={{ color: "var(--primary-btncolor-start)", position: "absolute", top: 0, left: 0 }}
                  />
                  <Box
                    component="img"
                    src="./icons/ai-icon.svg"
                    alt="Optigo AI"
                    sx={{ width: 22, height: 22, borderRadius: "50%" }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: "12px 16px",
            display: "flex",
            flexDirection: "column",
            minHeight: 100,
            border: "1px solid #dadce0",
            borderRadius: "12px",
            transition: "border-color 0.2s",
            "&:focus-within": {
              borderColor: "var(--primary-btncolor-start)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
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
            sx={{
              fontSize: "15px",
              flex: 1,
              alignItems: "flex-start",
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Tooltip title="Send message">
              <IconButton
                onClick={() => handleSend()}
                size="small"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: inputValue.trim() ? "var(--primary-btncolor)" : "#edf0f5",
                  transition: "all 0.2s ease",
                  "&:hover": { background: inputValue.trim() ? "var(--primary-btncolor)" : "#e8eaed" },
                }}
              >
                <Box
                  component="img"
                  src="./icons/ai-icon.svg"
                  alt="Send to Optigo AI"
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    opacity: inputValue.trim() ? 1 : 0.6,
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      </Box>
    </Drawer>
  );
};

export default AskOptigoAiDrawer;
