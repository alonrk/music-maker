import { useRef, useState, useCallback, useEffect } from "react";
import { extractWaveformData } from "@/utils/audioUtils";

export function useAudioEngine() {
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const sourceNodesRef = useRef({});
  const gainNodesRef = useRef({});
  const buffersRef = useRef({});
  const waveformsRef = useRef({});
  const startTimeRef = useRef(0);
  const pauseOffsetRef = useRef(0);
  const animFrameRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [masterVolume, setMasterVolume] = useState(0.8);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = masterVolume;
      masterGainRef.current.connect(audioContextRef.current.destination);
    }
    return audioContextRef.current;
  }, []);

  const loadTrackAudio = useCallback(async (trackId, audioUrl) => {
    const ctx = getContext();
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      buffersRef.current[trackId] = audioBuffer;
      waveformsRef.current[trackId] = extractWaveformData(audioBuffer);
      return { duration: audioBuffer.duration * 1000, waveform: waveformsRef.current[trackId] };
    } catch (err) {
      console.error(`Failed to load audio for track ${trackId}:`, err);
      return null;
    }
  }, [getContext]);

  const getWaveform = useCallback((trackId) => {
    return waveformsRef.current[trackId] || null;
  }, []);

  const schedulePlayback = useCallback((tracks, fromMs = 0) => {
    const ctx = getContext();
    Object.values(sourceNodesRef.current).forEach((node) => {
      try { node.stop(); } catch {}
    });
    sourceNodesRef.current = {};
    Object.values(gainNodesRef.current).forEach((node) => {
      try { node.disconnect(); } catch {}
    });
    gainNodesRef.current = {};

    const hasSolo = tracks.some((t) => t.solo);

    tracks.forEach((track) => {
      const buffer = buffersRef.current[track.id];
      if (!buffer) return;

      const shouldPlay = hasSolo ? track.solo : !track.muted;
      if (!shouldPlay) return;

      const trackStartMs = track.position_ms || 0;
      const offsetInTrack = Math.max(0, fromMs - trackStartMs);
      const delayMs = Math.max(0, trackStartMs - fromMs);

      if (offsetInTrack >= buffer.duration * 1000) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gainNode = ctx.createGain();
      gainNode.gain.value = track.volume !== undefined ? track.volume : 1;
      source.connect(gainNode);
      gainNode.connect(masterGainRef.current);

      source.start(ctx.currentTime + delayMs / 1000, offsetInTrack / 1000);
      sourceNodesRef.current[track.id] = source;
      gainNodesRef.current[track.id] = gainNode;
    });
  }, [getContext]);

  const play = useCallback((tracks, fromMs) => {
    const ctx = getContext();
    if (ctx.state === "suspended") ctx.resume();

    const startFrom = fromMs !== undefined ? fromMs : pauseOffsetRef.current;
    startTimeRef.current = ctx.currentTime - startFrom / 1000;
    schedulePlayback(tracks, startFrom);
    setIsPlaying(true);

    const tick = () => {
      const elapsed = (ctx.currentTime - startTimeRef.current) * 1000;
      setCurrentTime(elapsed);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, [getContext, schedulePlayback]);

  const pause = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    Object.values(sourceNodesRef.current).forEach((node) => {
      try { node.stop(); } catch {}
    });
    sourceNodesRef.current = {};

    pauseOffsetRef.current = (ctx.currentTime - startTimeRef.current) * 1000;
    setIsPlaying(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  const stop = useCallback(() => {
    Object.values(sourceNodesRef.current).forEach((node) => {
      try { node.stop(); } catch {}
    });
    sourceNodesRef.current = {};
    pauseOffsetRef.current = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  const seek = useCallback((tracks, ms) => {
    pauseOffsetRef.current = ms;
    setCurrentTime(ms);
    if (isPlaying) {
      play(tracks, ms);
    }
  }, [isPlaying, play]);

  const changeMasterVolume = useCallback((vol) => {
    setMasterVolume(vol);
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = vol;
    }
  }, []);

  const updateTrackGain = useCallback((trackId, volume) => {
    const node = gainNodesRef.current[trackId];
    if (node) node.gain.value = volume;
  }, []);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      Object.values(sourceNodesRef.current).forEach((n) => { try { n.stop(); } catch {} });
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return {
    isPlaying,
    currentTime,
    masterVolume,
    loadTrackAudio,
    getWaveform,
    play,
    pause,
    stop,
    seek,
    changeMasterVolume,
    updateTrackGain,
  };
}
