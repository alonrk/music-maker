import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Timeline from "@/components/Timeline/Timeline";
import Toolbar from "@/components/Toolbar";
import PlayerControls from "@/components/PlayerControls";
import GeneratePanel from "@/components/GeneratePanel";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useTimeline } from "@/hooks/useTimeline";
import { useMusicGeneration } from "@/hooks/useMusicGeneration";
import { getTrackColor, generateId } from "@/utils/audioUtils";

const MusicProject = base44.entities.MusicProject;

export default function EditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [trackRows, setTrackRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [generatePanelOpen, setGeneratePanelOpen] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  const engine = useAudioEngine();
  const timeline = useTimeline();
  const musicGen = useMusicGeneration();

  useEffect(() => {
    async function load() {
      try {
        const p = await MusicProject.get(projectId);
        setProject(p);
        const projectTracks = p.tracks || [];
        setTracks(projectTracks);

        const maxRow = projectTracks.reduce((max, t) => Math.max(max, t.track_row ?? 0), -1);
        const rows = [];
        for (let i = 0; i <= Math.max(maxRow, 0); i++) {
          rows.push({ muted: false, solo: false });
        }
        projectTracks.forEach((t) => {
          const row = t.track_row ?? 0;
          if (rows[row]) {
            if (t.muted) rows[row].muted = true;
            if (t.solo) rows[row].solo = true;
          }
        });
        setTrackRows(rows.length > 0 ? rows : [{ muted: false, solo: false }]);
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [projectId]);

  useEffect(() => {
    if (tracks.length === 0) return;
    let cancelled = false;

    async function loadAll() {
      const promises = tracks.map(async (t) => {
        if (t.audio_url) {
          const result = await engine.loadTrackAudio(t.id, t.audio_url);
          if (result && !cancelled) {
            setTracks((prev) =>
              prev.map((tr) =>
                tr.id === t.id ? { ...tr, duration_ms: tr.duration_ms || result.duration } : tr
              )
            );
          }
        }
      });
      await Promise.all(promises);
      if (!cancelled) setAudioLoaded(true);
    }

    loadAll();
    return () => { cancelled = true; };
  }, [tracks.length]);

  const totalDuration = useMemo(() => {
    if (tracks.length === 0) return 30000;
    return tracks.reduce((max, t) => Math.max(max, (t.position_ms || 0) + (t.duration_ms || 0)), 0);
  }, [tracks]);

  const playbackTracks = useMemo(() => {
    return tracks.map((t) => {
      const row = trackRows[t.track_row ?? 0] || {};
      return { ...t, muted: row.muted, solo: row.solo };
    });
  }, [tracks, trackRows]);

  const handlePlay = useCallback(() => {
    engine.play(playbackTracks);
  }, [engine, playbackTracks]);

  const handlePause = useCallback(() => {
    engine.pause();
  }, [engine]);

  const handleStop = useCallback(() => {
    engine.stop();
  }, [engine]);

  const handleSeek = useCallback((ms) => {
    engine.seek(playbackTracks, ms);
  }, [engine, playbackTracks]);

  const handleToggleMute = useCallback((rowIndex) => {
    setTrackRows((prev) =>
      prev.map((r, i) => (i === rowIndex ? { ...r, muted: !r.muted } : r))
    );
  }, []);

  const handleToggleSolo = useCallback((rowIndex) => {
    setTrackRows((prev) =>
      prev.map((r, i) => (i === rowIndex ? { ...r, solo: !r.solo } : r))
    );
  }, []);

  const handleClipDragEnd = useCallback((clipId, newPosition, trackRow, isPreview) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === clipId ? { ...t, position_ms: Math.round(newPosition) } : t
      )
    );
  }, []);

  const handleClipTrimEnd = useCallback((clipId, newDuration, isPreview) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === clipId ? { ...t, duration_ms: Math.round(newDuration) } : t
      )
    );
  }, []);

  const handleToolbarAction = useCallback((action) => {
    const clipId = timeline.selectedClipId;

    switch (action) {
      case "split": {
        const clip = tracks.find((t) => t.id === clipId);
        if (!clip) return;
        const splitPoint = engine.currentTime;
        const clipStart = clip.position_ms || 0;
        const clipEnd = clipStart + clip.duration_ms;

        if (splitPoint <= clipStart || splitPoint >= clipEnd) return;

        const leftDuration = splitPoint - clipStart;
        const rightDuration = clipEnd - splitPoint;

        setTracks((prev) => [
          ...prev.filter((t) => t.id !== clipId),
          { ...clip, duration_ms: leftDuration },
          {
            ...clip,
            id: generateId(),
            name: clip.name + " (R)",
            position_ms: splitPoint,
            duration_ms: rightDuration,
          },
        ]);
        break;
      }
      case "duplicate": {
        const clip = tracks.find((t) => t.id === clipId);
        if (!clip) return;
        setTracks((prev) => [
          ...prev,
          {
            ...clip,
            id: generateId(),
            name: clip.name + " (copy)",
            position_ms: (clip.position_ms || 0) + clip.duration_ms + 500,
          },
        ]);
        break;
      }
      case "delete": {
        setTracks((prev) => prev.filter((t) => t.id !== clipId));
        timeline.setSelectedClipId(null);
        break;
      }
      case "loop": {
        const clip = tracks.find((t) => t.id === clipId);
        if (!clip) return;
        const copies = [];
        for (let i = 1; i <= 3; i++) {
          copies.push({
            ...clip,
            id: generateId(),
            name: `${clip.name} (${i + 1})`,
            position_ms: (clip.position_ms || 0) + clip.duration_ms * i,
          });
        }
        setTracks((prev) => [...prev, ...copies]);
        break;
      }
      case "trim": {
        break;
      }
    }
  }, [tracks, timeline.selectedClipId, engine.currentTime]);

  const handleGenerateTrack = useCallback(async ({ prompt, genre }) => {
    try {
      const result = await musicGen.generate({
        prompt,
        genre,
        bpm: project?.bpm || 120,
        density: 0.5,
        brightness: 0.5,
        guidance: 4.0,
        durationChunks: 15,
      });

      const newRow = trackRows.length;
      const newTrack = {
        id: generateId(),
        name: `Track ${newRow + 1}`,
        audio_url: result.audio_url,
        prompt,
        genre: genre || "",
        position_ms: 0,
        duration_ms: result.duration_ms,
        track_row: newRow,
        muted: false,
        solo: false,
        color: getTrackColor(newRow),
      };

      setTracks((prev) => [...prev, newTrack]);
      setTrackRows((prev) => [...prev, { muted: false, solo: false }]);
      setGeneratePanelOpen(false);

      await engine.loadTrackAudio(newTrack.id, newTrack.audio_url);
    } catch (err) {
      console.error("Failed to generate track:", err);
      alert(err.message || "Track generation failed. Please try again.");
    }
  }, [project, trackRows.length, engine, musicGen]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await MusicProject.update(projectId, {
        tracks: tracks.map((t, i) => ({
          ...t,
          muted: trackRows[t.track_row]?.muted || false,
          solo: trackRows[t.track_row]?.solo || false,
        })),
      });
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setIsSaving(false);
    }
  }, [projectId, tracks, trackRows]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 text-slate-800 flex flex-col overflow-hidden">
      {/* Top bar: player controls + transport */}
      <PlayerControls
        isPlaying={engine.isPlaying}
        currentTime={engine.currentTime}
        totalDuration={totalDuration}
        masterVolume={engine.masterVolume}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onVolumeChange={engine.changeMasterVolume}
        onZoomIn={timeline.zoomIn}
        onZoomOut={timeline.zoomOut}
      />

      {/* Secondary bar: nav, tools, generate, save */}
      <div className="h-10 bg-white border-b border-slate-200 flex items-center px-3 gap-2 flex-shrink-0">
        <button
          onClick={() => navigate("/")}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-sm font-medium text-slate-600 truncate">
          {project?.name || "Untitled Project"}
        </div>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <Toolbar
          selectedClipId={timeline.selectedClipId}
          onAction={handleToolbarAction}
        />

        <div className="flex-1" />

        <GeneratePanel
          isOpen={generatePanelOpen}
          onClose={(close) => setGeneratePanelOpen(!close)}
          onGenerate={handleGenerateTrack}
          isGenerating={musicGen.isGenerating}
          progress={musicGen.progress}
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600 hover:text-slate-800 transition-colors"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save
        </button>
      </div>

      {/* Main area: timeline only */}
      <div className="flex-1 flex overflow-hidden p-2">
        <Timeline
          tracks={tracks}
          trackRows={trackRows}
          pixelsPerSecond={timeline.pixelsPerSecond}
          currentTimeMs={engine.currentTime}
          selectedClipId={timeline.selectedClipId}
          onSelectClip={timeline.setSelectedClipId}
          onToggleMute={handleToggleMute}
          onToggleSolo={handleToggleSolo}
          onClipDragEnd={handleClipDragEnd}
          onClipTrimEnd={handleClipTrimEnd}
          onSeek={handleSeek}
          getWaveform={engine.getWaveform}
        />
      </div>
    </div>
  );
}
