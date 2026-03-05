import { createClientFromRequest } from "npm:@base44/sdk";
import { GoogleGenAI, Scale } from "npm:@google/genai";

const MODEL_ID = "models/lyria-realtime-exp";

const SCALE_MAP: Record<string, any> = {
  "C_MAJOR": Scale.C_MAJOR_A_MINOR,
  "D_MAJOR": Scale.D_MAJOR_B_MINOR,
  "E_MAJOR": Scale.E_MAJOR_C_SHARP_MINOR,
  "F_MAJOR": Scale.F_MAJOR_D_MINOR,
  "G_MAJOR": Scale.G_MAJOR_E_MINOR,
  "A_MAJOR": Scale.A_MAJOR_F_SHARP_MINOR,
  "B_MAJOR": Scale.B_MAJOR_G_SHARP_MINOR,
};

function buildWavHeader(pcmDataLength: number): Uint8Array {
  const sampleRate = 48000;
  const numChannels = 2;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const headerSize = 44;
  const header = new ArrayBuffer(headerSize);
  const view = new DataView(header);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + pcmDataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, "data");
  view.setUint32(40, pcmDataLength, true);

  return new Uint8Array(header);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { prompt, genre, bpm, density, brightness, guidance, duration_chunks } = await req.json();

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });

    const maxChunks = duration_chunks || 10;
    const audioChunks: number[][] = [];
    let sessionClosed = false;

    const weightedPrompts = [];
    if (genre) {
      weightedPrompts.push({ text: genre, weight: 1.0 });
    }
    if (prompt) {
      weightedPrompts.push({ text: prompt, weight: 1.5 });
    }
    if (weightedPrompts.length === 0) {
      weightedPrompts.push({ text: "ambient electronic", weight: 1.0 });
    }

    const musicConfig: Record<string, any> = {};
    if (bpm) musicConfig.bpm = bpm;
    if (density !== undefined) musicConfig.density = density;
    if (brightness !== undefined) musicConfig.brightness = brightness;
    if (guidance !== undefined) musicConfig.guidance = guidance;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        sessionClosed = true;
        reject(new Error("Music generation timed out"));
      }, 60000);

      ai.live.music.connect({
        model: MODEL_ID,
        callbacks: {
          onmessage: (message: any) => {
            if (message?.audioChunk?.data) {
              const audioBuffer = base64ToUint8Array(message.audioChunk.data);
              const intArray = new Int16Array(
                audioBuffer.buffer,
                audioBuffer.byteOffset,
                audioBuffer.length / Int16Array.BYTES_PER_ELEMENT
              );
              audioChunks.push(Array.from(intArray));

              if (audioChunks.length >= maxChunks) {
                sessionClosed = true;
                clearTimeout(timeout);
                resolve();
              }
            }
          },
          onerror: (error: any) => {
            clearTimeout(timeout);
            reject(new Error(`Lyria session error: ${error}`));
          },
          onclose: () => {
            clearTimeout(timeout);
            if (!sessionClosed) {
              resolve();
            }
          },
        },
      }).then((session) => {
        session.setWeightedPrompts({ weightedPrompts });
        session.setMusicGenerationConfig({ musicGenerationConfig: musicConfig });
        session.play();
      }).catch(reject);
    });

    const pcmData = new Int16Array(audioChunks.flat());
    const pcmBytes = new Uint8Array(pcmData.buffer);
    const wavHeader = buildWavHeader(pcmBytes.length);

    const wavFile = new Uint8Array(wavHeader.length + pcmBytes.length);
    wavFile.set(wavHeader, 0);
    wavFile.set(pcmBytes, wavHeader.length);

    const blob = new Blob([wavFile], { type: "audio/wav" });
    const file = new File([blob], `track-${Date.now()}.wav`, { type: "audio/wav" });

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const sampleRate = 48000;
    const numChannels = 2;
    const durationMs = Math.round((pcmData.length / numChannels / sampleRate) * 1000);

    return Response.json({
      audio_url: file_url,
      duration_ms: durationMs,
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Failed to generate music" },
      { status: 500 }
    );
  }
});
