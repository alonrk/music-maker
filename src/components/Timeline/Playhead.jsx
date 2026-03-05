import { useRef, useCallback } from "react";
import { msToPixels, pixelsToMs } from "@/utils/audioUtils";

function getClientX(e) {
  if (e.touches && e.touches.length > 0) return e.touches[0].clientX;
  if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0].clientX;
  return e.clientX;
}

export default function Playhead({ currentTimeMs, pixelsPerSecond, height, onSeek }) {
  const x = msToPixels(currentTimeMs, pixelsPerSecond);
  const draggingRef = useRef(false);

  const startDrag = useCallback((startX, isTouch) => {
    draggingRef.current = true;
    const startMs = currentTimeMs;

    const moveEvent = isTouch ? "touchmove" : "mousemove";
    const endEvent = isTouch ? "touchend" : "mouseup";

    const handleMove = (moveE) => {
      if (isTouch) moveE.preventDefault();
      const cx = getClientX(moveE);
      const dx = cx - startX;
      const deltaMs = pixelsToMs(dx, pixelsPerSecond);
      onSeek?.(Math.max(0, startMs + deltaMs));
    };

    const handleEnd = () => {
      draggingRef.current = false;
      document.removeEventListener(moveEvent, handleMove);
      document.removeEventListener(endEvent, handleEnd);
    };

    document.addEventListener(moveEvent, handleMove, { passive: false });
    document.addEventListener(endEvent, handleEnd);
  }, [currentTimeMs, pixelsPerSecond, onSeek]);

  const handleMouseDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    startDrag(e.clientX, false);
  }, [startDrag]);

  const handleTouchStart = useCallback((e) => {
    e.stopPropagation();
    startDrag(getClientX(e), true);
  }, [startDrag]);

  return (
    <div
      className="absolute top-0 z-30 pointer-events-none"
      style={{ left: x, height }}
    >
      {/* Vertical line */}
      <div
        className="absolute top-0 w-px bg-blue-600"
        style={{ left: 0, height: "100%" }}
      />
      {/* Draggable handle - larger touch target on mobile */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="absolute pointer-events-auto cursor-grab active:cursor-grabbing touch-none"
        style={{ left: -12, top: -14, padding: "0 6px" }}
      >
        <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
          <path d="M0.5 0H12.5V8L6.5 14L0.5 8V0Z" fill="#2563eb" />
        </svg>
      </div>
    </div>
  );
}
