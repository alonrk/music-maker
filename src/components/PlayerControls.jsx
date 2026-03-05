import { Play, Pause, Square, Volume2, VolumeX } from "lucide-react";
import { formatTime } from "@/utils/audioUtils";

export default function PlayerControls({
  isPlaying,
  currentTime,
  totalDuration,
  masterVolume,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
}) {
  return (
    <div className="h-14 bg-slate-800/80 border-t border-white/10 flex items-center px-4 gap-4 flex-shrink-0">
      {/* Transport controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onStop}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Stop"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg shadow-emerald-500/25"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
      </div>

      {/* Time display */}
      <div className="font-mono text-sm text-white/70 min-w-[120px]">
        <span className="text-white">{formatTime(currentTime)}</span>
        <span className="text-white/30 mx-1">/</span>
        <span>{formatTime(totalDuration)}</span>
      </div>

      <div className="flex-1" />

      {/* Volume */}
      <div className="flex items-center gap-2">
        {masterVolume === 0 ? (
          <VolumeX className="w-4 h-4 text-white/40" />
        ) : (
          <Volume2 className="w-4 h-4 text-white/40" />
        )}
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={masterVolume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-24 accent-emerald-500"
        />
      </div>
    </div>
  );
}
