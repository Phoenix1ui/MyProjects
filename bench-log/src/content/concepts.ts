import type { Concept } from './types';

/**
 * The ladder. `order` is the teaching order, not a difficulty score — a kid can
 * be fine on 11 and shaky on 5, and that is exactly what the heatmap is for.
 */
export const concepts: Concept[] = [
  {
    id: 'seq',
    order: 1,
    short: 'Sequence',
    name: 'Sequence — the order of the lines is the program',
    kidWords:
      'The robot does exactly what you wrote, in the order you wrote it, and never guesses what you meant.',
    misconception:
      'They read the blocks as a description of the goal ("go in a square") rather than a list the machine runs one line at a time.',
    teachingMove:
      'Be the robot. Have them give you instructions to walk to the door and follow them literally, wall included. Ninety seconds, and it lands harder than any slide.',
    masteryCheck:
      'Shown a four-block program, they can say in order what the robot will do before it runs — including a wrong program.',
  },
  {
    id: 'output',
    order: 2,
    short: 'Output',
    name: 'Output — making the machine do something you can see',
    kidWords:
      'Motors, lights and the display are how the robot talks back. If nothing happened, the program still ran — you just never asked for anything visible.',
    misconception:
      'A program with no visible output reads as "broken", so they start changing code that works.',
    teachingMove:
      'For the first three weeks, the first line of every program shows something on the display. A number on the display is the cheapest debugger they will ever own.',
    masteryCheck:
      'They add a display or LED line on their own to check whether a piece of code ran.',
  },
  {
    id: 'event',
    order: 3,
    short: 'Event',
    name: 'Event — code that waits to be triggered',
    kidWords:
      '"When button A is pressed" is a promise. The code inside sits doing nothing until the thing happens.',
    misconception:
      'They expect event handlers to run top to bottom in the order they appear on screen, like the rest of the program.',
    teachingMove:
      'Two handlers, A and B, each showing a different number. Ask for the display to show 2 then 1 and let them discover the order is theirs to trigger, not the code\'s to decide.',
    masteryCheck:
      'They can explain why the code inside "on button A pressed" did not run at start-up.',
  },
  {
    id: 'var',
    order: 4,
    short: 'Variable',
    name: 'Variable — a named box holding a number',
    kidWords:
      'A variable is a box with a name on it. Look inside as many times as you like; the number does not get used up.',
    misconception:
      'They think the name is the value ("score is 0 forever"), or that reading a variable consumes it.',
    teachingMove:
      'A real box and an index card with a number on it. Read it three times — still the same card. The prop is worth more than the explanation.',
    masteryCheck:
      'They use the same variable twice in one expression and predict the result correctly.',
  },
  {
    id: 'varchg',
    order: 5,
    short: 'Var. change',
    name: 'Changing a variable — score = score + 1',
    kidWords:
      'The right-hand side happens first. Work out score + 1, and only then put the answer back in the box, throwing away what was there.',
    misconception:
      'The maths collision: six years of being told x = x + 1 is impossible, because in maths that line is a false statement. Here it is an instruction, not a claim.',
    teachingMove:
      'Read it aloud as "score BECOMES score plus one", never "equals". Then run the box by hand: card out, do the sum, write a new card, put it in, tear up the old one. Say "becomes" every single time for a month.',
    masteryCheck:
      'They trace three lines of variable changes on paper and get the final value right without running it.',
  },
  {
    id: 'loopn',
    order: 6,
    short: 'Repeat N',
    name: 'Counted loop — repeat this N times',
    kidWords:
      'Instead of copying the same four blocks four times, you say "do this 4 times" and the machine does the copying.',
    misconception:
      'They believe the loop runs all its passes at once, or that changing the count changes the speed rather than the number of repeats.',
    teachingMove:
      'Make them write the square the long way first — four copies of forward-and-turn — and only then collapse it. The loop has to solve a pain they already felt.',
    masteryCheck:
      'They convert a repeated sequence into a loop and back, and can say how many times each line runs.',
  },
  {
    id: 'cond',
    order: 7,
    short: 'If / else',
    name: 'Conditional — if this, then that, otherwise the other',
    kidWords:
      'The robot checks something and picks a path. Only one side of an if/else ever runs.',
    misconception:
      'They think both branches run, or that "else" means "afterwards".',
    teachingMove:
      'Trace tables on the whiteboard. Give the condition a value, walk the path, and physically cross out the branch that did not run. The crossing-out is the idea.',
    masteryCheck:
      'Given an if/else and an input value, they can say which lines run and which are skipped.',
  },
  {
    id: 'bool',
    order: 8,
    short: 'And / or',
    name: 'Combining conditions — and, or, not',
    kidWords:
      '"And" is fussy: everything has to be true. "Or" is easy-going: one is enough.',
    misconception:
      'English "and" leaks in — "if the sensor is 1 and 2" feels reasonable — and "not" gets read as "the opposite thing happens".',
    teachingMove:
      'Truth tables with kids standing up: two students each hold true or false, the class calls the result. Swap and/or and watch the room disagree with itself.',
    masteryCheck:
      'They can say why an "and" condition that looks right never fires, given the two values.',
  },
  {
    id: 'sensornum',
    order: 9,
    short: 'Sensor value',
    name: 'Sensor readings are numbers, not answers',
    kidWords:
      'The line sensor does not say "line" or "no line". It hands you a number, and the number wobbles even when nothing moves.',
    misconception:
      'They expect a clean yes/no, so a reading of 380 when they expected "black" reads as a broken sensor rather than as data.',
    teachingMove:
      'Before any code uses a sensor: put the reading on the display, walk the robot across the tape, write down five numbers on white and five on black. The gap between those two piles is the whole lesson — and it is different on every floor in the building.',
    masteryCheck:
      'They can state their own sensor\'s range on white and on black from numbers they measured, not from the tutorial.',
  },
  {
    id: 'forever',
    order: 10,
    short: 'Forever loop',
    name: 'The forever loop — checking again and again',
    kidWords:
      'A robot that reacts has to keep asking. Forever means check, act, check, act — thousands of times a minute.',
    misconception:
      'The sensor read goes outside the loop, one measurement is taken at start-up, and the robot behaves as if the world froze.',
    teachingMove:
      'Show the bug on purpose: read once outside the loop, drive it, watch it ignore the line. Move the one block inside. Same program, two behaviours — the contrast is the lesson.',
    masteryCheck:
      'They can point at which lines must be inside the forever loop and say why.',
  },
  {
    id: 'threshold',
    order: 11,
    short: 'Threshold',
    name: 'Thresholds — turning a number into a decision',
    kidWords:
      'Pick the number halfway between your white pile and your black pile. Above means one thing, below means the other. That number is yours, not mine.',
    misconception:
      'They copy a threshold from a tutorial or the next table, and it fails because the tape, the light and the sensor height are all different.',
    teachingMove:
      'Make them compute it from their own two piles, write it on their team card with their robot number on it. When it fails after lunch because the blinds opened, that is not a setback — that is the point.',
    masteryCheck:
      'They re-derive their threshold, unprompted, after you move the robot to a different table.',
  },
  {
    id: 'func',
    order: 12,
    short: 'Function',
    name: 'Functions — naming a block of work',
    kidWords: 'If you can name it, you can call it. "turnLeft" is one word that means six blocks.',
    misconception:
      'They define a function and expect it to run because it exists, forgetting that something has to call it.',
    teachingMove:
      'On the projector, pull the repeated four blocks out of their own working program into a named function, together. Refactoring their code beats writing new code from scratch.',
    masteryCheck:
      'They factor a repeated sequence into a function and the robot behaves identically afterwards.',
  },
  {
    id: 'param',
    order: 13,
    short: 'Parameter',
    name: 'Parameters — the same function, a different number',
    kidWords: 'One "turn" function that takes how far, instead of turnALittle, turnMore and turnLots.',
    misconception:
      'They confuse the name inside the function with the value passed in, and try to change the caller by changing the parameter.',
    teachingMove:
      'Three near-identical functions on the board. Ask what is actually different. They will say "the number" — that is the parameter, and they found it.',
    masteryCheck: 'They collapse two similar functions into one with a parameter, unprompted.',
  },
  {
    id: 'error',
    order: 14,
    short: 'Error term',
    name: 'Error — how wrong are you, right now',
    kidWords:
      'Error is target minus actual. It has a size and a sign, and the sign tells you which way you are off.',
    misconception:
      'They drop the sign and use "how far off" as a positive number, so the robot corrects the wrong way half the time.',
    teachingMove:
      'Put the error on the display and push the robot around the line by hand. Watch the number go negative on one side and positive on the other before any motor code exists.',
    masteryCheck:
      'They can predict the sign of the error from which side of the line the robot is sitting on.',
  },
  {
    id: 'propctl',
    order: 15,
    short: 'P-control',
    name: 'Proportional control — correct in proportion to the error',
    kidWords:
      'A small mistake gets a small correction, a big mistake gets a big one. Turn = k × error, and k is how aggressive your robot is.',
    misconception:
      '"Bigger k is better." They crank k until the robot oscillates, then conclude proportional control does not work.',
    teachingMove:
      'Run k far too high in front of everyone and name the wobble. Halve it. Halve it again until it crawls off the line. Both failure modes, ten minutes, before they touch their own.',
    masteryCheck: 'From a robot that is wobbling or drifting, they can say which way to move k and why.',
  },
  {
    id: 'state',
    order: 16,
    short: 'States',
    name: 'State machines — the robot is in a mode',
    kidWords:
      'The robot is always in exactly one mode — searching, following, stopped — and something specific moves it to the next one.',
    misconception:
      'They pile up nested ifs until behaviour depends on the order the conditions happen to be checked, and nobody can say what the robot is doing any more.',
    teachingMove:
      'Three circles and arrows on the whiteboard before any code. Label each arrow with the thing that causes it. A team that cannot name an arrow does not have a state machine yet.',
    masteryCheck:
      'They can draw their robot\'s states and transitions on paper and it matches what their code does.',
  },
  {
    id: 'tuning',
    order: 17,
    short: 'Tuning',
    name: 'Tuning — change one thing, observe, write it down',
    kidWords:
      'Change one number. Run it. Write down what happened and what you will try next. Two changes at once and you have learned nothing.',
    misconception:
      'They change three values between runs, get a better result, cannot reproduce it, and blame the battery.',
    teachingMove:
      'The tuning log is not paperwork, it is the method. Refuse to debug with a team that has not written down their last three runs. Say it once, kindly, then hold the line.',
    masteryCheck:
      'Their log shows single-variable changes with an observation and a next hypothesis for each run.',
  },
  {
    id: 'decompose',
    order: 18,
    short: 'Decompose',
    name: 'Decomposition — build it in testable pieces',
    kidWords:
      'Do not build the whole robot and then test it. Build the smallest piece that can be wrong, prove it works, then add the next one.',
    misconception:
      'They write the entire program, run it, and have no idea which of the six new things is broken.',
    teachingMove:
      'On day one of the open build, each team names three pieces they can test separately and writes them on the board. Point at that board every time they are stuck.',
    masteryCheck: 'When something fails they can isolate which piece it is in before changing any code.',
  },
];

export const conceptsInOrder: Concept[] = [...concepts].sort((a, b) => a.order - b.order);
export const conceptById: ReadonlyMap<string, Concept> = new Map(concepts.map((c) => [c.id, c]));
