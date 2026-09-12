# BENCH LOG — BUILD SPEC
### A club operating console for one teacher
*Blueprint for building with Claude Code. Drop this file in the repo root and point Claude Code at it.*

---

## 0 · WHAT THIS IS

A single-user web app that one teacher opens on a phone at the start of a robotics club session and on a laptop when planning the week. It answers four questions:

1. **What am I teaching today, and do I know it yet?**
2. **Who's here?**
3. **Who is quietly not getting this?**
4. **What evidence have I collected, and what's still missing?**

It is **not** an LMS, a gradebook, or anything students log into. One user. One club. One year.

---

## 1 · NON-NEGOTIABLES

These are the constraints that should override any design instinct that conflicts with them. Put this list in `CLAUDE.md`.

| # | Constraint | Why |
|---|---|---|
| 1 | **Phone-first for the session screen.** One-thumb attendance, targets ≥44px | It gets used standing up in a classroom, not sitting at a desk |
| 2 | **Works with no network.** Attendance and notes must never fail because wifi dropped | Club rooms have bad wifi. An app that fails at 3:45pm on a Tuesday is dead |
| 3 | **Student data is first name + last initial. Nothing else. Ever.** No DOB, no email, no photos of faces stored in the app | It's a charter network; minimising stored PII avoids the whole policy conversation |
| 4 | **Curriculum content is seed data in a file, not rows typed into a UI** | He edits it in a text editor, versions it in git, and never builds a CMS |
| 5 | **Usable after the first build pass.** Every pass ships something he'd actually open | The club starts in days. A half-built app in November is worth nothing |
| 6 | **Nothing that needs maintenance in February** | First-year teacher. Any ops burden gets abandoned |

---

## 2 · STACK

**Build v1 with no backend at all.**

```
Vite + React + TypeScript
Dexie (IndexedDB wrapper) for all persistence
Tailwind for styling
vite-plugin-pwa for installability + offline
Deployed as a static site (Vercel / Netlify / GitHub Pages)
```

**Why no database.** Cross-device sync is the single biggest source of complexity in this app and it buys almost nothing in September. One teacher, one phone, one laptop — and the laptop work is planning, which the phone doesn't need. Ship local-only, use it for six weeks, and add sync in October *if the pain turns out to be real*. Same logic as buying five Cutebots instead of ten.

Give v1 a **JSON export/import** button. That's the escape hatch: it's a backup, it's how the data moves to a second device if needed, and it's what makes adding real sync later a non-event.

**When to add sync (pass 4, October at the earliest).** Supabase — Postgres, auth, generous free tier, and Claude Code handles the stack well. Keep Dexie as the source of truth and treat Supabase as a mirror, so the offline guarantee survives. Do not invert that.

> **A note on `fable`.** Reasoning-heavy models earn their cost on the data model and the sync layer, not on JSX. Use the strong model to design the schema and write the Dexie layer, then drop down for screens and styling.

---

## 3 · DATA MODEL

Two kinds of data, and keeping them separate is the most important structural decision in the app.

**Content** — the curriculum. Ships in the repo as TypeScript, read-only at runtime, edited in an editor.
**Records** — what actually happened. Lives in IndexedDB, written by the app.

### Content (seed files, `src/content/`)

```ts
type Quarter = 'q1' | 'q2' | 'q3' | 'q4';

interface Concept {
  id: string;              // 'varchg'
  order: number;           // 5
  short: string;           // 'Variable (change)'
  name: string;            // 'Changing a variable — score = score + 1'
  kidWords: string;        // how to say it to a 13-year-old
  misconception: string;   // where they get stuck
  teachingMove: string;    // what to do about it
  masteryCheck: string;    // they've got it when...
}

interface Unit {
  id: string;
  order: number;
  quarter: Quarter;
  title: string;
  sessionCount: number;    // 1–5
  kidsDo: string;
  teacherPrep: string;     // what HE needs to know first
  materials: string;
  conceptIds: string[];
}

interface Checkpoint {
  id: string;
  quarter: Quarter;
  title: string;
  dueWindow: string;       // 'First week of November'
  visibleOutcome: string;
  minimumBar: string;
  evidenceItems: { id: string; text: string }[];
}
```

### Records (Dexie tables)

```ts
interface Student {
  id: string;
  displayName: string;     // 'Amara T.' — enforce this at input
  joinedAt: number;
  active: boolean;         // soft delete; never lose attendance history
}

interface Session {
  id: string;
  unitId: string;
  date: string;            // ISO date
  ordinal: number;         // which session within the unit (1..sessionCount)
  notes: string;           // free text, written on the phone
}

interface AttendanceRecord {
  sessionId: string;
  studentId: string;
  present: boolean;
}                          // compound key [sessionId+studentId]

interface SkillRating {
  studentId: string;
  conceptId: string;
  level: 0 | 1 | 2;        // not yet / with help / on their own
  updatedAt: number;
}                          // compound key [studentId+conceptId]

interface PrepRecord {
  unitId: string;
  prepped: boolean;
  notes: string;           // his own notes-to-self while learning it
  preppedAt?: number;
}

interface EvidenceLink {
  id: string;
  checkpointId: string;
  evidenceItemId?: string; // which checklist item this satisfies
  kind: 'photo' | 'csv' | 'code' | 'video' | 'doc' | 'other';
  label: string;
  url: string;             // points at Drive. The app stores links, never files.
  addedAt: number;
}

interface ChecklistState {
  checkpointId: string;
  evidenceItemId: string;
  done: boolean;
}
```

**Two modelling notes that matter:**

- **A Unit is not a Session.** A unit spans 1–5 sessions; attendance is per *session*. Getting this wrong means attendance data that can't answer "how many times has this kid actually come." Model them separately from the start.
- **Soft-delete students, never hard-delete.** A kid who leaves in November still attended in September, and that history is part of the year's evidence.

---

## 4 · SCREENS

### `/` — Today *(phone-first, the one that gets used under time pressure)*
The current unit: title, what kids do, **the teacher-prep box**, materials, concepts touched. Then a one-tap attendance grid. Then a notes field.

Prev/next to move between units; a "mark taught" toggle. Prep box is visually loud when unprepped and quiet when done — that contrast is the whole point of the screen.

### `/roster` — Students
Add students (input validated to first-name-plus-initial shape). Each student expands to a grid of all concepts; tapping cycles 0→1→2. Show per-kid attendance count and a mastery percentage.

### `/class` — The heatmap *(the highest-value screen in the app)*
Concepts across the top, students down the side, coloured by level. This is the view that tells him **the class is stuck on concept 9** rather than that one kid is struggling — and that's a different, more actionable fact. Nothing else in the app produces it.

### `/curriculum` — The year
All units grouped by quarter, expandable, with prep state. Jump-to-unit sets the Today cursor.

### `/teach` — Concept reference
Read-only. The ladder, each concept with kid-words / misconception / teaching move / mastery check. Plus the three lesson shapes (PRIMM, Parsons, Driver-Navigator). This is what he reads the night before.

### `/checkpoints` — Portfolio drops
Four checkpoints, each a checklist plus a table of evidence links. "Add evidence" takes a label and a Drive URL. Progress bar per checkpoint.

### `/data` — Export / import
Download everything as JSON. Restore from JSON. Unglamorous and the most important screen for trusting the app.

---

## 5 · BUILD ORDER

Four passes. **Each one ends with something he would actually open.** Don't start pass 2 before pass 1 is deployed and used once.

**Pass 1 — the session console** *(a weekend)*
Seed content files. Dexie schema. Today screen. Roster with add/list. Attendance. PWA install. Deploy.
→ *Ship criterion: he can take attendance on his phone at the first club session.*

**Pass 2 — the tracker** *(a few evenings)*
Skill ratings on the roster. The class heatmap. Curriculum browse with prep toggles and prep notes.
→ *Ship criterion: after four sessions he can see which concept the class is stuck on.*

**Pass 3 — the portfolio** *(a weekend)*
Checkpoints, checklists, evidence links. JSON export/import.
→ *Ship criterion: he can walk into the November checkpoint with a live list of what's still missing.*

**Pass 4 — only if the pain is real** *(October or later)*
Supabase sync behind the Dexie layer. Attendance-over-time chart. Print/PDF view of a checkpoint for showing a principal.

---

## 6 · WORKING WITH CLAUDE CODE ON THIS

**Write `CLAUDE.md` first, before any code.** Put in it: the six non-negotiables from §1, the data model from §3, the stack from §2, and one line that matters more than it looks — *"Content is seed data in `src/content/`, never rows in IndexedDB. Do not build an admin UI for curriculum."* Without that line you will end up with a CMS you didn't want.

**Build in vertical slices, not layers.** "Today screen, fully working, seed data through to rendered UI" beats "all the Dexie tables" — a working slice tells you the model is wrong while it's still cheap to change.

**Seed content from the plan doc.** Hand Claude Code `robotics-coding-club-year-plan.md` alongside this spec and ask it to generate `src/content/units.ts`, `concepts.ts`, and `checkpoints.ts` from it. That's a mechanical transformation and it should not be typed by hand.

**Test the data layer only.** Attendance toggling, skill cycling, export/import round-trip. Zero UI tests — the app has one user who will notice a broken button in four seconds.

**When you hit the sync question, stop and re-read constraint 6.** The pull toward "proper" architecture is strong and it is how this app dies in February.

---

## 7 · DO NOT BUILD

Student logins · a parent portal · file uploads (link to Drive) · notifications · grade calculation or export to any SIS · multi-teacher or multi-club support · a curriculum editing UI · anything involving a photo of a student's face · real-time collaboration · a mobile app in an app store.

Every one of these is a plausible next feature and every one of them costs more than the club gains.

---
---

# APPENDIX — THE AI QUESTION

*You asked whether to let them vibe-code and teach the logic behind it, or teach coding properly. Here's what the evidence says, and what I'd actually do.*

## The finding that should decide this

A controlled study put 22 novice programmers through Python tasks in two conditions — human pair programming, and working with GitHub Copilot — then retested them **solo, one week later.**

With Copilot they performed **~14 points better out of 100** and finished faster. Mental demand dropped 23 points. Effort dropped 23 points. Time pressure dropped 29.

On the retest a week later, performance on the AI-learned material **declined**. And the effect was sharpest in the *stronger* participants, who dropped 3.4 points specifically on what they'd learned with AI.

The paper is called **"Fast and Forgettable."**

That's the mechanism, and it's worth stating plainly: **AI removes exactly the cognitive effort that produces learning.** Lower mental demand isn't a side effect of the productivity gain — for a learner, it *is* the loss. The struggle was the thing.

Note also that it hit the strong students hardest. That's the same pattern as the `x = x + 1` collision — your best kids have the most to lose from a shortcut, because they're the ones who'd otherwise build the deepest schema.

## So the question isn't "AI or no AI"

It's **what is this kid's job right now?**

- When the job is to **produce something** → AI is a legitimate tool and refusing it is theatre
- When the job is to **build a structure in their head** → AI removes the load-bearing struggle

Q1 through Q3 of your year is schema-building. Q4 is producing. So the policy is staged, not blanket:

| When | Policy | How you say it to them |
|---|---|---|
| **Q1–Q2**<br>concepts 1–9 | **AI off for writing code.** | "You wouldn't bench press with a forklift. Same reason." Not a morality rule — a training rule. 13-year-olds accept that framing and reject the cheating one |
| **Q3**<br>control + state machines | **AI as explainer, never as writer.** | One sentence, and it's teachable: **you may ask it about code you wrote; you may not ask it for code you didn't.** "Why is my robot wobbling" is fine. "Write me a line follower" is not |
| **Q4**<br>open build | **AI on, with a log.** | They're producing now. But every team keeps an AI-use log: what they asked, what came back, what they changed and why. The log is portfolio evidence |

## The thing that makes this enforceable without policing

**The robot does the work for you.**

AI cannot tell a kid what *their* robot will do. `k = 0.4` works on your classroom floor and fails on someone else's. Battery voltage sags. Their sensor sits 2mm higher than the tutorial's. The line tape on your floor is a slightly different black.

Every scoring device already in your plan is inherently AI-resistant for this reason:

- **The prediction rule** — write down the number you'll hit and which part fails first, scored on percent error. A kid who didn't build it has no idea
- **The tuning log** — k value, observed behavior, next hypothesis. It's a record of *their* robot on *your* floor
- **Undisclosed parameters on the day** — the task doesn't exist until they're standing there
- **The live defense** — two minutes of questions about their own build

You never have to accuse anyone of anything. The rubric just quietly stops rewarding copying. That was already true of the plan; it's now also your AI policy.

## The vibe-coding reality, told to them straight

Vibe coding works right up until it doesn't, and the moment it doesn't, the only person who can rescue it is someone who understands the code.

Your kids will discover this on their own in about twenty minutes, the first time they generate a line follower and it drives straight off the track. The model cannot see their floor, their battery, or their sensor mounting. It will confidently suggest a fix that doesn't work, then another. That's not a lecture you need to give — it's an experience the hardware will deliver for free, and it's far more persuasive than anything you say in September.

## The best version of this — actually teach the AI skill

Here's where you can go further than "restrict it," and it's the answer to your "is there a better approach" question.

**The valuable AI skill for a 13-year-old is not prompting. It's reviewing.** Knowing when the output is wrong is the entire game, and it's a skill you can teach directly:

> ### Bug Hunt
> Once a month, hand out AI-generated code that is subtly broken. Not obviously broken — plausibly broken. An off-by-one in the loop. A `<` that should be `<=`. A line-follower where the error term is the right idea with the sensors swapped.
>
> Teams race to find the bug. Score on time-to-find, and on whether they can explain *why* it's wrong rather than just fixing it.

You write these by asking an AI for the code and then breaking it yourself — five minutes of prep. And it inverts the whole dynamic: instead of AI raising the floor and lowering the ceiling, the kid is the authority and the machine is the thing under review. That's the relationship you actually want them to have with these tools in ten years, and almost nobody is teaching it.

Run the first Bug Hunt in Q2, right after they've written their first control loop — the moment they know enough to be dangerous is exactly the moment this lands.

---

*Compiled August 2026. Study: "Fast and Forgettable: A Controlled Study of Novices' Performance, Learning, Workload, and Emotion in AI-Assisted and Human Pair Programming Paradigms." TeachAI/CSTA guidance is consistent with the staged approach: students with a stronger grasp of underlying computing concepts use AI tools more effectively.*
