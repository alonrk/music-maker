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
    <div className="flex border-b border-slate-100 group">
      {/* Track controls - narrower on mobile */}
      <div className="w-16 sm:w-28 flex-shrink-0 bg-slate-50 border-r border-slate-200 p-1.5 sm:p-2 flex flex-col gap-1 sm:gap-1.5">
        <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
          <span className="sm:hidden">T{rowIndex + 1}</span>
          <span className="hidden sm:inline">Track {rowIndex + 1}</span>
        </div>
        <div className="flex gap-0.5 sm:gap-1">
          <button
            onClick={() => onToggleMute(rowIndex)}
            className={`w-6 sm:w-7 h-5 sm:h-6 text-[9px] sm:text-[10px] font-bold rounded transition-colors ${
              track.muted
                ? "bg-red-500 text-white"
                : "bg-slate-200 text-slate-400 hover:bg-slate-300"
            }`}
          >
            M
          </button>
          <button
            onClick={() => onToggleSolo(rowIndex)}
            className={`w-6 sm:w-7 h-5 sm:h-6 text-[9px] sm:text-[10px] font-bold rounded transition-colors ${
              track.solo
                ? "bg-amber-400 text-white"
                : "bg-slate-200 text-slate-400 hover:bg-slate-300"
            }`}
          >
            S
          </button>
        </div>
      </div>

      {/* Track lane */}
      <div
        className="relative h-[56px] sm:h-[72px] bg-white cursor-pointer"
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
