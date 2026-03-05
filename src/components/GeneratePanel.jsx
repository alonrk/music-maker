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
        className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 whitespace-nowrap"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {progress || "Generating..."}
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5" />
            Add Track
          </>
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl p-4 shadow-xl z-50"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Generate New Track
            </div>
            <button onClick={() => onClose(true)} className="text-slate-300 hover:text-slate-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the track..."
            className="w-full h-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-300 text-sm resize-none focus:outline-none focus:border-blue-400 mb-3"
            disabled={isGenerating}
          />

          <div className="mb-3">
            <div className="text-xs text-slate-400 mb-2">Genre (optional)</div>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGenre(genre === g.id ? null : g.id)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    genre === g.id
                      ? "bg-blue-50 text-blue-600 border border-blue-300"
                      : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
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
            className="w-full py-2.5 rounded-lg font-medium text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
