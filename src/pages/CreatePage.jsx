import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Loader2, Sliders, ChevronDown, ChevronUp, ImagePlus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { GENRES } from "@/utils/genres";
import { getTrackColor, generateId } from "@/utils/audioUtils";
import { useMusicGeneration } from "@/hooks/useMusicGeneration";

const MusicProject = base44.entities.MusicProject;

export default function CreatePage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bpm, setBpm] = useState(120);
  const [density, setDensity] = useState(0.5);
  const [brightness, setBrightness] = useState(0.5);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const { generate, isGenerating, progress } = useMusicGeneration();

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !genre && !imageFile) return;
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
        imageFile,
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

  const canGenerate = prompt.trim() || genre || imageFile;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-emerald-50/20 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col items-center">
        {/* Hero */}
        <div className="text-center pt-12 sm:pt-24 pb-6 sm:pb-10">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-slate-800 leading-tight">
            Your music, imagined
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-400 max-w-lg mx-auto px-2">
            Describe the sound in your head, upload an image for inspiration,
            and let AI compose an instrumental track.
          </p>
        </div>

        {/* Prompt card */}
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/80 p-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder="A dreamy lo-fi beat with gentle piano and warm vinyl crackle... (instrumental only)"
              rows={2}
              className="w-full px-3 sm:px-4 py-3 text-slate-700 placeholder-slate-300 resize-none focus:outline-none text-sm sm:text-base bg-transparent disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && canGenerate) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />

            {/* Image preview */}
            {imagePreview && (
              <div className="px-3 pb-2">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Inspiration"
                    className="h-20 sm:h-24 rounded-lg object-cover border border-slate-200"
                  />
                  <button
                    onClick={clearImage}
                    disabled={isGenerating}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Tags + actions row */}
            <div className="flex items-center gap-2 px-1 pb-1">
              {genre && (
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
              )}

              {/* Image upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {!imageFile && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors disabled:opacity-50"
                  title="Upload an image for inspiration"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add image</span>
                </button>
              )}

              <div className="flex-1" />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !canGenerate}
                className="px-4 sm:px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">{progress || "Creating..."}</span>
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4" />
                    <span className="hidden sm:inline">Create with AI</span>
                    <span className="sm:hidden">Create</span>
                  </>
                )}
              </button>
            </div>
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
                {imageFile ? "Analyzing image & composing..." : "Composing your track with Lyria..."}
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
        <div className="mt-6 sm:mt-8 text-center w-full max-w-2xl">
          <p className="text-xs sm:text-sm text-slate-400 mb-3">
            Not sure where to start? Try one of these:
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => handleChipClick(g)}
                disabled={isGenerating}
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition-all duration-150 border disabled:opacity-50
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
        <div className="mt-8 sm:mt-10 w-full max-w-2xl">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mx-auto flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-500 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            Advanced
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
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

        <div className="h-16 sm:h-24" />
      </div>
    </div>
  );
}
