import { useEffect, useRef } from "react";

export function useWaveform(canvasRef, waveformData, color, width, height) {
  const prevDataRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData || waveformData.length === 0) return;
    if (prevDataRef.current === waveformData && canvas.width === width) return;
    prevDataRef.current = waveformData;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    const barWidth = Math.max(1, width / waveformData.length - 0.5);
    const mid = height / 2;

    ctx.fillStyle = color + "40";
    ctx.beginPath();
    for (let i = 0; i < waveformData.length; i++) {
      const x = (i / waveformData.length) * width;
      const barHeight = waveformData[i] * mid * 0.9;
      ctx.rect(x, mid - barHeight, barWidth, barHeight * 2);
    }
    ctx.fill();

    ctx.strokeStyle = color + "90";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < waveformData.length; i++) {
      const x = (i / waveformData.length) * width;
      const y = mid - waveformData[i] * mid * 0.9;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = waveformData.length - 1; i >= 0; i--) {
      const x = (i / waveformData.length) * width;
      const y = mid + waveformData[i] * mid * 0.9;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }, [canvasRef, waveformData, color, width, height]);
}
