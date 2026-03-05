import { useState, useEffect } from "react";
import { Key, Check, Eye, EyeOff } from "lucide-react";
import { setApiKey, hasApiKey } from "@/hooks/useMusicGeneration";

export default function ApiKeyInput({ onKeySet }) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(hasApiKey());
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("gemini_api_key") || "";
    if (stored) setKey(stored);
  }, []);

  const handleSave = () => {
    if (!key.trim()) return;
    setApiKey(key.trim());
    setSaved(true);
    onKeySet?.();
  };

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Key className="w-4 h-4 text-emerald-400" />
        <span className="text-sm font-medium text-white/70">Gemini API Key</span>
        {saved && <Check className="w-4 h-4 text-emerald-400" />}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type={show ? "text" : "password"}
            value={key}
            onChange={(e) => { setKey(e.target.value); setSaved(false); }}
            placeholder="Paste your Google AI Studio API key..."
            className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
        >
          Save
        </button>
      </div>
      <p className="text-xs text-white/30 mt-2">
        Get your key at{" "}
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-emerald-400/60 hover:text-emerald-400 underline">
          aistudio.google.com
        </a>
        . Stored locally in your browser only.
      </p>
    </div>
  );
}
