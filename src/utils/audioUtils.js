export function extractWaveformData(audioBuffer, numSamples = 200) {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / numSamples);
  const peaks = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    let sum = 0;
    const start = i * blockSize;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(channelData[start + j] || 0);
    }
    peaks[i] = sum / blockSize;
  }

  const max = Math.max(...peaks) || 1;
  for (let i = 0; i < peaks.length; i++) {
    peaks[i] = peaks[i] / max;
  }

  return peaks;
}

export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor((ms % 1000) / 10);
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(2, "0")}`;
}

export function msToPixels(ms, pixelsPerSecond) {
  return (ms / 1000) * pixelsPerSecond;
}

export function pixelsToMs(px, pixelsPerSecond) {
  return (px / pixelsPerSecond) * 1000;
}

const TRACK_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
];

export function getTrackColor(index) {
  return TRACK_COLORS[index % TRACK_COLORS.length];
}

export function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
