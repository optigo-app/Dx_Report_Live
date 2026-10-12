import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  InputBase,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { Check } from "lucide-react";
import { FaThumbsUp, FaThumbsDown, FaRegThumbsUp, FaRegThumbsDown } from "react-icons/fa";
import submitFeedback from "@/API/LLMApi/optigoFeedback";

// Reason chips shown in the feedback dialog — aligned with the QA taxonomy.
const DOWNVOTE_REASONS = [
  { id: "didnt_follow_instructions", label: "Didn't follow instructions" },
  { id: "not_factually_correct", label: "Not factually correct" },
  { id: "personalization_issue", label: "Personalization issue" },
  { id: "offensive_unsafe", label: "Offensive / Unsafe" },
  { id: "other", label: "Other / More" },
];

export default function FeedbackButtons({
  sessionId,
  question,
  answer,
  reportKey,
  metric,
}) {
  const theme = useTheme();
  const [vote, setVote] = useState(null); // "up" | "down" | null
  const [formOpen, setFormOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [comment, setComment] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!toastOpen) return;
    const t = setTimeout(() => setToastOpen(false), 2500);
    return () => clearTimeout(t);
  }, [toastOpen]);

  const handleSubmit = async (rating, reason, commentText) => {
    const fullComment = reason
      ? `[${reason}]${commentText ? ` ${commentText}` : ""}`
      : commentText || "";
    const res = await submitFeedback({
      session_id: sessionId,
      question,
      answer,
      report_key: reportKey,
      metric,
      rating,
      comment: fullComment,
    });
    if (res?.status !== "error") {
      setToastMessage("Thanks for your feedback!");
      setToastOpen(true);
    }
  };

  const handleThumbsUp = () => {
    if (vote === "up") {
      setVote(null); // toggle off
      return;
    }
    setVote("up");
    handleSubmit("up");
  };

  const handleThumbsDown = () => {
    if (vote === "down") {
      setVote(null); // toggle off
      return;
    }
    setVote("down");
    setFormOpen(true);
  };

  const handleReasonSelect = (reasonId) => {
    setSelectedReason(selectedReason === reasonId ? null : reasonId);
  };

  const handleSubmitDownvote = () => {
    const reasonLabel = DOWNVOTE_REASONS.find((r) => r.id === selectedReason)?.label;
    handleSubmit("down", reasonLabel, comment);
    setFormOpen(false);
    setSelectedReason(null);
    setComment("");
  };

  const handleCancelDownvote = () => {
    setFormOpen(false);
    setSelectedReason(null);
    setComment("");
    setVote(null);
  };

  // --- Icon row stays visible after voting; the chosen thumb is filled. ---
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          "@keyframes thumbPop": {
            "0%": { transform: "scale(0.5) rotate(-12deg)", opacity: 0.4 },
            "60%": { transform: "scale(1.25) rotate(6deg)" },
            "100%": { transform: "scale(1) rotate(0deg)", opacity: 1 },
          },
        }}
      >
        {/* Shared gradient defs for the voted thumbs */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="optigo-thumb-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6400b8" />
              <stop offset="100%" stopColor="#8d0096" />
            </linearGradient>
          </defs>
        </svg>
        <Tooltip title="Good response">
          <IconButton
            onClick={handleThumbsUp}
            sx={{
              color: vote === "up" ? "var(--primary-btncolor-start)" : "text.disabled",
              padding: "6px",
              borderRadius: "16px",
              transition: "all 0.15s ease",
              "&:hover": {
                color: "var(--primary-btncolor-start)",
                backgroundColor: "#f5f3ff",
              },
              "& svg": {
                transition: "transform 0.15s ease",
                animation: vote === "up" ? "thumbPop 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "none",
              },
              "&:active svg": { transform: "scale(0.85)" },
            }}
          >
            {vote === "up" ? (
              <FaThumbsUp size={14} fill="url(#optigo-thumb-grad)" />
            ) : (
              <FaRegThumbsUp size={14} />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title="Bad response">
          <IconButton
            onClick={handleThumbsDown}
            sx={{
              color: vote === "down" ? "error.main" : "text.disabled",
              padding: "6px",
              borderRadius: "16px",
              transition: "all 0.15s ease",
              "&:hover": {
                color: "error.main",
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              },
              "& svg": {
                transition: "transform 0.15s ease",
                animation: vote === "down" ? "thumbPop 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "none",
              },
              "&:active svg": { transform: "scale(0.85)" },
            }}
          >
            {vote === "down" ? (
              <FaThumbsDown size={14} />
            ) : (
              <FaRegThumbsDown size={14} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Inline feedback form — expands below the whole actions row (order
          keeps it after Regenerate even though it's rendered earlier). */}
      <Collapse in={formOpen} sx={{ width: "100%", flexBasis: "100%", order: 10 }}>
        <Paper
          elevation={0}
          sx={{
            mt: 0.75,
            mb: 0.5,
            p: 2,
            borderRadius: "14px",
            backgroundColor: "common.white",
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            width: "100%",
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary", mb: 0.5 }}>
            What went wrong?
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 2 }}>
            Your feedback helps make Optigo AI better for everyone.
          </Typography>

          {/* Reason chips — one per row */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, mb: 2 }}>
            {DOWNVOTE_REASONS.map((reason) => (
              <Chip
                key={reason.id}
                label={reason.label}
                onClick={() => handleReasonSelect(reason.id)}
                sx={{
                  fontSize: 12.5,
                  height: 32,
                  cursor: "pointer",
                  borderRadius: "16px",
                  px: 1,
                  backgroundColor:
                    selectedReason === reason.id
                      ? alpha(theme.palette.error.main, 0.08)
                      : "grey.50",
                  color: selectedReason === reason.id ? "error.main" : "text.secondary",
                  border: "1px solid",
                  borderColor:
                    selectedReason === reason.id ? "error.light" : "divider",
                  fontWeight: selectedReason === reason.id ? 600 : 400,
                  "&:hover": {
                    backgroundColor:
                      selectedReason === reason.id
                        ? alpha(theme.palette.error.main, 0.14)
                        : "grey.100",
                  },
                }}
              />
            ))}
          </Box>

          {/* Comment field — only for "Other / More" */}
          {selectedReason === "other" && (
            <Paper
              elevation={0}
              sx={{
                border: "1px solid", borderColor: "divider",
                borderRadius: "12px",
                px: 1.25,
                py: 0.5,
                mb: 1.25,
                "&:focus-within": {
                  borderColor: "error.main",
                },
              }}
            >
              <InputBase
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more…"
                multiline
                minRows={1}
                maxRows={3}
                autoFocus
                sx={{ fontSize: 13, color: "text.primary", width: "100%" }}
              />
            </Paper>
          )}

          {/* Action buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.25 }}>
            <Button
              onClick={handleCancelDownvote}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                fontSize: 13,
                borderRadius: "16px",
                minWidth: 0,
                px: 2,
                "&:hover": { backgroundColor: "grey.50" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitDownvote}
              disabled={!selectedReason}
              startIcon={<Check size={15} />}
              sx={{
                textTransform: "none",
                fontSize: 13,
                borderRadius: "16px",
                backgroundColor: "error.main",
                boxShadow: "none",
                px: 1.5,
                "&:hover": { backgroundColor: "error.dark", boxShadow: "none" },
                "&.Mui-disabled": {
                  backgroundColor: "error.light",
                  color: "common.white",
                },
              }}
            >
              Submit
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {/* Confirmation toast — full-width dark bar sliding up from the bottom
          of the message area (anchored to the drawer's relative wrapper). */}
      {toastOpen && (
        <Box
          onClick={() => setToastOpen(false)}
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.25,
            backgroundColor: "grey.900",
            color: "common.white",
            fontSize: 13,
            fontWeight: 500,
            zIndex: 50,
            cursor: "pointer",
            "@keyframes toastUp": {
              from: { transform: "translateY(100%)", opacity: 0 },
              to: { transform: "translateY(0)", opacity: 1 },
            },
            animation: "toastUp 0.3s ease both",
          }}
        >
          <Check size={15} color="#4ade80" />
          {toastMessage}
        </Box>
      )}
    </>
  );
}
