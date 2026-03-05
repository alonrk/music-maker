import { Sparkles } from "lucide-react";

export default function PromptInput({ value, onChange, disabled }) {
  return (
    <div className="relative">
      <div className="absolute top-4 left-4 text-blue-500">
        <Sparkles className="w-5 h-5" />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Describe the music you want to create... e.g. 'A dreamy lo-fi beat with gentle piano and warm vinyl crackle'"
        className="w-full h-32 pl-12 pr-4 pt-4 pb-4 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-300 resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all disabled:opacity-50 shadow-sm"
      />
    </div>
  );
}
