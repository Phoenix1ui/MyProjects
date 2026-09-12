import { describe, expect, it } from 'vitest';
import { firstName, normaliseStudentName } from '../lib/names';

describe('student names (non-negotiable 3)', () => {
  it('normalises what actually gets typed on a phone', () => {
    for (const input of ['amara t', 'Amara T', 'Amara T.', '  amara   t.  ', 'AMARA T']) {
      const result = normaliseStudentName(input);
      expect(result.ok, input).toBe(true);
      if (result.ok) expect(result.value).toBe('Amara T.');
    }
  });

  it('keeps two-word first names, hyphens, apostrophes and accents', () => {
    const cases: [string, string][] = [
      ['mary jo t', 'Mary Jo T.'],
      ['jean-luc p.', 'Jean-Luc P.'],
      ["o'brien k", "O'brien K."],
      ['josé r', 'José R.'],
    ];
    for (const [input, expected] of cases) {
      const result = normaliseStudentName(input);
      expect(result.ok, input).toBe(true);
      if (result.ok) expect(result.value).toBe(expected);
    }
  });

  it('refuses a full surname and says exactly what to type instead', () => {
    const result = normaliseStudentName('amara thompson');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('Amara T.');
  });

  it('refuses anything that is not a name plus an initial', () => {
    for (const input of ['', '   ', 'Amara', 'A B C D', 'amara t 12', 'amara 7']) {
      expect(normaliseStudentName(input).ok, input).toBe(false);
    }
  });

  it('gives a first name for tight chips', () => {
    expect(firstName('Amara T.')).toBe('Amara');
    expect(firstName('Mary Jo T.')).toBe('Mary Jo');
  });
});
