import { Sparkles } from "lucide-react";

export default function PromptInput({ value, onChange, disabled }) {
  return (
    <div className="relative">
      <div className="absolute top-4 left-4 text-emerald-400">
        <Sparkles className="w-5 h-5" />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Describe the music you want to create... e.g. 'A dreamy lo-fi beat with gentle piano and warm vinyl crackle'"
        className="w-full h-32 pl-12 pr-4 pt-4 pb-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all disabled:opacity-50"
      />
    </div>
  );
}
