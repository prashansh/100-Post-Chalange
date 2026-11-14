# 🎯 100 Post Challenge • Creator Content Publishing Tracker

An interactive app to track, plan, and monitor your **100 Days of Content Publishing** challenge.

Built with **React 18, TypeScript, Tailwind CSS, Vite, and Lucide Icons**.

---

## ✨ Features

- **100-Post Grid matching your design**:
  - **Completed Posts (1–8)**: Solid green with `✓` checkmarks.
  - **Next Up (Day 9)**: Active orange/coral dashed border indicator.
  - **Milestone Days (10, 15, 30, 50, 75, 100)**: Vibrant yellow boxes with 🎁 gift boxes and 🏆 trophy on Day 100.
  - **Upcoming Posts**: Clean sand/cream cards with quick hover previews.
- **Deep Day Detail Page** (Opens on clicking any box or navigating to `#/day/:number`):
  - 💡 **Idea & Angle**: Core concept, target audience, and retention strategy.
  - 🪝 **3-Second Hook System**:
    - **Spoken Hook**: First verbal sentence.
    - **Text Overlay Hook**: High-contrast headline on screen.
    - **Visual Hook**: Physical movement / pattern interrupt.
  - 📝 **Script & Outline**: Full voiceover script editor with **live word count & speaking time calculator** (~140 wpm), key talking points checklist, and Call To Action (CTA).
  - 🎬 **Visuals & B-Roll**: Content format selector (9:16 Vertical Video, Carousel, Long-form, Text/Graphic), interactive shot checklist, thumbnail concepts, and aesthetic notes.
  - ⏰ **Publish Date ETA**: Target date & time picker, countdown badge, and platform selection (Instagram Reels, YouTube Shorts, TikTok, LinkedIn, X, Threads).
  - 📊 **Post-Mortem & Performance**: Record views, likes, comments, shares, and key learnings.
- **🎥 Teleprompter Mode**: Full-screen scrolling prompter with speed controls (0.5x–5x), adjustable font size, spacebar play/pause, and mirror mode for camera glass rigs.
- **🎁 Milestone Rewards**: Customizable reward incentives for consistency (e.g. coffee treat, new mic, weekend getaway, digital product launch).
- **📈 Analytics Dashboard**: Total reach, views, likes, current streak, production pipeline breakdown, and platform distribution.
- **💾 Auto-Save & Data Portability**: Instant LocalStorage persistence + Export to CSV (Excel/Google Sheets) and JSON backup.
- **⌨️ Keyboard Shortcuts**:
  - `←` / `→` arrow keys: Navigate between days.
  - `Esc`: Return to 100-Grid view.
  - `Space`: Play/Pause in Teleprompter mode.

---

## 🚀 Running the App Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Open in your browser
http://localhost:5173
```

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Plus Jakarta Sans Typography
- **Icons**: Lucide React
- **Confetti Celebrations**: canvas-confetti
- **Storage**: LocalStorage with CSV and JSON exports
