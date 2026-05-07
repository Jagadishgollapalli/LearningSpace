# Jagadish's LS — Learning Space

A personal notes app with folders, full-text search, and file attachments — built with React + Supabase.

---

## Step 1: Set up Supabase (one-time)

1. Go to supabase.com → your project → SQL Editor
2. Paste the contents of `SUPABASE_SETUP.sql` and click Run
3. Go to Storage → New bucket
   - Name: `note-files`
   - Toggle: Public bucket → ON

---

## Step 2: Run the app

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Keyboard shortcuts

- Ctrl+S  → Save
- Ctrl+E  → Toggle edit/preview
- Ctrl+N  → New note
- Esc     → Close modal

---

## Build for production

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.
