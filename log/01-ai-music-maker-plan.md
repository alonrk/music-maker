# AI Music Maker - Plan & Implementation Log

## Overview
AI-first music maker web app using Google's Lyria RealTime API for track generation.
Built on Base44 platform (Vite + React + Tailwind) with a multi-track timeline editor.

## Architecture
- **Frontend**: React + Vite + Tailwind, Web Audio API, Canvas waveforms
- **Backend**: Base44 backend function (Deno) calling Lyria RealTime via `@google/genai`
- **Model**: `lyria-realtime-exp` (Lyria RealTime, experimental, via Gemini API key)
- **Storage**: Base44 entities + file storage

## Data Model
- **MusicProject**: name, description, bpm, embedded tracks array

## Key Decisions
- Using Lyria RealTime (WebSocket-based) rather than Lyria 2 (Vertex AI REST) since the user has a Google AI Studio project
- No auth for MVP - focus on creation + editing flow
- Single entity with embedded tracks for simplicity
- Canvas-based waveform rendering (no external waveform library)
- Web Audio API for multi-track playback with per-track gain nodes

## Implementation Notes
- Backend function collects ~10 audio chunks from Lyria RealTime, assembles into WAV (48kHz, 16-bit, stereo)
- Timeline UI inspired by multiline audio editor reference image (dark theme, colored waveforms, mute/solo per track)
- Toolbar: Split, Duplicate, Delete, Loop, Trim
- Genre options: Electronic, Rock, Jazz, Classical, Hip Hop, Ambient, Lo-Fi, Pop, R&B, Cinematic, Folk, Latin
