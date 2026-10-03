import { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import ChatBlockRenderer from "./ChatBlockRenderer";
import MessageActions from "./MessageActions";

// Small AI avatar shown to the left of every bot response.
// ai-icon.svg is a square image with its own purple gradient — clip it to a
// circle instead of wrapping it in another gradient background.
function AiAvatar({ loading = false }) {
  return (
    <Box
      sx={{
        position: "relative",
        width: 36,
        height: 36,
        flexShrink: 0,
      }}
    >
      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: "var(--primary-btncolor-start)",
            borderRightColor: "var(--primary-btncolor-start)",
            animation: "optigobot-spin 0.8s linear infinite",
          }}
        />
      )}
      <Box
        component="img"
        src="./icons/ai-icon.png"
        alt="Optigo AI"
        sx={{
          width: 36,
          height: 36,
          display: "block",
        }}
      />
      {loading && (
        <style>{`
          @keyframes optigobot-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      )}
    </Box>
  );
}

// Jewelry-industry themed loading phrases — rotate while waiting for a response.
const LOADING_PHRASES = [
  "Analyzing sales data",
  "Polishing insights",
  "Counting carats",
  "Checking inventory",
  "Reading the report",
  "Weighing the numbers",
  "Inspecting the details",
  "Cutting through the data",
];

function TypingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(() =>
    Math.floor(Math.random() * LOADING_PHRASES.length)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % LOADING_PHRASES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <Box sx={{ display: "flex", alignItems: "center", py: 0.5 }}>
      <Typography
        key={phraseIndex}
        sx={{
          fontSize: 12.5,
          color: "text.secondary",
          fontStyle: "italic",
          animation: "optigobot-phrase 0.3s ease-out",
        }}
      >
        {LOADING_PHRASES[phraseIndex]}…
      </Typography>
      <style>{`
        @keyframes optigobot-phrase {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}

export default function ChatMessage({
  role,
  blocks,
  isLoading,
  onSuggestionClick,
  raw,
  sessionId,
  onRegenerate,
}) {
  const isBot = role === "assistant";
  const showActions = isBot && !isLoading && raw && !raw.error;

  // --- Bot message: avatar on its own row, content below ---
  if (isBot) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
          mb: 2,
          maxWidth: "100%",
        }}
      >
        <AiAvatar loading={isLoading} />
        <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          {isLoading ? (
            <TypingIndicator />
          ) : (
            <>
              <ChatBlockRenderer blocks={blocks} onSuggestionClick={onSuggestionClick} />
              {showActions && (
                <MessageActions
                  sessionId={sessionId}
                  raw={raw}
                  onRegenerate={onRegenerate}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    );
  }

  // --- User message: right-aligned tinted bubble ---
  const textBlock = blocks?.find((b) => b?.type === "text");
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        mb: 1.5,
        maxWidth: "100%",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: "85%",
          minWidth: 0,
          px: 1.5,
          py: 1,
          borderRadius: "16px 16px 4px 16px",
          background: "linear-gradient(135deg, #ede9fe, #e9d5ff)",
          color: "#3b0764",
          border: "1px solid #e9d5ff",
          boxShadow: "0 1px 2px rgba(100,0,184,0.06), 0 2px 8px rgba(100,0,184,0.05)",
          wordBreak: "break-word",
          fontSize: 14,
          lineHeight: 1.5,
          transition: "box-shadow 0.2s ease",
          "&:hover": {
            boxShadow: "0 2px 4px rgba(100,0,184,0.08), 0 4px 12px rgba(100,0,184,0.08)",
          },
        }}
      >
        {textBlock?.content || ""}
      </Paper>
    </Box>
  );
}
