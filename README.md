# AI Music Maker

Generate and arrange music using Google's Lyria RealTime AI model. Built with React, Web Audio API, and Base44.

## Features

- **AI-first creation** -- describe your track with a text prompt and let Lyria compose it
- **Genre selection** -- pick from 12 genres (Electronic, Jazz, Lo-Fi, Cinematic, etc.)
- **Multi-track timeline editor** -- drag, trim, split, duplicate, loop, and delete clips
- **Waveform visualization** -- canvas-rendered waveforms per clip
- **Real-time playback** -- Web Audio API engine with per-track mute/solo and master volume
- **Advanced controls** -- BPM, density, brightness sliders

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind CSS v4 |
| Music AI | Google Lyria RealTime (`@google/genai`) |
| Audio | Web Audio API, canvas waveforms |
| Backend | Base44 (entities, file storage) |

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, paste your [Google AI Studio API key](https://aistudio.google.com/app/apikey), and start generating.

## Project Structure

```
src/
  pages/
    CreatePage.jsx              # Prompt + genre selection
    EditorPage.jsx              # Timeline editor
  components/
    Timeline/
      Timeline.jsx              # Main timeline container
      TimeRuler.jsx             # Time ruler with ticks
      TrackRow.jsx              # Track lane with controls
      AudioClip.jsx             # Draggable clip with waveform
      Playhead.jsx              # Moving playhead line
    Toolbar.jsx                 # Split / Duplicate / Delete / Loop / Trim
    PlayerControls.jsx          # Play / Pause / Stop, volume
    GeneratePanel.jsx           # Add track via AI prompt
    GenreSelector.jsx           # Genre card grid
    PromptInput.jsx             # Prompt textarea
    ApiKeyInput.jsx             # API key management
  hooks/
    useMusicGeneration.js       # Lyria RealTime client-side generation
    useAudioEngine.js           # Web Audio API multi-track engine
    useTimeline.js              # Zoom, scroll, selection state
    useWaveform.js              # Canvas waveform rendering
  utils/
    audioUtils.js               # WAV helpers, colors, IDs
    genres.js                   # Genre definitions

base44/
  entities/
    music-project.jsonc         # MusicProject schema (tracks embedded)
  functions/
    generate-music/             # Server-side generation (fallback)
```

## Base44 CLI

```bash
npx base44 login              # Authenticate
npx base44 entities push      # Push entity schemas
npx base44 functions deploy   # Deploy backend functions
npx base44 deploy             # Deploy everything
```

## License

MIT
