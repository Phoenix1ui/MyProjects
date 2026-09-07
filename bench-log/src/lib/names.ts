/**
 * Non-negotiable 3: student data is first name plus last initial. Nothing else,
 * ever. This module is where the rule is enforced, and it is why there is no
 * second name field anywhere in the app.
 */

export type NameResult = { ok: true; value: string } | { ok: false; reason: string };

const LETTER = "A-Za-z\\u00C0-\\u024F'\\u2019-";

/** One or two first-name words, then a single initial with an optional dot. */
const SHAPE = new RegExp(`^([${LETTER}]+(?: [${LETTER}]+)?) ([${LETTER}])\\.?$`);

function titleCase(part: string): string {
  return part
    .split(' ')
    .map((word) =>
      word
        .split('-')
        .map((bit) => (bit ? bit[0].toLocaleUpperCase() + bit.slice(1).toLocaleLowerCase() : bit))
        .join('-'),
    )
    .join(' ');
}

/**
 * Turns whatever gets typed on a phone into the 'Amara T.' shape, or says why
 * it cannot. Accepts 'amara t', 'Amara T', 'Amara T.'; refuses a full surname
 * and tells him what to type instead.
 */
export function normaliseStudentName(raw: string): NameResult {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { ok: false, reason: 'Type a name.' };

  const parts = trimmed.split(' ');
  if (parts.length < 2) return { ok: false, reason: 'Add a last initial, like Amara T.' };
  if (parts.length > 3) {
    return { ok: false, reason: 'Too many names. First name and last initial only.' };
  }

  const match = SHAPE.exec(trimmed);
  if (!match) {
    const last = parts.at(-1)!.replace(/\.$/, '');
    if (last.length > 1) {
      const first = titleCase(parts.slice(0, -1).join(' '));
      return {
        ok: false,
        reason: `Last name must be a single initial. Try ${first} ${last[0].toLocaleUpperCase()}.`,
      };
    }
    return { ok: false, reason: 'Letters only: first name and last initial.' };
  }

  const [, first, initial] = match;
  return { ok: true, value: `${titleCase(first)} ${initial.toLocaleUpperCase()}.` };
}

/** Sort key so 'Amara T.' and 'amara t.' land together. */
export function nameSortKey(displayName: string): string {
  return displayName.toLocaleLowerCase();
}

/** 'Amara T.' -> 'Amara', for tight chips. */
export function firstName(displayName: string): string {
  return displayName.replace(/ [^ ]+\.?$/, '');
}
