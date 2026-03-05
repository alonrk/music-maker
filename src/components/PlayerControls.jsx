import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ZoomIn, ZoomOut } from "lucide-react";
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
  onZoomIn,
  onZoomOut,
}) {
  return (
    <div className="h-12 bg-white border-b border-slate-200 flex items-center px-2 sm:px-4 gap-1 sm:gap-3 flex-shrink-0">
      {/* Left: volume - icon only on mobile, slider on desktop */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onVolumeChange(masterVolume === 0 ? 0.8 : 0)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 sm:hover:bg-transparent transition-colors"
        >
          {masterVolume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={masterVolume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-16 hidden sm:block"
        />
      </div>

      <div className="flex-1" />

      {/* Center: transport */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          onClick={onStop}
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Back to start"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Skip forward"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1" />

      {/* Right: zoom + time */}
      <div className="flex items-center gap-1.5 sm:gap-3 justify-end">
        <div className="hidden sm:flex items-center gap-1">
          <button onClick={onZoomOut} className="text-slate-400 hover:text-slate-600 transition-colors">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <div className="w-16 h-1 bg-slate-200 rounded-full relative">
            <div className="absolute inset-y-0 left-1/2 w-1/2 bg-blue-400 rounded-full" />
          </div>
          <button onClick={onZoomIn} className="text-slate-400 hover:text-slate-600 transition-colors">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Mobile: compact zoom buttons */}
        <div className="flex sm:hidden items-center gap-0.5">
          <button onClick={onZoomOut} className="w-7 h-7 flex items-center justify-center text-slate-400">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button onClick={onZoomIn} className="w-7 h-7 flex items-center justify-center text-slate-400">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="font-mono text-[10px] sm:text-xs text-slate-500 tabular-nums whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </div>
      </div>
    </div>
  );
}
