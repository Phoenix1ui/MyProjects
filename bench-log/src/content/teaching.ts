import type { AiPolicyStage, LessonShape } from './types';

/** The three lesson shapes. Everything in the year is one of these. */
export const lessonShapes: LessonShape[] = [
  {
    id: 'primm',
    name: 'PRIMM',
    oneLine: 'They read and predict working code before they are allowed to write any.',
    steps: [
      'Predict — here is a program. What will it do? Write it down before it runs.',
      'Run — run it. Were you right? The gap between prediction and result is the lesson.',
      'Investigate — trace it line by line. What does this bit do? Why is it in that order?',
      'Modify — change it to do something slightly different.',
      'Make — now write your own from scratch.',
    ],
    useWhen:
      'Introducing anything new. The default shape for the first session of most units, and the antidote to a blank screen.',
  },
  {
    id: 'parsons',
    name: 'Parsons problems',
    oneLine: 'Correct lines, scrambled order. They arrange rather than type.',
    steps: [
      'Give them the right blocks in the wrong order, printed or on screen.',
      'They rearrange until it works — no typing, no syntax to fight.',
      'Once they are confident, add one distractor block that must not be used.',
      'Ask them to say why the order is the order.',
    ],
    useWhen:
      'When the idea is sequence or structure and typing is the thing in the way. A five-minute starter, and the right thing for a kid who missed last week.',
  },
  {
    id: 'drivernav',
    name: 'Driver–Navigator',
    oneLine: 'Two kids, one keyboard, and the one not typing is in charge.',
    steps: [
      'Driver has the keyboard and may only do what the Navigator says.',
      'Navigator holds the plan and does not touch the keyboard.',
      'Swap every eight minutes, on your timer, not theirs.',
      'End with each pair saying one thing the other did that helped.',
    ],
    useWhen:
      'Any build session. It keeps the confident kid from holding the keyboard for forty minutes, which is the single most common way a club loses half its members by October.',
  },
];

/** Staged to what the kid's job is that quarter. Not a morality rule — a training rule. */
export const aiPolicy: AiPolicyStage[] = [
  {
    quarters: 'Q1 – Q2',
    scope: 'Concepts 1–9: building the structure in their heads',
    policy: 'AI off for writing code.',
    howYouSayIt:
      '"You would not bench press with a forklift. Same reason." Frame it as training, not cheating — 13-year-olds accept the first and argue with the second.',
  },
  {
    quarters: 'Q3',
    scope: 'Control and state machines',
    policy: 'AI as explainer, never as writer.',
    howYouSayIt:
      'One sentence, and it is teachable: you may ask it about code you wrote; you may not ask it for code you did not. "Why is my robot wobbling" is fine. "Write me a line follower" is not.',
  },
  {
    quarters: 'Q4',
    scope: 'Open build — they are producing now',
    policy: 'AI on, with a log.',
    howYouSayIt:
      'Every team keeps an AI-use log: what they asked, what came back, what they changed and why. The log is portfolio evidence, not surveillance.',
  },
];

/** Why the policy needs no policing: the robot does it for you. */
export const aiResistantAssessments = [
  {
    name: 'The prediction rule',
    text: 'Write down the number you will hit and which part fails first. Scored on percent error. A kid who did not build it has no idea.',
  },
  {
    name: 'The tuning log',
    text: 'k value, observed behaviour, next hypothesis. A record of their robot on your floor, and no model has seen either.',
  },
  {
    name: 'Undisclosed parameters on the day',
    text: 'The task does not exist until they are standing there. Move the track, change the light, start them backwards.',
  },
  {
    name: 'The live defense',
    text: 'Two minutes of questions about their own build, written from their own logs the night before.',
  },
];

export const bugHunt = {
  name: 'Bug Hunt',
  cadence: 'Monthly from Q2',
  text: 'Hand out AI-generated code that is subtly broken — plausibly, not obviously. An off-by-one in the loop. A < that should be <=. A line follower with the right idea and the sensors swapped. Teams race to find it, scored on time-to-find and on explaining why it is wrong, not on fixing it. You write these by asking an AI for the code and breaking it yourself: five minutes of prep. It inverts the whole dynamic — the kid is the authority and the machine is the thing under review.',
};
