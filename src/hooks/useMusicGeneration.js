import { useState, useRef, useCallback } from "react";
import { GoogleGenAI } from "@google/genai";
import { base44 } from "@/api/base44Client";

const MODEL_ID = "models/lyria-realtime-exp";
const SAMPLE_RATE = 48000;
const NUM_CHANNELS = 2;
const BITS_PER_SAMPLE = 16;

let cachedKey = null;

async function getApiKey() {
  if (cachedKey) return cachedKey;
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    cachedKey = import.meta.env.VITE_GEMINI_API_KEY;
    return cachedKey;
  }
  const res = await base44.functions.invoke("get-api-key");
  if (res?.key) {
    cachedKey = res.key;
    return cachedKey;
  }
  return "";
}

function buildWavBlob(pcmData) {
  const pcmBytes = new Uint8Array(pcmData.buffer);
  const byteRate = SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
  const blockAlign = NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + pcmBytes.length);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + pcmBytes.length, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, NUM_CHANNELS, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, BITS_PER_SAMPLE, true);
  writeStr(36, "data");
  view.setUint32(40, pcmBytes.length, true);

  new Uint8Array(buffer, headerSize).set(pcmBytes);
  return new Blob([buffer], { type: "audio/wav" });
}

export function useMusicGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const sessionRef = useRef(null);

  const generate = useCallback(async ({ prompt, genre, bpm, density, brightness, guidance, durationChunks }) => {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error("No Gemini API key configured. Add GEMINI_API_KEY in Base44 secrets.");
    }

    setIsGenerating(true);
    setProgress("Connecting to Lyria...");

    try {
      const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });
      const maxChunks = durationChunks || 15;
      const audioChunks = [];

      const weightedPrompts = [];
      if (genre) weightedPrompts.push({ text: genre, weight: 1.0 });
      if (prompt) weightedPrompts.push({ text: prompt, weight: 1.5 });
      if (weightedPrompts.length === 0) weightedPrompts.push({ text: "ambient electronic", weight: 1.0 });

      const musicConfig = {};
      if (bpm) musicConfig.bpm = bpm;
      if (density !== undefined) musicConfig.density = density;
      if (brightness !== undefined) musicConfig.brightness = brightness;
      if (guidance !== undefined) musicConfig.guidance = guidance;

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          try { sessionRef.current?.close(); } catch {}
          if (audioChunks.length > 0) {
            resolve();
          } else {
            reject(new Error("Music generation timed out with no audio received."));
          }
        }, 45000);

        setProgress("Starting music session...");

        ai.live.music.connect({
          model: MODEL_ID,
          callbacks: {
            onmessage: (message) => {
              if (message?.audioChunk?.data) {
                const raw = atob(message.audioChunk.data);
                const bytes = new Uint8Array(raw.length);
                for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
                const samples = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.length / 2);
                audioChunks.push(Array.from(samples));

                setProgress(`Receiving audio... (${audioChunks.length}/${maxChunks} chunks)`);

                if (audioChunks.length >= maxChunks) {
                  clearTimeout(timeout);
                  try { sessionRef.current?.close(); } catch {}
                  resolve();
                }
              }
            },
            onerror: (error) => {
              clearTimeout(timeout);
              reject(new Error(`Lyria error: ${error?.message || error}`));
            },
            onclose: () => {
              clearTimeout(timeout);
              if (audioChunks.length > 0) {
                resolve();
              } else {
                reject(new Error("Session closed before receiving audio. Check your API key and quota."));
              }
            },
          },
        }).then((session) => {
          sessionRef.current = session;
          session.setWeightedPrompts({ weightedPrompts });
          session.setMusicGenerationConfig({ musicGenerationConfig: musicConfig });
          setProgress("Generating music...");
          session.play();
        }).catch((err) => {
          clearTimeout(timeout);
          reject(new Error(`Failed to connect: ${err?.message || err}`));
        });
      });

      setProgress("Assembling audio...");

      const allSamples = new Int16Array(audioChunks.flat());
      const durationMs = Math.round((allSamples.length / NUM_CHANNELS / SAMPLE_RATE) * 1000);

      if (durationMs < 500) {
        throw new Error(`Generated audio too short (${durationMs}ms). Try a different prompt.`);
      }

      const wavBlob = buildWavBlob(allSamples);

      setProgress("Uploading track...");
      const file = new File([wavBlob], `track-${Date.now()}.wav`, { type: "audio/wav" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      setProgress("");
      return { audio_url: file_url, duration_ms: durationMs };
    } catch (err) {
      setProgress("");
      throw err;
    } finally {
      sessionRef.current = null;
      setIsGenerating(false);
    }
  }, []);

  const cancel = useCallback(() => {
    try { sessionRef.current?.close(); } catch {}
    sessionRef.current = null;
    setIsGenerating(false);
    setProgress("");
  }, []);

  return { generate, cancel, isGenerating, progress };
}
