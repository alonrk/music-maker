import { useMemo } from "react";
import { formatTime } from "@/utils/audioUtils";

export default function TimeRuler({ pixelsPerSecond, totalWidth, scrollLeft, onClick }) {
  const ticks = useMemo(() => {
    let interval = 1;
    if (pixelsPerSecond < 40) interval = 5;
    else if (pixelsPerSecond < 80) interval = 2;

    const result = [];
    const maxSeconds = Math.ceil(totalWidth / pixelsPerSecond) + 10;
    for (let s = 0; s <= maxSeconds; s += interval) {
      result.push({ seconds: s, x: s * pixelsPerSecond, isMajor: s % (interval * 5) === 0 || interval >= 5 });
    }
    return result;
  }, [pixelsPerSecond, totalWidth]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const ms = (x / pixelsPerSecond) * 1000;
    onClick?.(Math.max(0, ms));
  };

  return (
    <div
      className="h-8 bg-slate-800/80 border-b border-white/10 relative cursor-pointer select-none flex-shrink-0"
      onClick={handleClick}
      style={{ width: totalWidth }}
    >
      {ticks.map((tick) => (
        <div key={tick.seconds} className="absolute top-0 h-full" style={{ left: tick.x }}>
          <div className={`w-px ${tick.isMajor ? "h-full bg-white/20" : "h-3 bg-white/10"}`} style={{ marginTop: tick.isMajor ? 0 : "auto" }} />
          {tick.isMajor && (
            <span className="absolute top-1 left-1.5 text-[10px] text-white/40 font-mono whitespace-nowrap">
              {formatTime(tick.seconds * 1000)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
