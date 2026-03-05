import { msToPixels } from "@/utils/audioUtils";

export default function Playhead({ currentTimeMs, pixelsPerSecond, height }) {
  const x = msToPixels(currentTimeMs, pixelsPerSecond);

  return (
    <div
      className="absolute top-0 z-30 pointer-events-none"
      style={{ left: x, height }}
    >
      <div className="w-3 h-3 -ml-1.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
      <div className="w-px bg-emerald-400 shadow-lg shadow-emerald-400/50" style={{ height: "100%" }} />
    </div>
  );
}
