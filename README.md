# Kalindri Spelling Test

A mobile-friendly spelling quiz for students preparing for **PTE Listening – Fill in the Blanks**.
Students open the link on their phone, practise 218 words, and see their own score.

100% client-side: no backend, no database, no login, no paid APIs, no environment variables.
Progress is saved only in the student's browser (`localStorage`, key `fibquiz:v1`). Audio uses the browser's built-in Web Speech API.

Built with Vite + React + TypeScript + Tailwind CSS + React Router.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # Vitest: data validation, answer checking, generators, progress
npm run build      # type-checks, then builds to dist/
npm run preview    # serve the production build locally
```

## Edit the word list

Everything lives in `src/data/`:

| File | What to change |
| --- | --- |
| `words.ts` | `WORDS` (the list) and `ALTERNATES` (extra accepted spellings, e.g. `color → colour`) |
| `misspellings.ts` | At least 3 realistic misspellings for **every** word |
| `sentences.ts` | One 10–18 word sentence per word, with the word appearing exactly once, in exactly that form |
| `confusables.ts` | Groups for "Which Word Fits?" (one sentence per word where only that word fits) |

After editing, run `npm run test`. The tests fail if a word is missing a sentence or misspellings, if a misspelling
is a real English word (checked with the dev-only `an-array-of-english-words` package, never bundled in the app),
equals a listed word or alternate, or if a sentence is missing its word or repeats it. The test that expects
exactly **218** words is in `src/data/data.test.ts`; update that number if you change the list size on purpose.

## Deploy on Vercel

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New… → Project** → **Import** your repository.
3. Set **Framework Preset: Vite** (Build command `npm run build`, Output directory `dist` – both are detected automatically).
4. Click **Deploy**. Share the `https://….vercel.app` link on WhatsApp.

`vercel.json` rewrites every route to `/index.html`, so refreshing a page such as `/progress` never gives a 404.

## Project layout

```
src/
  data/       word list, misspellings, sentences, confusables (+ data tests)
  lib/        answer checking, letter diff, audio (speech), storage, progress
  quiz/       the 11 question generators, answer evaluation, session builder
  context/    app state (progress, settings, voices)
  components/ pages/
```
