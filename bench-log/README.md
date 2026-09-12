# Bench Log

A club operating console for one teacher. It opens on a phone at the start of a
robotics club session and on a laptop when planning the week, and answers four
questions:

1. What am I teaching today, and do I know it yet?
2. Who's here?
3. Who is quietly not getting this?
4. What evidence have I collected, and what's still missing?

Not an LMS, not a gradebook, nothing students log into. One user, one club, one
year. The club meets **Tuesdays and Wednesdays, 3:15–4:00**, and the year is
paced for it: 20 units over 64 short sessions, Tuesday starting a thing and
Wednesday finishing it. The reasoning is in [`docs/BUILD-SPEC.md`](docs/BUILD-SPEC.md); the rules
that override design instinct, and the decisions made, are in
[`CLAUDE.md`](CLAUDE.md).

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # data layer + content integrity (vitest, fake-indexeddb)
npm run lint     # oxlint
npm run build    # tsc -b && vite build  ->  dist/
npm run preview  # serve the build
npm run icons    # regenerate the PWA icons in public/
```

## Deploying

A static site with no backend and hash routing, so `dist/` drops onto any host
without rewrite rules:

- **Vercel / Netlify** — root directory `bench-log`, build `npm run build`,
  publish `dist`.
- **GitHub Pages** — `BASE_PATH=/<repo>/ npm run build`, publish `dist`.

Open it once on the phone over wifi, then **Add to Home Screen** and launch it
from the icon. After that it works with no network at all: the app is precached
and every write goes to IndexedDB on the device. Installing to the home screen
also exempts it from Safari's seven-day storage purge.

## The screens

| Route | On the phone | What it's for |
|---|---|---|
| `/` | Today | The unit, the prep box, one-thumb attendance, **ratings for today's concepts**, notes |
| `/roster` | Roster | Who's in the club, sessions attended since they joined, the whole ladder per kid |
| `/class` | Class | The heatmap, and a banner naming the concept **the class** is stuck on |
| `/plan` | Plan | The night-before hub: what's next, is it prepped, what's due, when was the last backup |
| `/year` | via Plan | The year by quarter, prep state, notes-to-self, sessions logged |
| `/teach` | via Plan | The concept ladder, three lesson shapes, the staged AI rule |
| `/drops` | via Plan | Four portfolio drops: checklist and evidence links |
| `/data` | via Plan | Export, import (merge is newer-wins), storage status, start over |

On a laptop all eight sit in a sidebar.

## Things worth knowing

- **Student data is first name plus last initial, nothing else.** Enforced at input.
- **The schedule lives in `src/content/schedule.ts`.** Today defaults to the club
  day you're standing in (or the last one, if you're writing up on Thursday), and
  warns quietly if you pick a day the club doesn't meet. Changing days or times
  is a one-line edit.
- **Curriculum lives in `src/content/` as TypeScript**, edited in an editor and
  versioned in git. `npm test` checks its integrity. There is no admin UI for it.
- **Ratings are meant to be taken on Today**, right after attendance, for the
  concepts just taught. That is what keeps the heatmap real.
- **Export every few sessions.** It's one JSON file; drop it in Drive. Merge on
  the other device keeps whichever copy of each record is newer.
- **There is no sync**, on purpose, until the pain is real.
