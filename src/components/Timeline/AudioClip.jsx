import { useRef, useState, useCallback } from "react";
import { msToPixels } from "@/utils/audioUtils";
import { useWaveform } from "@/hooks/useWaveform";

const LIGHT_TRACK_COLORS = {
  "#10b981": "#059669",
  "#3b82f6": "#2563eb",
  "#f59e0b": "#d97706",
  "#8b5cf6": "#7c3aed",
  "#ef4444": "#dc2626",
  "#ec4899": "#db2777",
  "#06b6d4": "#0891b2",
  "#84cc16": "#65a30d",
};

function getDisplayColor(color) {
  return LIGHT_TRACK_COLORS[color] || color || "#2563eb";
}

function getClientX(e) {
  if (e.touches && e.touches.length > 0) return e.touches[0].clientX;
  if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0].clientX;
  return e.clientX;
}

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
  const displayColor = getDisplayColor(clip.color);

  useWaveform(canvasRef, waveformData, displayColor, displayWidth - 8, 52);

  const startDrag = useCallback((startX, isEdge, isTouch) => {
    if (isEdge) {
      setIsTrimming(true);
      dragStartRef.current = { x: startX, startDuration: clip.duration_ms };
    } else {
      setIsDragging(true);
      dragStartRef.current = { x: startX, startPos: clip.position_ms };
    }

    const moveEvent = isTouch ? "touchmove" : "mousemove";
    const endEvent = isTouch ? "touchend" : "mouseup";

    const handleMove = (moveE) => {
      if (isTouch) moveE.preventDefault();
      const cx = getClientX(moveE);
      const dx = cx - dragStartRef.current.x;
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

    const handleEnd = (endE) => {
      const cx = getClientX(endE);
      const dx = cx - dragStartRef.current.x;
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
      document.removeEventListener(moveEvent, handleMove);
      document.removeEventListener(endEvent, handleEnd);
    };

    document.addEventListener(moveEvent, handleMove, { passive: false });
    document.addEventListener(endEvent, handleEnd);
  }, [clip, pixelsPerSecond, onDragEnd, onTrimEnd]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(clip.id);
    const isEdge = e.nativeEvent.offsetX > clipRef.current.offsetWidth - 8;
    startDrag(e.clientX, isEdge, false);
  }, [clip.id, onSelect, startDrag]);

  const handleTouchStart = useCallback((e) => {
    e.stopPropagation();
    onSelect(clip.id);
    const touch = e.touches[0];
    const rect = clipRef.current.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const isEdge = offsetX > rect.width - 16;
    startDrag(touch.clientX, isEdge, true);
  }, [clip.id, onSelect, startDrag]);

  return (
    <div
      ref={clipRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`absolute top-1 bottom-1 rounded-lg cursor-grab overflow-hidden transition-shadow border touch-none
        ${isSelected ? "ring-2 ring-blue-500 shadow-md" : "border-slate-200"}
        ${isDragging ? "cursor-grabbing opacity-80" : ""}
        ${isTrimming ? "cursor-ew-resize" : ""}
      `}
      style={{
        left: clipLeft,
        width: displayWidth,
        backgroundColor: displayColor + "18",
        borderLeftWidth: 3,
        borderLeftColor: displayColor,
      }}
    >
      <div className="px-1.5 pt-0.5 text-[10px] text-slate-500 truncate font-medium">
        {clip.name}
      </div>
      <canvas
        ref={canvasRef}
        className="absolute bottom-0 left-1 right-1"
        style={{ height: 52 }}
      />
      {/* Trim handle on right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize hover:bg-black/5 transition-colors" />
    </div>
  );
}
