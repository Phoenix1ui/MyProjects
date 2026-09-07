import type { Quarter, Unit } from './types';

/**
 * The year in teaching order: 17 units, 32 sessions — one club session a week
 * with slack for snow days and the fortnight nobody shows up.
 *
 * `teacherPrep` is the field doing the real work. It is what he needs to know
 * before he can teach the thing, written to himself.
 */
export const units: Unit[] = [
  // ── Q1 · It moves ─────────────────────────────────────────────────────────
  {
    id: 'u01',
    order: 1,
    quarter: 'q1',
    title: 'First light',
    sessionCount: 1,
    kidsDo:
      'Unbox a Cutebot, pair a micro:bit, flash a program that shows their initials, then make both wheels turn for one second. Everyone leaves having made a robot move.',
    teacherPrep:
      'Do the whole flashing loop yourself, twice, on the club laptop: MakeCode → Download → drag the .hex onto the MICROBIT drive. Know what the pairing dialogue looks like when it fails, because it will. Charge every battery pack the night before and count them — a flat pack looks exactly like broken code to a 13-year-old and will eat the whole session.',
    materials: '5 Cutebots, 5 micro:bits, USB cables, AA batteries, club laptops',
    conceptIds: ['seq', 'output'],
  },
  {
    id: 'u02',
    order: 2,
    quarter: 'q1',
    title: 'Driving on purpose',
    sessionCount: 2,
    kidsDo:
      'Timed moves: forward, stop, turn. Drive to a taped X on the floor, then drive a square. Measure how far one second actually gets you.',
    teacherPrep:
      'Drive a square yourself first and find out how badly it drifts — it will not close, and you need to be relaxed about that when they notice. Have a number ready for how far one second at full speed travels on your floor. Decide now that "the square does not close" is a thing you will point at all year, not a bug you apologise for.',
    materials: 'Masking tape, tape measure, 5 robots, floor space cleared',
    conceptIds: ['seq', 'output', 'event'],
  },
  {
    id: 'u03',
    order: 3,
    quarter: 'q1',
    title: 'The score box',
    sessionCount: 2,
    kidsDo:
      'Build a button counter: press A, the number goes up, show it on the display. Break it on purpose and fix it. Then make B reset it.',
    teacherPrep:
      'This is the x = x + 1 session and the most important hour in Q1. Practise saying "score BECOMES score plus one" until it is automatic — say "equals" once and half of them file it under maths and stop listening. Have the box-and-index-card prop physically on the desk. Read the misconception note on Var. change before you walk in.',
    materials: 'A shoebox, index cards, marker; robots optional',
    conceptIds: ['var', 'varchg', 'event'],
  },
  {
    id: 'u04',
    order: 4,
    quarter: 'q1',
    title: 'Do it again',
    sessionCount: 3,
    kidsDo:
      'Write the square the long way — four copies of forward-and-turn — then collapse it into a repeat block. Then a triangle, then a shape of their choosing.',
    teacherPrep:
      'Resist showing the loop first. The lesson depends on them feeling the tedium of the copy-paste version for a full ten minutes before you rescue them. Know how repeat-4 becomes repeat-3 with the angle changed, because the triangle is where they discover the angle is not 90.',
    materials: 'Tape, protractor, 5 robots',
    conceptIds: ['loopn', 'varchg', 'seq'],
  },

  // ── Q2 · It decides ───────────────────────────────────────────────────────
  {
    id: 'u05',
    order: 5,
    quarter: 'q2',
    title: 'If this, then that',
    sessionCount: 2,
    kidsDo:
      'Tilt-controlled driving: if tilted forward, go; otherwise stop. Then a second condition, and an argument about and/or as a class.',
    teacherPrep:
      'Draw the trace-table format you will use on the board before they arrive — you will use it every week until June, so pick one you like. Prepare a two-condition "and" that never fires and let them find out why. Two kids standing up with true/false cards works better than it sounds.',
    materials: 'Whiteboard, true/false cards, 5 robots',
    conceptIds: ['cond', 'bool'],
  },
  {
    id: 'u06',
    order: 6,
    quarter: 'q2',
    title: 'The robot has senses',
    sessionCount: 2,
    kidsDo:
      'Put the line-sensor reading on the display. Walk the robot across black tape and white floor and write down ten numbers. Compare tables between teams and discover they disagree.',
    teacherPrep:
      'Take your own readings on the actual club floor the day before, under the lights that will be on. Know your white number and your black number. Take one more with the blinds open and one with them shut — the difference is the best argument you will ever make for measuring instead of copying.',
    materials: 'Black electrical tape, white card, 5 robots, printed reading tables',
    conceptIds: ['sensornum', 'forever'],
  },
  {
    id: 'u07',
    order: 7,
    quarter: 'q2',
    title: 'Bug Hunt #1',
    sessionCount: 1,
    kidsDo:
      'Teams race to find the bug in code they did not write — an off-by-one, a < that should be <=, sensors swapped. Scored on time-to-find and on explaining why it is wrong, not on fixing it.',
    teacherPrep:
      'Write the broken programs the week before: ask an AI for the code, then break it yourself, subtly. Three programs, rising difficulty, plausible not obvious. Print them — reading code on paper is the point. Run this right after their first real conditional work; the moment they know just enough to be dangerous is when it lands.',
    materials: 'Three printed broken programs, timer, whiteboard scoreboard',
    conceptIds: ['cond', 'bool', 'sensornum'],
  },
  {
    id: 'u08',
    order: 8,
    quarter: 'q2',
    title: "Where's the line?",
    sessionCount: 2,
    kidsDo:
      'Compute a threshold from their own two piles of readings, write it on the team card, and make the robot stop when it hits the tape.',
    teacherPrep:
      'Have the midpoint arithmetic ready to do out loud with a stuck team. Expect at least one team to use a number from a YouTube tutorial and fail — let it happen, then have them measure. If the light changes during the session, celebrate it loudly rather than fixing it.',
    materials: 'Tape track, team cards, 5 robots',
    conceptIds: ['threshold', 'cond', 'sensornum'],
  },
  {
    id: 'u09',
    order: 9,
    quarter: 'q2',
    title: 'Name your moves',
    sessionCount: 2,
    kidsDo:
      'Pull the repeated blocks out of their own working programs into named functions, then add a parameter so one function handles all three turns.',
    teacherPrep:
      'Do this refactor live on the projector using a real program from one of their teams, with permission. Know how to define and call a custom block in MakeCode cold — practise once, because fumbling the menu here costs you the thread.',
    materials: 'Projector, club laptops, their own saved programs',
    conceptIds: ['func', 'param'],
  },

  // ── Q3 · It controls ──────────────────────────────────────────────────────
  {
    id: 'u10',
    order: 10,
    quarter: 'q3',
    title: 'How wrong are you?',
    sessionCount: 2,
    kidsDo:
      'Two sensors, one number: error = left − right. Put it on the display, push the robot around by hand, watch the sign flip. No motors yet.',
    teacherPrep:
      'The no-motors rule is doing real work — do not let them skip to driving. Be able to explain why left minus right is the same idea as target minus actual. Know what your own robot reads dead centre, because it will not be zero and someone will ask.',
    materials: 'Tape track, 5 robots',
    conceptIds: ['error', 'sensornum'],
  },
  {
    id: 'u11',
    order: 11,
    quarter: 'q3',
    title: 'Steer by how wrong you are',
    sessionCount: 3,
    kidsDo:
      'turn = k × error. Start at k = 0.4, run it, tune. Every run goes in the log: k value, what the robot did, what you will try next.',
    teacherPrep:
      'Run both failure modes yourself first: k far too high (wobble) and far too low (drifts off). Time your own tuning so you know how long it takes on your floor. Keep a working k on a card in your pocket that you never show them — it is there so you stay calm, not so you hand it out.',
    materials: 'Tape oval, tuning log sheets, spare batteries, 5 robots',
    conceptIds: ['propctl', 'error', 'tuning'],
  },
  {
    id: 'u12',
    order: 12,
    quarter: 'q3',
    title: 'The prediction rule',
    sessionCount: 1,
    kidsDo:
      'Before running: write down the lap time you will hit and which part fails first. Then run. Scored on percent error, not on being fastest.',
    teacherPrep:
      'Make the scoring visible and boring: percent error only. This is the assessment that cannot be faked — a team that did not build it has no idea what their robot will do. Draw the scoring table before they arrive so it feels like the rules, not a judgement.',
    materials: 'Stopwatch, prediction cards, tape track',
    conceptIds: ['tuning', 'propctl'],
  },
  {
    id: 'u13',
    order: 13,
    quarter: 'q3',
    title: 'Modes: the state machine',
    sessionCount: 2,
    kidsDo:
      'Draw three circles — searching, following, stopped — and label every arrow with what causes it. Only then write the code.',
    teacherPrep:
      'Refuse code from any team that cannot name an arrow. Have your own three-state diagram on the board as the example, and know one transition that is genuinely ambiguous so you can show that the drawing is where you argue, not the keyboard.',
    materials: 'Whiteboard, paper, 5 robots',
    conceptIds: ['state', 'cond'],
  },

  // ── Q4 · They produce ─────────────────────────────────────────────────────
  {
    id: 'u14',
    order: 14,
    quarter: 'q4',
    title: 'Pick the problem',
    sessionCount: 1,
    kidsDo:
      'Teams choose their open build and name three pieces they can test separately. Those three pieces go on the board and stay there until June.',
    teacherPrep:
      'This is where the AI policy changes: AI is on now, with a log. Say it out loud and say why — the job has changed from building a structure in their heads to producing something. Have the AI-use log format ready: what they asked, what came back, what they changed and why. It is portfolio evidence, not surveillance.',
    materials: 'Whiteboard, project brief handout, AI-use log sheets',
    conceptIds: ['decompose', 'state'],
  },
  {
    id: 'u15',
    order: 15,
    quarter: 'q4',
    title: 'Build sprint',
    sessionCount: 3,
    kidsDo: 'Build, in testable pieces. Every session ends with one piece proven to work and written in the log.',
    teacherPrep:
      'Your job this unit is circulation, not instruction. Decide in advance what you will say to a team that wrote everything at once and cannot find the bug — point at their own three pieces on the board. Keep your hands off their keyboards.',
    materials: 'Everything, all of it, and the spare batteries',
    conceptIds: ['decompose', 'func', 'propctl', 'state'],
  },
  {
    id: 'u16',
    order: 16,
    quarter: 'q4',
    title: 'Break it on purpose',
    sessionCount: 2,
    kidsDo:
      'Swap robots with another team and try to break their build. Undisclosed parameters on the day: the track changes, the lighting changes, the start position changes.',
    teacherPrep:
      'Decide the undisclosed change the morning of, not before — it must not exist until they are standing there. Something real: move the track, open the blinds, start them backwards. This is the session that proves whose understanding is theirs.',
    materials: 'Track pieces, a second lighting condition, timer',
    conceptIds: ['tuning', 'decompose', 'state'],
  },
  {
    id: 'u17',
    order: 17,
    quarter: 'q4',
    title: 'Demo day and live defense',
    sessionCount: 1,
    kidsDo:
      'Two minutes of demo, two minutes of questions about their own build. Every team member answers at least one.',
    teacherPrep:
      'Write four questions per team the night before, from their tuning logs — specific to their robot, unanswerable by someone who did not build it. Invite one adult who is not you. Photograph the robots and the whiteboards, never faces.',
    materials: 'Track, camera, question cards, an audience',
    conceptIds: ['decompose', 'tuning', 'state', 'propctl'],
  },
];

export const unitsInOrder: Unit[] = [...units].sort((a, b) => a.order - b.order);
export const unitById: ReadonlyMap<string, Unit> = new Map(units.map((u) => [u.id, u]));
export const totalSessions = units.reduce((n, u) => n + u.sessionCount, 0);

export function unitsForQuarter(quarter: Quarter): Unit[] {
  return unitsInOrder.filter((u) => u.quarter === quarter);
}

/** Where a concept first lands in the year. */
export function firstUnitForConcept(conceptId: string): Unit | undefined {
  return unitsInOrder.find((u) => u.conceptIds.includes(conceptId));
}
