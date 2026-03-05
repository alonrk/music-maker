import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Loader2, Sliders, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { GENRES } from "@/utils/genres";
import { getTrackColor, generateId } from "@/utils/audioUtils";
import { useMusicGeneration } from "@/hooks/useMusicGeneration";

const MusicProject = base44.entities.MusicProject;

export default function CreatePage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState(null);
  const [bpm, setBpm] = useState(120);
  const [density, setDensity] = useState(0.5);
  const [brightness, setBrightness] = useState(0.5);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState(null);

  const { generate, isGenerating, progress } = useMusicGeneration();

  const handleGenerate = async () => {
    if (!prompt.trim() && !genre) return;
    setError(null);

    try {
      const result = await generate({
        prompt: prompt.trim(),
        genre,
        bpm,
        density,
        brightness,
        guidance: 4.0,
        durationChunks: 15,
      });

      const project = await MusicProject.create({
        name: prompt.trim().slice(0, 50) || genre || "Untitled Project",
        description: prompt.trim(),
        bpm,
        tracks: [
          {
            id: generateId(),
            name: "Track 1",
            audio_url: result.audio_url,
            prompt: prompt.trim(),
            genre: genre || "",
            position_ms: 0,
            duration_ms: result.duration_ms,
            track_row: 0,
            muted: false,
            solo: false,
            color: getTrackColor(0),
          },
        ],
      });

      navigate(`/editor/${project.id}`);
    } catch (err) {
      console.error("Generation failed:", err);
      setError(err.message || "Music generation failed. Please try again.");
    }
  };

  const handleChipClick = (g) => {
    setGenre(genre === g.id ? null : g.id);
    if (!prompt.trim()) {
      setPrompt(g.description);
    }
  };

  const canGenerate = prompt.trim() || genre;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-emerald-50/20 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 flex flex-col items-center">
        {/* Hero */}
        <div className="text-center pt-24 pb-10">
          <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-slate-800 leading-tight">
            Your music, imagined
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-lg mx-auto">
            Describe the sound in your head and let AI bring it to life
            as a fully produced track.
          </p>
        </div>

        {/* Prompt card */}
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/80 p-2">
            <div className="flex items-start gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                placeholder="A dreamy lo-fi beat with gentle piano and warm vinyl crackle..."
                rows={2}
                className="flex-1 px-4 py-3 text-slate-700 placeholder-slate-300 resize-none focus:outline-none text-base bg-transparent disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && canGenerate) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !canGenerate}
                className="flex-shrink-0 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 mt-0.5"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">{progress || "Creating..."}</span>
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4" />
                    <span>Create with AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Selected genre tag inside card */}
            {genre && (
              <div className="px-3 pb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">
                  {GENRES.find((g) => g.id === genre)?.icon}{" "}
                  {GENRES.find((g) => g.id === genre)?.label}
                  <button
                    onClick={() => setGenre(null)}
                    className="ml-1 text-blue-400 hover:text-blue-600"
                  >
                    &times;
                  </button>
                </span>
              </div>
            )}
          </div>

          {isGenerating && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-blue-400 rounded-full animate-pulse"
                    style={{
                      height: `${12 + Math.random() * 16}px`,
                      animationDelay: `${i * 150}ms`,
                      animationDuration: "800ms",
                    }}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-400">
                Composing your track with Lyria...
              </p>
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm text-center">
              {error}
            </div>
          )}
        </div>

        {/* Genre chips */}
        <div className="mt-8 text-center w-full max-w-2xl">
          <p className="text-sm text-slate-400 mb-3">
            Not sure where to start? Try one of these:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => handleChipClick(g)}
                disabled={isGenerating}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all duration-150 border disabled:opacity-50
                  ${genre === g.id
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm"
                  }
                `}
              >
                <span>{g.icon}</span>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced controls toggle */}
        <div className="mt-10 w-full max-w-2xl">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mx-auto flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-500 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            Advanced
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">BPM</span>
                  <span className="text-slate-700 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{bpm}</span>
                </div>
                <input
                  type="range" min={60} max={200} value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-300 mt-1">
                  <span>60</span><span>200</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Density</span>
                  <span className="text-slate-700 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{density.toFixed(1)}</span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.1} value={density}
                  onChange={(e) => setDensity(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-300 mt-1">
                  <span>Sparse</span><span>Dense</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Brightness</span>
                  <span className="text-slate-700 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{brightness.toFixed(1)}</span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.1} value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-300 mt-1">
                  <span>Dark</span><span>Bright</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-24" />
      </div>
    </div>
  );
}
