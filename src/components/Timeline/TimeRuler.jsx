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
      className="h-7 bg-white border-b border-slate-200 relative cursor-pointer select-none flex-shrink-0"
      onClick={handleClick}
      style={{ width: totalWidth }}
    >
      {ticks.map((tick) => (
        <div key={tick.seconds} className="absolute top-0 h-full" style={{ left: tick.x }}>
          <div
            className={`w-px ${tick.isMajor ? "h-full bg-slate-200" : "h-2 bg-slate-200"}`}
            style={{ marginTop: tick.isMajor ? 0 : "auto" }}
          />
          {tick.isMajor && (
            <span className="absolute top-1.5 left-1.5 text-[10px] text-slate-400 font-mono whitespace-nowrap">
              {formatTime(tick.seconds * 1000)}
            </span>
          )}
          {!tick.isMajor && (
            <div className="absolute top-[10px] left-[-1px] w-[3px] h-[3px] rounded-full bg-slate-300" />
          )}
        </div>
      ))}
    </div>
  );
}
