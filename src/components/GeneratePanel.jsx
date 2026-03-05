import { useState } from "react";
import { Plus, Loader2, X, Sparkles } from "lucide-react";
import GenreSelector from "./GenreSelector";

export default function GeneratePanel({ isOpen, onClose, onGenerate, isGenerating, progress }) {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState(null);

  const handleGenerate = () => {
    onGenerate({ prompt: prompt.trim(), genre });
    setPrompt("");
    setGenre(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => onClose(false)}
        disabled={isGenerating}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {progress || "Generating..."}
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Generate Track
          </>
        )}
      </button>
    );
  }

  return (
    <div className="bg-slate-800/80 border border-white/10 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
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
        className="w-full h-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:border-emerald-500/50"
        disabled={isGenerating}
      />

      <GenreSelector selected={genre} onSelect={setGenre} />

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
            Add Track
          </>
        )}
      </button>
    </div>
  );
}
