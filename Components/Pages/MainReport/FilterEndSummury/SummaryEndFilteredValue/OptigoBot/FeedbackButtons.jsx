import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { Check, X, MessageSquare } from "lucide-react";
import { FaThumbsUp, FaThumbsDown, FaRegThumbsUp, FaRegThumbsDown } from "react-icons/fa";
import submitFeedback from "@/API/LLMApi/optigoFeedback";

// Reason chips shown in the feedback dialog — aligned with the QA taxonomy.
const DOWNVOTE_REASONS = [
  { id: "offensive_unsafe", label: "Offensive / Unsafe" },
  { id: "not_factually_correct", label: "Not factually correct" },
  { id: "didnt_follow_instructions", label: "Didn't follow instructions" },
  { id: "personalization_issue", label: "Personalization issue" },
  { id: "other", label: "Other / More" },
];

const SEVERITY_LEVELS = ["Low", "Medium", "High"];

export default function FeedbackButtons({
  sessionId,
  question,
  answer,
  reportKey,
  metric,
}) {
  const theme = useTheme();
  const [vote, setVote] = useState(null); // "up" | "down" | null
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [severity, setSeverity] = useState("Medium");
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
    setDialogOpen(true);
  };

  const handleReasonSelect = (reasonId) => {
    setSelectedReason(selectedReason === reasonId ? null : reasonId);
  };

  const handleSubmitDownvote = () => {
    const reasonLabel = DOWNVOTE_REASONS.find((r) => r.id === selectedReason)?.label;
    const taggedReason = severity ? `${reasonLabel} | severity: ${severity}` : reasonLabel;
    handleSubmit("down", taggedReason, comment);
    setDialogOpen(false);
    setSelectedReason(null);
    setSeverity("Medium");
    setComment("");
  };

  const handleCancelDownvote = () => {
    setDialogOpen(false);
    setSelectedReason(null);
    setSeverity("Medium");
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

      {/* Feedback Dialog — like ChatGPT */}
      <Dialog
        open={dialogOpen}
        onClose={handleCancelDownvote}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "16px", overflow: "hidden" },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            pb: 1,
            fontSize: 16,
            fontWeight: 600,
            color: "text.primary",
            borderBottom: "1px solid", borderBottomColor: "grey.100",
          }}
        >
          <MessageSquare size={18} color={theme.palette.error.main} />
          Share Feedback
          <IconButton
            onClick={handleCancelDownvote}
            size="small"
            sx={{ ml: "auto", color: "text.disabled" }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2.5 }}>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1.5 }}>
            What was wrong with this response?
          </Typography>

          {/* Reason chips */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
            {DOWNVOTE_REASONS.map((reason) => (
              <Chip
                key={reason.id}
                label={reason.label}
                onClick={() => handleReasonSelect(reason.id)}
                sx={{
                  fontSize: 12.5,
                  height: 30,
                  cursor: "pointer",
                  borderRadius: "16px",
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

          {/* Severity selector */}
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1 }}>
            How severe is this issue?
          </Typography>
          <Box sx={{ display: "flex", gap: 0.75, mb: 2 }}>
            {SEVERITY_LEVELS.map((level) => (
              <Chip
                key={level}
                label={level}
                onClick={() => setSeverity(level)}
                sx={{
                  fontSize: 12,
                  height: 26,
                  cursor: "pointer",
                  borderRadius: "13px",
                  backgroundColor:
                    severity === level
                      ? alpha(theme.palette.error.main, 0.08)
                      : "transparent",
                  color: severity === level ? "error.main" : "text.secondary",
                  border: "1px solid",
                  borderColor:
                    severity === level ? "error.light" : "divider",
                  fontWeight: severity === level ? 600 : 400,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.error.main, 0.12),
                  },
                }}
              />
            ))}
          </Box>

          {/* Comment field */}
          <Paper
            elevation={0}
            sx={{
              border: "1px solid", borderColor: "divider",
              borderRadius: "16px",
              px: 1.5,
              py: 0.5,
              mb: 2,
              "&:focus-within": {
                borderColor: "error.main",
              },
            }}
          >
            <InputBase
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add more detail (optional)"
              multiline
              minRows={2}
              maxRows={4}
              sx={{ fontSize: 13, color: "text.primary", width: "100%" }}
            />
          </Paper>

          {/* Privacy note */}
          <Typography
            sx={{
              fontSize: 11,
              color: "text.disabled",
              fontStyle: "italic",
              mb: 2,
            }}
          >
            Feedback is used to improve responses. It is not linked to your account.
          </Typography>

          {/* Action buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              onClick={handleCancelDownvote}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                fontSize: 13,
                borderRadius: "16px",
                "&:hover": { backgroundColor: "grey.50" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitDownvote}
              disabled={!selectedReason}
              startIcon={<Check size={16} />}
              sx={{
                textTransform: "none",
                fontSize: 13,
                borderRadius: "16px",
                backgroundColor: "error.main",
                boxShadow: "none",
                "&:hover": { backgroundColor: "error.dark", boxShadow: "none" },
                "&.Mui-disabled": {
                  backgroundColor: "error.light",
                  color: "common.white",
                },
              }}
            >
              Submit Feedback
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

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
