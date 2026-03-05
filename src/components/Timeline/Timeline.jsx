import { useRef, useMemo } from "react";
import TimeRuler from "./TimeRuler";
import TrackRow from "./TrackRow";
import Playhead from "./Playhead";
import { msToPixels } from "@/utils/audioUtils";

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
  const totalHeight = Math.max(trackRows.length * 72 + 32, 200);

  const handleRulerClick = (ms) => {
    onSeek?.(ms);
  };

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

  return (
    <div className="flex-1 bg-slate-900 rounded-xl border border-white/10 overflow-hidden flex flex-col">
      <div
        ref={scrollContainerRef}
        className="overflow-auto flex-1 relative"
      >
        <div style={{ minWidth: totalWidth }}>
          {/* Time ruler */}
          <div className="sticky top-0 z-20">
            <div className="flex">
              <div className="w-28 flex-shrink-0 bg-slate-800/80 border-b border-white/10 border-r border-r-white/10 h-8" />
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
              />
            ))}

            {trackRows.length === 0 && (
              <div className="flex items-center justify-center h-48 text-white/20 text-sm">
                No tracks yet. Generate your first track!
              </div>
            )}

            {/* Playhead overlay */}
            <div className="absolute top-0 left-28 right-0 pointer-events-none" style={{ height: totalHeight - 32 }}>
              <Playhead
                currentTimeMs={currentTimeMs}
                pixelsPerSecond={pixelsPerSecond}
                height={trackRows.length * 72}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
