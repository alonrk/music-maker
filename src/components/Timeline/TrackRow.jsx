import AudioClip from "./AudioClip";

export default function TrackRow({
  track,
  clips,
  rowIndex,
  pixelsPerSecond,
  totalWidth,
  selectedClipId,
  onSelectClip,
  onToggleMute,
  onToggleSolo,
  onClipDragEnd,
  onClipTrimEnd,
  getWaveform,
  onTrackAreaClick,
}) {
  return (
    <div className="flex border-b border-white/5 group">
      {/* Track controls */}
      <div className="w-28 flex-shrink-0 bg-slate-800/60 border-r border-white/10 p-2 flex flex-col gap-1.5">
        <div className="text-[11px] text-white/50 font-medium truncate">
          Track {rowIndex + 1}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onToggleMute(rowIndex)}
            className={`w-7 h-6 text-[10px] font-bold rounded transition-colors ${
              track.muted
                ? "bg-red-500/80 text-white"
                : "bg-white/10 text-white/50 hover:bg-white/20"
            }`}
          >
            M
          </button>
          <button
            onClick={() => onToggleSolo(rowIndex)}
            className={`w-7 h-6 text-[10px] font-bold rounded transition-colors ${
              track.solo
                ? "bg-amber-500/80 text-white"
                : "bg-white/10 text-white/50 hover:bg-white/20"
            }`}
          >
            S
          </button>
        </div>
      </div>

      {/* Track lane */}
      <div
        className="relative h-[72px] bg-slate-900/40 cursor-pointer"
        style={{ width: totalWidth }}
        onClick={onTrackAreaClick}
      >
        {clips.map((clip) => (
          <AudioClip
            key={clip.id}
            clip={clip}
            pixelsPerSecond={pixelsPerSecond}
            isSelected={selectedClipId === clip.id}
            onSelect={onSelectClip}
            onDragEnd={onClipDragEnd}
            onTrimEnd={onClipTrimEnd}
            waveformData={getWaveform(clip.id)}
          />
        ))}
      </div>
    </div>
  );
}
