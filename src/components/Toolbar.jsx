import { Scissors, Copy, Trash2, Repeat, CropIcon } from "lucide-react";

const tools = [
  { id: "split", label: "Split", icon: Scissors },
  { id: "duplicate", label: "Duplicate", icon: Copy },
  { id: "delete", label: "Delete", icon: Trash2 },
  { id: "loop", label: "Loop", icon: Repeat },
  { id: "trim", label: "Trim", icon: CropIcon },
];

export default function Toolbar({ selectedClipId, onAction }) {
  return (
    <div className="flex items-center gap-0.5 px-2">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const disabled = !selectedClipId && tool.id !== "split";
        return (
          <button
            key={tool.id}
            onClick={() => onAction(tool.id)}
            disabled={disabled}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors
              ${disabled
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }
            `}
            title={tool.label}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
