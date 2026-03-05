# 02 - Light Theme Update

## Task
Update the entire UI to a light, clean theme based on a reference screenshot. The reference showed a Google/Apple-style editor with white background, blue accents, centered player controls at the top, and minimal borders.

## Changes

### Theme (index.css)
- Switched from dark (slate-950) to light (white) background
- Changed accent from emerald/green to blue-600
- Updated all CSS custom properties for light palette
- Styled scrollbar and range inputs for light theme

### Editor Page Layout
- Moved PlayerControls from bottom to top (matching reference)
- Moved zoom controls into the PlayerControls top bar (right side)
- Made Toolbar inline in a secondary bar (instead of a vertical sidebar)
- Secondary bar includes: back nav, project name, toolbar tools, generate button, save button
- Light backgrounds throughout

### Player Controls
- Centered transport: SkipBack, Play (blue circle), SkipForward
- Left: volume slider
- Right: zoom controls + time display
- Clean white top bar with subtle bottom border

### Toolbar
- Horizontal inline layout (was vertical sidebar)
- Removed zoom buttons (moved to PlayerControls)
- Light gray hover states

### Timeline Components
- **Timeline.jsx**: White bg, slate-200 borders, subtle shadow
- **TimeRuler.jsx**: White bg, small dot markers for minor ticks, light text
- **TrackRow.jsx**: Slate-50 controls area, white track lanes, light borders
- **AudioClip.jsx**: Light translucent fill, colored left border, slate text labels, blue ring when selected
- **Playhead.jsx**: Blue SVG triangle handle + blue vertical line (was green circle)

### Create Page
- White gradient background
- Blue accents throughout (icon, genre selection, generate button, sliders)
- White card-style genre selectors with subtle shadows
- White text inputs with slate borders

### Other Components
- **PromptInput**: White bg, blue sparkle icon, blue focus ring
- **GenreSelector**: White cards with blue selection state
- **GeneratePanel**: White dropdown, blue button, light borders

### Waveform
- Adjusted opacity values for light background visibility
