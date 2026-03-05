import { useState, useCallback } from "react";

const MIN_PPS = 20;
const MAX_PPS = 400;
const DEFAULT_PPS = 100;

export function useTimeline() {
  const [pixelsPerSecond, setPixelsPerSecond] = useState(DEFAULT_PPS);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selectedClipId, setSelectedClipId] = useState(null);

  const zoomIn = useCallback(() => {
    setPixelsPerSecond((prev) => Math.min(prev * 1.3, MAX_PPS));
  }, []);

  const zoomOut = useCallback(() => {
    setPixelsPerSecond((prev) => Math.max(prev / 1.3, MIN_PPS));
  }, []);

  const resetZoom = useCallback(() => {
    setPixelsPerSecond(DEFAULT_PPS);
  }, []);

  return {
    pixelsPerSecond,
    scrollLeft,
    setScrollLeft,
    selectedClipId,
    setSelectedClipId,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}
