# EP-Rehab

A simple, private rehab & mobility tracker — built for slow, hard-to-measure
recovery where raw numbers (reps, weights) don't tell the real story.

Instead of chasing numbers, it tracks the things that actually show progress
in rehab:

- **Consistency** — a streak and a 5-week calendar, because showing up is the win.
- **Felt-sense check-ins** — quick sliders for effort, pain, mobility (how
  freely you moved) and energy, trended over weeks so slow change becomes visible.
- **"Easier / same / harder than last time"** per exercise — relative progress
  without needing exact figures.
- **Wins & milestones** — a log of functional achievements ("knelt without pain",
  "first stair without the rail") that capture progress the numbers miss.

## How it works

- Everything is stored **privately in your browser** (localStorage) — no account,
  no server, no data leaves the device.
- Use **Settings → Export / Import** to back up your data or move it to another
  device.

## Tech

Vite + React + TypeScript + Tailwind CSS v4. Static build, deploys anywhere.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
```
