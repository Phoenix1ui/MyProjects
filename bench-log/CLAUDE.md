# CLAUDE.md — Bench Log

A club operating console for **one teacher**. One user, one club, one year.
`docs/BUILD-SPEC.md` has the full reasoning; this file is the short version that
overrides design instinct.

## The six non-negotiables

1. **Phone-first for the session screen.** One-thumb attendance, tap targets ≥44px.
2. **Works with no network.** Every write goes to IndexedDB. Nothing blocks on a fetch.
3. **Student data is first name + last initial. Nothing else. Ever.** Enforced in
   `src/lib/names.ts`. There is no second name field to grow into a surname.
4. **Curriculum is seed data in `src/content/`, never rows in IndexedDB. Do not
   build an admin UI for curriculum.** It is edited in a text editor and
   versioned in git. `src/test/content.test.ts` guards it.
5. **Usable after every build pass.**
6. **Nothing that needs maintenance in February.** No server, no accounts, no ops.

## Do not build

Student logins · a parent portal · file uploads (link to Drive) · notifications ·
grade calculation or SIS export · multi-teacher or multi-club · a curriculum
editing UI · anything involving a photo of a student's face · real-time
collaboration · an app-store app · sync, until October at the earliest and only
if the pain is real. If sync ever happens, Dexie stays the source of truth and
the remote is a mirror. Do not invert that.

## Stack

Vite + React 19 + TypeScript · Dexie (IndexedDB) · Tailwind v4 · vite-plugin-pwa ·
vitest + fake-indexeddb. Static site, hash routing, no backend.

```
npm run dev      npm test      npm run lint      npm run build      npm run icons
```

`.npmrc` sets `legacy-peer-deps` because npm 10's peer resolver crashes on a
vitest 5 peer range. `npm ci` honours it.

## Structure

```
src/content/   the curriculum: 18 concepts, 20 units, 4 checkpoints, the schedule, teaching notes
src/db/        types, schema, records (every write), reads (queries + derivations), backup
src/lib/       names, dates, levels (rating visuals), storage, useAutosave
src/ui/        primitives, Icon, PrepBox, RatingChip, AutosaveTextarea
src/screens/   Today, Roster, ClassGrid, Plan, Year, Teach, Drops, Data
src/test/      data layer + content integrity. Zero UI tests, by instruction.
```

**Every write goes through `src/db/records.ts`.** Screens never call
`db.table.put`. **Every derived number a teacher acts on lives in
`src/db/reads.ts`** where it is tested.

## Decisions, and why

- **The schedule is content, in `src/content/schedule.ts`.** The club meets
  Tuesdays and Wednesdays, 3:15–4:00. Two 45-minute sessions a week is roughly
  the contact time of one long weekly session, so the year is paced as 20 units
  over 64 sessions, in a Tuesday-starts-it, Wednesday-finishes-it rhythm. Today
  defaults its date to the club day he is standing in, or the last one if he is
  writing up on a Thursday; Plan shows the next meeting. Changing the days is a
  one-line edit and the date tests pin the behaviour.
- **Two contexts, two surfaces.** On a phone the bar has four tabs: Today,
  Roster, Class, Plan. On a laptop a sidebar shows all eight screens. Same routes.
  Planning screens carry a "Plan" back link on phones only.
- **Ratings are captured on Today**, for today's concepts, for the kids who are
  here, right after attendance. A heatmap that can only be filled in per kid
  across 18 concepts after the fact stays empty. The Roster and Class grids
  still allow editing anywhere.
- **Every record has `updatedAt`.** Import-merge is newer-wins per row, so a
  laptop's prep notes can be brought onto the phone without clobbering attendance
  the phone recorded since. It is also the groundwork a future sync needs.
- **Session ordinals are renumbered from dates** on every add and delete.
  "Session 2 of 3" is always true.
- **A unit is not a session.** Units span 1–5 sessions; attendance is per session.
- **Students are soft-deleted.** `active: false` hides them from Today, nothing else.
- **Attendance denominators count sessions held since the kid joined**, so a
  November arrival is not shown as 3 of 11.
- **`PrepRecord` carries `taught`/`taughtAt`** alongside `prepped`. "Mark taught"
  is per unit; a near-duplicate table would be worse. A `settings` table holds the
  Today cursor and the last export time.
- **Booleans are not indexed** (`active`, `present`, `prepped`, `taught`): they
  are not valid IndexedDB keys, so such an index silently returns nothing.
- **Hash routing.** No host needs a rewrite rule; `BASE_PATH` handles a subpath.
- **System fonts.** A font download has no place in an offline-first classroom
  tool. Identity comes from weight, scale, tracking and tabular numerals.
- **One loud colour.** Amber means "needs you": an unprepped unit, a stuck
  concept, a stale backup. Rating levels are a ramp of the accent, not a traffic
  light, so a "not yet" never paints a kid red.
- **`navigator.storage.persist()` at launch**, never re-requested; `/data` shows
  what the browser decided. Safari clears storage for sites not opened in seven
  days; home-screen apps are exempt. The export is still the backup.
- **A backup nudge on Today** once there are ≥10 attendance marks and no export in
  14 days. Quiet until true.
- **Icons are generated by `scripts/make-icons.mjs`** so they show up in diffs as
  code, not binaries.
