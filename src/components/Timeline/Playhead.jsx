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
      {/* Draggable handle */}
      <div
        onMouseDown={handleMouseDown}
        className="pointer-events-auto cursor-grab active:cursor-grabbing -ml-3 w-6 h-6 flex items-center justify-center"
      >
        <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
      </div>
      {/* Vertical line */}
      <div className="w-px bg-emerald-400 shadow-lg shadow-emerald-400/50" style={{ height: "100%" }} />
    </div>
  );
}
