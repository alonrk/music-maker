import { useRef, useCallback } from "react";
import { msToPixels, pixelsToMs } from "@/utils/audioUtils";

export default function Playhead({ currentTimeMs, pixelsPerSecond, height, onSeek }) {
  const x = msToPixels(currentTimeMs, pixelsPerSecond);
  const draggingRef = useRef(false);

  const handleMouseDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    draggingRef.current = true;

    const startClientX = e.clientX;
    const startMs = currentTimeMs;

    const handleMouseMove = (moveE) => {
      const dx = moveE.clientX - startClientX;
      const deltaMs = pixelsToMs(dx, pixelsPerSecond);
      onSeek?.(Math.max(0, startMs + deltaMs));
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [currentTimeMs, pixelsPerSecond, onSeek]);

  return (
    <div
      className="absolute top-0 z-30 pointer-events-none"
      style={{ left: x, height }}
    >
      {/* Vertical line - centered on x */}
      <div
        className="absolute top-0 w-px bg-blue-600"
        style={{ left: 0, height: "100%" }}
      />
      {/* Draggable triangle handle - centered on x */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{ left: -6, top: -14 }}
      >
        <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
          <path d="M0.5 0H12.5V8L6.5 14L0.5 8V0Z" fill="#2563eb" />
        </svg>
      </div>
    </div>
  );
}
