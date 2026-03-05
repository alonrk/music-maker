import { useState, useRef, useEffect } from "react";
import { Plus, Loader2, X, Sparkles } from "lucide-react";
import { GENRES } from "@/utils/genres";

export default function GeneratePanel({ isOpen, onClose, onGenerate, isGenerating, progress }) {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose(true);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const handleGenerate = () => {
    onGenerate({ prompt: prompt.trim(), genre });
    setPrompt("");
    setGenre(null);
  };

  return (
    <div className="relative">
      <button
        onClick={() => isOpen ? onClose(true) : onClose(false)}
        disabled={isGenerating}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium disabled:opacity-50 whitespace-nowrap"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {progress || "Generating..."}
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Add Track
          </>
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-white/10 rounded-xl p-4 shadow-2xl shadow-black/50 z-50"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Generate New Track
            </div>
            <button onClick={() => onClose(true)} className="text-white/40 hover:text-white/70">
              <X className="w-4 h-4" />
            </button>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the track..."
            className="w-full h-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:border-emerald-500/50 mb-3"
            disabled={isGenerating}
          />

          <div className="mb-3">
            <div className="text-xs text-white/40 mb-2">Genre (optional)</div>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGenre(genre === g.id ? null : g.id)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    genre === g.id
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {g.icon} {g.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || (!prompt.trim() && !genre)}
            className="w-full py-2.5 rounded-lg font-medium text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {progress || "Generating..."}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
