# SimpKanb

Kanban desktop app built with Electron + React + TypeScript + SQLite.

Idealized because every functional Kanban tool was either paid or too heavy. SimpKanb runs locally, stores data in SQLite, and stays out of your way.

## Features

- Kanban boards with drag-and-drop
- Pentest mode (findings, CVSS, CWE, OWASP)
- General mode (tasks, notes, personal, work, gaming, study)
- Card detail modal with checklists, tags, evidence and notes
- Fully offline — no accounts, no cloud

## Stack

- Electron 29
- React 18 + TypeScript
- Vite (via electron-vite)
- better-sqlite3
- @dnd-kit
- Zustand
- Tailwind CSS

## Run

```bash
npm install
node node_modules/@electron/rebuild/lib/cli.js   # rebuild native deps
npm run build
npm start
```
