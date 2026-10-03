import { useCallback, useRef } from "react";
import { Drawer, Box } from "@mui/material";
import { MoveHorizontal } from "lucide-react";
import "./OptigoBotDrawer.scss";
import ChatWindow from "./ChatWindow";

const MIN_WIDTH = 320;
const MAX_WIDTH = 760;
const DEFAULT_WIDTH = 400;
const RESIZE_CLASS = "optigobot-resizing";

/**
 * MUI Drawer shell for the OptigoBot block-based chat.
 * Same props ({ open, onClose }) and layout as the previous AskOptigoAiDrawer
 * so it can be swapped in one line. Renders ChatWindow inside.
 * The left edge carries a drag handle that resizes the panel: during the drag
 * the paper width + main-content margin are written straight to the DOM inside
 * a rAF callback (zero React renders), then committed once on release.
 */
const OptigoBotDrawer = ({
  open,
  onClose,
  width = DEFAULT_WIDTH,
  onWidthCommit,
}) => {
  const rafRef = useRef(0);
  const dragWidthRef = useRef(DEFAULT_WIDTH);

  const handlePointerDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const handle = e.currentTarget;
      try {
        handle.setPointerCapture(e.pointerId);
      } catch {
        /* older browsers / synthetic events */
      }

      const paperEl = handle.closest(".MuiDrawer-paper");
      const containerEl = document.querySelector(".dx-main-report-wrap");
      document.body.classList.add(RESIZE_CLASS);

      const applyWidth = (w) => {
        dragWidthRef.current = w;
        if (paperEl) paperEl.style.width = `${w}px`;
        if (containerEl) containerEl.style.marginRight = `${w}px`;
      };

      const onMove = (ev) => {
        if (rafRef.current) return; // one write per frame
        const clientX = ev.clientX;
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          applyWidth(
            Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - clientX))
          );
        });
      };

      const onUp = () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onUp);
        handle.removeEventListener("pointercancel", onUp);
        document.body.classList.remove(RESIZE_CLASS);
        onWidthCommit?.(dragWidthRef.current);
      };

      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
      handle.addEventListener("pointercancel", onUp);
    },
    [onWidthCommit]
  );

  const handleDoubleClick = useCallback(() => {
    onWidthCommit?.(DEFAULT_WIDTH);
  }, [onWidthCommit]);

  return (
    <Drawer
      anchor="right"
      variant="persistent"
      open={open}
      onClose={onClose}
      className="optigobot-drawer"
      ModalProps={{
        hideBackdrop: true,
        keepMounted: true,
      }}
      sx={{
        "& .MuiDrawer-paper": {
          width,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "grey.50",
          borderLeft: "1px solid", borderLeftColor: "divider",
          boxShadow: "-4px 0 12px rgba(0,0,0,0.05)",
          overflow: "visible",
        },
      }}
    >
      {/* Drag-to-resize handle on the left edge */}
      <Box
        className="optigobot-resize-handle"
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize chat panel"
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: -3,
          width: 8,
          cursor: "col-resize",
          zIndex: 30,
          touchAction: "none",
          "&:hover .optigobot-grip, &:active .optigobot-grip": {
            opacity: 1,
            backgroundColor: "#dccdff",
            borderColor: "#c9b3ff",
            color: "var(--primary-btncolor-start)",
          },
        }}
      >
        <Box
          className="optigobot-grip"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 18,
            height: 34,
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#efe8ff",
            border: "1px solid #e2d6ff",
            color: "text.disabled",
            opacity: 0,
            transition: "all 0.2s ease",
            pointerEvents: "none",
          }}
        >
          <MoveHorizontal size={12} />
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <ChatWindow onClose={onClose} />
      </Box>
    </Drawer>
  );
};

export default OptigoBotDrawer;
