import type { Checkpoint } from './types';

/**
 * Four portfolio drops. Each is a thing he has to walk into a room with, so the
 * fields are written to be read under mild pressure: what it looks like, what
 * the floor is, and exactly what has to exist.
 *
 * Evidence is always a link to Drive. The app stores links, never files, and
 * never a photograph of a student's face.
 */
export const checkpoints: Checkpoint[] = [
  {
    id: 'cp1',
    quarter: 'q1',
    title: 'Drop 1 — It moves',
    dueWindow: 'First week of November',
    visibleOutcome:
      'Every club member has driven a robot along a path they programmed themselves, and can explain what one line of their program does.',
    minimumBar:
      "A short video of each team's robot completing the taped square, plus one program file per student showing a loop and a variable they wrote.",
    evidenceItems: [
      { id: 'cp1-e1', text: "Video: each team's robot driving the taped square" },
      { id: 'cp1-e2', text: 'Program files (.hex or MakeCode links), one per student' },
      { id: 'cp1-e3', text: 'Attendance export for Q1 — sessions held and who came' },
      { id: 'cp1-e4', text: 'Photos of the club space and robots — no faces' },
      { id: 'cp1-e5', text: 'One paragraph on what the club is, for the newsletter' },
    ],
  },
  {
    id: 'cp2',
    quarter: 'q2',
    title: 'Drop 2 — It decides',
    dueWindow: 'Second week of January',
    visibleOutcome:
      'Robots respond to the world. Each team can show a robot that behaves differently depending on a sensor reading they measured themselves.',
    minimumBar:
      'Each team has a sensor-reading table with their own numbers, a threshold derived from it, and a robot that stops on the line. Plus one completed Bug Hunt scoresheet.',
    evidenceItems: [
      { id: 'cp2-e1', text: 'Sensor reading tables — one per team, their own numbers' },
      { id: 'cp2-e2', text: 'Video: robot stopping on the line' },
      { id: 'cp2-e3', text: 'Bug Hunt #1 scoresheet and the three broken programs' },
      { id: 'cp2-e4', text: 'Class heatmap screenshot — concept coverage to date' },
      { id: 'cp2-e5', text: 'Attendance export for Q2' },
      { id: 'cp2-e6', text: 'Two student reflections: something that did not work, and why' },
    ],
  },
  {
    id: 'cp3',
    quarter: 'q3',
    title: 'Drop 3 — It controls',
    dueWindow: 'Last week of March',
    visibleOutcome:
      'A robot follows a line using proportional control, and the team can tell you what their k value is and how they arrived at it.',
    minimumBar:
      'Every team has a tuning log with at least six runs showing single-variable changes, a prediction card scored on percent error, and a state diagram that matches their code.',
    evidenceItems: [
      { id: 'cp3-e1', text: 'Tuning logs — six or more runs per team, scanned' },
      { id: 'cp3-e2', text: 'Prediction cards with percent-error scoring' },
      { id: 'cp3-e3', text: 'Video: a full lap under proportional control' },
      { id: 'cp3-e4', text: 'State diagrams photographed from the whiteboard' },
      { id: 'cp3-e5', text: 'Attendance export for Q3' },
      { id: 'cp3-e6', text: 'Heatmap screenshot — control concepts 14–17' },
    ],
  },
  {
    id: 'cp4',
    quarter: 'q4',
    title: 'Drop 4 — They produce',
    dueWindow: 'First week of June',
    visibleOutcome:
      'Demo day. Each team presents a build they chose, survives two minutes of questions about it, and hands in the log of how they got there.',
    minimumBar:
      'Every team: a working build, an AI-use log, a decomposition board photo, and a live-defense score. Every student answered at least one question themselves.',
    evidenceItems: [
      { id: 'cp4-e1', text: 'Demo day video — one per team, robots only' },
      { id: 'cp4-e2', text: 'AI-use logs: what was asked, what came back, what changed and why' },
      { id: 'cp4-e3', text: 'Decomposition boards photographed' },
      { id: 'cp4-e4', text: 'Live-defense score sheets with the questions asked' },
      { id: 'cp4-e5', text: 'Year attendance export and final heatmap' },
      { id: 'cp4-e6', text: 'One-page year summary for the principal' },
      { id: 'cp4-e7', text: 'Equipment inventory and what to buy next year' },
    ],
  },
];

export const checkpointById: ReadonlyMap<string, Checkpoint> = new Map(
  checkpoints.map((c) => [c.id, c]),
);
