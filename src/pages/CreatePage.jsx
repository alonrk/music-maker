import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Loader2, Sliders } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PromptInput from "@/components/PromptInput";
import GenreSelector from "@/components/GenreSelector";
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12 pb-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Music className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            AI Music Maker
          </h1>
          <p className="text-lg text-white/50">
            Describe your vision, pick a genre, and let AI compose your track
          </p>
        </div>

        {/* Prompt */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-white/60 mb-2">Your Prompt</label>
          <PromptInput value={prompt} onChange={setPrompt} disabled={isGenerating} />
        </div>

        {/* Genre */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-white/60 mb-3">Choose a Genre</label>
          <GenreSelector selected={genre} onSelect={setGenre} />
        </div>

        {/* Advanced Controls */}
        <div className="mb-8">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <Sliders className="w-4 h-4" />
            {showAdvanced ? "Hide" : "Show"} Advanced Controls
          </button>

          {showAdvanced && (
            <div className="mt-4 p-5 rounded-xl bg-white/5 border border-white/10 space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">BPM</span>
                  <span className="text-emerald-400 font-mono">{bpm}</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={200}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>60</span>
                  <span>200</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Density</span>
                  <span className="text-emerald-400 font-mono">{density.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={density}
                  onChange={(e) => setDensity(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>Sparse</span>
                  <span>Dense</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Brightness</span>
                  <span className="text-emerald-400 font-mono">{brightness.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>Dark</span>
                  <span>Bright</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || (!prompt.trim() && !genre)}
          className="w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {progress || "Generating..."}
            </>
          ) : (
            <>
              <Music className="w-5 h-5" />
              Generate Track
            </>
          )}
        </button>

        {isGenerating && (
          <p className="text-center text-white/30 text-sm mt-3">
            Music is being generated in your browser via Lyria RealTime...
          </p>
        )}
      </div>
    </div>
  );
}
