import { useRef, useMemo, useCallback } from "react";
import TimeRuler from "./TimeRuler";
import TrackRow from "./TrackRow";
import Playhead from "./Playhead";
import { msToPixels, pixelsToMs } from "@/utils/audioUtils";

export default function Timeline({
  tracks,
  trackRows,
  pixelsPerSecond,
  currentTimeMs,
  selectedClipId,
  onSelectClip,
  onToggleMute,
  onToggleSolo,
  onClipDragEnd,
  onClipTrimEnd,
  onSeek,
  getWaveform,
}) {
  const scrollContainerRef = useRef(null);

  const totalDurationMs = useMemo(() => {
    if (tracks.length === 0) return 30000;
    let maxEnd = 0;
    tracks.forEach((t) => {
      const end = (t.position_ms || 0) + (t.duration_ms || 0);
      if (end > maxEnd) maxEnd = end;
    });
    return Math.max(maxEnd + 10000, 30000);
  }, [tracks]);

  const totalWidth = msToPixels(totalDurationMs, pixelsPerSecond);

  const handleRulerClick = (ms) => {
    onSeek?.(ms);
  };

  const handleTrackAreaClick = useCallback((e) => {
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ms = pixelsToMs(x, pixelsPerSecond);
    onSeek?.(Math.max(0, ms));
  }, [pixelsPerSecond, onSeek]);

  const clipsByRow = useMemo(() => {
    const map = {};
    trackRows.forEach((_, i) => { map[i] = []; });
    tracks.forEach((t) => {
      const row = t.track_row ?? 0;
      if (!map[row]) map[row] = [];
      map[row].push(t);
    });
    return map;
  }, [tracks, trackRows]);

  const mobileRowHeight = 56;
  const desktopRowHeight = 72;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const rowHeight = isMobile ? mobileRowHeight : desktopRowHeight;
  const trackAreaHeight = trackRows.length * rowHeight;

  return (
    <div className="flex-1 bg-white rounded-lg sm:rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
      <div
        ref={scrollContainerRef}
        className="overflow-auto flex-1 relative touch-pan-x touch-pan-y"
      >
        <div style={{ minWidth: totalWidth }}>
          {/* Time ruler */}
          <div className="sticky top-0 z-20">
            <div className="flex">
              <div className="w-16 sm:w-28 flex-shrink-0 bg-white border-b border-slate-200 border-r border-r-slate-200 h-7" />
              <TimeRuler
                pixelsPerSecond={pixelsPerSecond}
                totalWidth={totalWidth}
                scrollLeft={scrollContainerRef.current?.scrollLeft || 0}
                onClick={handleRulerClick}
              />
            </div>
          </div>

          {/* Track rows */}
          <div className="relative">
            {trackRows.map((rowState, rowIndex) => (
              <TrackRow
                key={rowIndex}
                track={rowState}
                clips={clipsByRow[rowIndex] || []}
                rowIndex={rowIndex}
                pixelsPerSecond={pixelsPerSecond}
                totalWidth={totalWidth}
                selectedClipId={selectedClipId}
                onSelectClip={onSelectClip}
                onToggleMute={onToggleMute}
                onToggleSolo={onToggleSolo}
                onClipDragEnd={onClipDragEnd}
                onClipTrimEnd={onClipTrimEnd}
                getWaveform={getWaveform}
                onTrackAreaClick={handleTrackAreaClick}
              />
            ))}

            {trackRows.length === 0 && (
              <div className="flex items-center justify-center h-32 sm:h-48 text-slate-300 text-xs sm:text-sm">
                No tracks yet. Generate your first track!
              </div>
            )}

            {/* Playhead overlay */}
            <div className="absolute top-0 left-16 sm:left-28 right-0 pointer-events-none" style={{ height: trackAreaHeight }}>
              <Playhead
                currentTimeMs={currentTimeMs}
                pixelsPerSecond={pixelsPerSecond}
                height={trackAreaHeight}
                onSeek={onSeek}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
