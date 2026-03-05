import { useRef, useState, useCallback } from "react";
import { msToPixels } from "@/utils/audioUtils";
import { useWaveform } from "@/hooks/useWaveform";

export default function AudioClip({
  clip,
  pixelsPerSecond,
  isSelected,
  onSelect,
  onDragEnd,
  onTrimEnd,
  waveformData,
}) {
  const canvasRef = useRef(null);
  const clipRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const dragStartRef = useRef({ x: 0, startPos: 0 });

  const clipWidth = msToPixels(clip.duration_ms, pixelsPerSecond);
  const clipLeft = msToPixels(clip.position_ms, pixelsPerSecond);
  const displayWidth = Math.max(clipWidth, 20);

  useWaveform(canvasRef, waveformData, clip.color || "#10b981", displayWidth - 8, 52);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(clip.id);

    const isEdge = e.nativeEvent.offsetX > clipRef.current.offsetWidth - 8;
    if (isEdge) {
      setIsTrimming(true);
      dragStartRef.current = { x: e.clientX, startDuration: clip.duration_ms };
    } else {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, startPos: clip.position_ms };
    }

    const handleMouseMove = (moveE) => {
      const dx = moveE.clientX - dragStartRef.current.x;
      if (isEdge) {
        const durationDelta = (dx / pixelsPerSecond) * 1000;
        const newDuration = Math.max(500, dragStartRef.current.startDuration + durationDelta);
        onTrimEnd?.(clip.id, newDuration, true);
      } else {
        const posDelta = (dx / pixelsPerSecond) * 1000;
        const newPos = Math.max(0, dragStartRef.current.startPos + posDelta);
        onDragEnd?.(clip.id, newPos, clip.track_row, true);
      }
    };

    const handleMouseUp = (upE) => {
      const dx = upE.clientX - dragStartRef.current.x;
      if (isEdge) {
        const durationDelta = (dx / pixelsPerSecond) * 1000;
        const newDuration = Math.max(500, dragStartRef.current.startDuration + durationDelta);
        onTrimEnd?.(clip.id, newDuration, false);
      } else {
        const posDelta = (dx / pixelsPerSecond) * 1000;
        const newPos = Math.max(0, dragStartRef.current.startPos + posDelta);
        onDragEnd?.(clip.id, newPos, clip.track_row, false);
      }
      setIsDragging(false);
      setIsTrimming(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [clip, pixelsPerSecond, onSelect, onDragEnd, onTrimEnd]);

  return (
    <div
      ref={clipRef}
      onMouseDown={handleMouseDown}
      className={`absolute top-1 bottom-1 rounded-lg cursor-grab overflow-hidden transition-shadow
        ${isSelected ? "ring-2 ring-emerald-400 shadow-lg" : ""}
        ${isDragging ? "cursor-grabbing opacity-80" : ""}
        ${isTrimming ? "cursor-ew-resize" : ""}
      `}
      style={{
        left: clipLeft,
        width: displayWidth,
        backgroundColor: (clip.color || "#10b981") + "15",
        borderLeft: `3px solid ${clip.color || "#10b981"}`,
      }}
    >
      <div className="px-1 pt-0.5 text-[10px] text-white/60 truncate font-medium">
        {clip.name}
      </div>
      <canvas
        ref={canvasRef}
        className="absolute bottom-0 left-1 right-1"
        style={{ height: 52 }}
      />
      {/* Trim handle on right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 transition-colors" />
    </div>
  );
}
