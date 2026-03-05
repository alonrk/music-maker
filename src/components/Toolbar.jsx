import { Scissors, Copy, Trash2, Repeat, CropIcon, ZoomIn, ZoomOut } from "lucide-react";

const tools = [
  { id: "split", label: "Split", icon: Scissors },
  { id: "duplicate", label: "Duplicate", icon: Copy },
  { id: "delete", label: "Delete", icon: Trash2 },
  { id: "loop", label: "Loop", icon: Repeat },
  { id: "trim", label: "Trim", icon: CropIcon },
];

export default function Toolbar({
  selectedClipId,
  onAction,
  onZoomIn,
  onZoomOut,
}) {
  return (
    <div className="w-16 bg-slate-800/60 border-l border-white/10 flex flex-col items-center py-3 gap-1">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const disabled = !selectedClipId && tool.id !== "split";
        return (
          <button
            key={tool.id}
            onClick={() => onAction(tool.id)}
            disabled={disabled}
            className={`w-12 h-12 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors
              ${disabled
                ? "text-white/20 cursor-not-allowed"
                : "text-white/60 hover:text-white hover:bg-white/10"
              }
            `}
            title={tool.label}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[9px]">{tool.label}</span>
          </button>
        );
      })}

      <div className="flex-1" />

      <div className="border-t border-white/10 pt-2 flex flex-col gap-1">
        <button
          onClick={onZoomIn}
          className="w-12 h-10 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="w-12 h-10 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
