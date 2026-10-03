import { useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Copy, Check, RotateCw } from "lucide-react";
import FeedbackButtons from "./FeedbackButtons";

/**
 * Action row shown under each completed bot response.
 * Copy → clipboard | Thumbs up/down → feedback API | Regenerate → re-send question.
 */
export default function MessageActions({ sessionId, raw, onRegenerate }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // `raw.answer` may be a structured object — use the flattened text.
      const answerText =
        raw?.answer_text ||
        (typeof raw?.answer === "string" ? raw.answer : "");
      await navigator.clipboard.writeText(answerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write can fail (permissions, insecure context) — fail silently
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate && raw?._originalQuestion) {
      onRegenerate(raw._originalQuestion);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.25,
        mt: 0.5,
      }}
    >
      <Tooltip title={copied ? "Copied" : "Copy response"}>
        <IconButton
          onClick={handleCopy}
          sx={{
            color: copied ? "success.main" : "text.disabled",
            padding: "6px",
            borderRadius: "16px",
            transition: "all 0.15s ease",
            "&:hover": {
              color: "text.secondary",
              backgroundColor: "grey.100",
            },
          }}
        >
          {copied ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={2} />}
        </IconButton>
      </Tooltip>

      <FeedbackButtons
        sessionId={sessionId}
        reportKey={raw?.report_key}
        question={raw?._originalQuestion || ""}
        answer={
          raw?.answer_text ||
          (typeof raw?.answer === "string" ? raw.answer : "")
        }
      />

      {onRegenerate && raw?._originalQuestion && (
        <Tooltip title="Regenerate response">
          <IconButton
            onClick={handleRegenerate}
            sx={{
              color: "text.disabled",
              padding: "6px",
              borderRadius: "16px",
              transition: "all 0.15s ease",
              "&:hover": {
                color: "var(--primary-btncolor-start)",
                backgroundColor: "#f5f3ff",
              },
            }}
          >
            <RotateCw size={15} strokeWidth={2} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
