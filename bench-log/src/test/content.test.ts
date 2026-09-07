import { describe, expect, it } from 'vitest';
import {
  QUARTERS,
  checkpoints,
  conceptById,
  concepts,
  totalSessions,
  units,
} from '../content';

/**
 * The curriculum is hand-edited TypeScript. These are the checks a text editor
 * cannot make: a typo in a concept id, a duplicated order, a unit that claims
 * six sessions. They run on every push, which is the whole reason there is a CI.
 */

describe('concepts', () => {
  it('have unique ids and a contiguous teaching order starting at 1', () => {
    const ids = new Set(concepts.map((c) => c.id));
    expect(ids.size).toBe(concepts.length);
    const orders = concepts.map((c) => c.order).sort((a, b) => a - b);
    expect(orders).toEqual(concepts.map((_, i) => i + 1));
  });

  it('keep the heatmap column label short enough to read sideways', () => {
    for (const c of concepts) expect(c.short.length, c.id).toBeLessThanOrEqual(13);
  });

  it('say something in every field', () => {
    for (const c of concepts) {
      for (const field of ['name', 'kidWords', 'misconception', 'teachingMove', 'masteryCheck'] as const) {
        expect(c[field].trim().length, `${c.id}.${field}`).toBeGreaterThan(20);
      }
    }
  });

  it('put "score = score + 1" at position 5, where the spec pins it', () => {
    const varchg = conceptById.get('varchg');
    expect(varchg?.order).toBe(5);
    expect(varchg?.name).toContain('score = score + 1');
  });
});

describe('units', () => {
  it('have unique ids and a contiguous order', () => {
    expect(new Set(units.map((u) => u.id)).size).toBe(units.length);
    const orders = units.map((u) => u.order).sort((a, b) => a - b);
    expect(orders).toEqual(units.map((_, i) => i + 1));
  });

  it('only name concepts that exist', () => {
    for (const u of units) {
      expect(u.conceptIds.length, u.id).toBeGreaterThan(0);
      for (const id of u.conceptIds) expect(conceptById.has(id), `${u.id} -> ${id}`).toBe(true);
    }
  });

  it('span 1 to 5 sessions each and roughly a school year in total', () => {
    for (const u of units) {
      expect(u.sessionCount, u.id).toBeGreaterThanOrEqual(1);
      expect(u.sessionCount, u.id).toBeLessThanOrEqual(5);
    }
    expect(totalSessions).toBeGreaterThanOrEqual(28);
    expect(totalSessions).toBeLessThanOrEqual(36);
  });

  it('cover every quarter, in quarter order', () => {
    const seen = units.map((u) => u.quarter);
    for (const q of QUARTERS) expect(seen, q).toContain(q);
    const firstIndex = QUARTERS.map((q) => seen.indexOf(q));
    expect(firstIndex).toEqual([...firstIndex].sort((a, b) => a - b));
  });

  it('touch every concept at least once across the year', () => {
    const touched = new Set(units.flatMap((u) => u.conceptIds));
    for (const c of concepts) expect(touched.has(c.id), c.id).toBe(true);
  });

  it('tell him what he needs to know first, every time', () => {
    for (const u of units) expect(u.teacherPrep.trim().length, u.id).toBeGreaterThan(80);
  });
});

describe('checkpoints', () => {
  it('are one per quarter with globally unique evidence ids', () => {
    expect(checkpoints.map((c) => c.quarter)).toEqual(QUARTERS);
    const ids = checkpoints.flatMap((c) => c.evidenceItems.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of checkpoints) expect(c.evidenceItems.length, c.id).toBeGreaterThanOrEqual(4);
  });
});
