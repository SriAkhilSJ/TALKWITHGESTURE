export type VocabCategory =
  | 'assistance'
  | 'travel'
  | 'emergency'
  | 'response'
  | 'courtesy'
  | 'transaction';

export interface VocabularyEntry {
  sign: string;
  letters: string;
  shortcut: string;
  phrase: string;
  category: VocabCategory;
  locations: Array<'railway' | 'police' | 'post' | 'government'>;
}

/**
 * Controlled MVP vocabulary.
 *
 * The bundled model classifies ISL *alphabet* gestures (A–Z), not a full
 * ISL lexicon. Service phrases are therefore triggered either by:
 *   1. fingerspelling the keyword (Spell mode), or
 *   2. holding the documented shortcut letter (Service mode).
 *
 * Do not describe this list as "full Indian Sign Language".
 */
export const VOCABULARY: VocabularyEntry[] = [
  {
    sign: 'HELP',
    letters: 'HELP',
    shortcut: 'H',
    phrase: 'I NEED HELP',
    category: 'assistance',
    locations: ['railway', 'police', 'post', 'government'],
  },
  {
    sign: 'TICKET',
    letters: 'TICKET',
    shortcut: 'T',
    phrase: 'I NEED A TICKET',
    category: 'travel',
    locations: ['railway'],
  },
  {
    sign: 'POLICE',
    letters: 'POLICE',
    shortcut: 'P',
    phrase: 'I NEED THE POLICE',
    category: 'emergency',
    locations: ['railway', 'police', 'government'],
  },
  {
    sign: 'HOSPITAL',
    letters: 'HOSPITAL',
    shortcut: 'O',
    phrase: 'I NEED A HOSPITAL',
    category: 'emergency',
    locations: ['railway', 'police', 'government'],
  },
  {
    sign: 'WATER',
    letters: 'WATER',
    shortcut: 'W',
    phrase: 'I NEED WATER',
    category: 'assistance',
    locations: ['railway', 'police', 'post', 'government'],
  },
  {
    sign: 'YES',
    letters: 'YES',
    shortcut: 'Y',
    phrase: 'YES',
    category: 'response',
    locations: ['railway', 'police', 'post', 'government'],
  },
  {
    sign: 'NO',
    letters: 'NO',
    shortcut: 'N',
    phrase: 'NO',
    category: 'response',
    locations: ['railway', 'police', 'post', 'government'],
  },
  {
    sign: 'THANK YOU',
    letters: 'THANKS',
    shortcut: 'K',
    phrase: 'THANK YOU',
    category: 'courtesy',
    locations: ['railway', 'police', 'post', 'government'],
  },
  {
    sign: 'WHERE',
    letters: 'WHERE',
    shortcut: 'R',
    phrase: 'WHERE IS IT',
    category: 'travel',
    locations: ['railway', 'post', 'government'],
  },
  {
    sign: 'MONEY',
    letters: 'MONEY',
    shortcut: 'M',
    phrase: 'I NEED TO PAY',
    category: 'transaction',
    locations: ['railway', 'post', 'government'],
  },
  {
    sign: 'REPEAT',
    letters: 'REPEAT',
    shortcut: 'E',
    phrase: 'PLEASE REPEAT',
    category: 'assistance',
    locations: ['railway', 'police', 'post', 'government'],
  },
  {
    sign: 'STOP',
    letters: 'STOP',
    shortcut: 'S',
    phrase: 'PLEASE STOP',
    category: 'response',
    locations: ['police', 'government'],
  },
];

export function findByShortcut(letter: string): VocabularyEntry | undefined {
  const key = letter.trim().toUpperCase();
  return VOCABULARY.find((entry) => entry.shortcut === key);
}

export function matchSpelledWord(buffer: string): VocabularyEntry | undefined {
  const text = buffer.replace(/\s+/g, '').toUpperCase();
  if (!text) return undefined;
  return VOCABULARY.find(
    (entry) => text === entry.letters || text.endsWith(entry.letters),
  );
}

export function featuredFor(
  location: VocabularyEntry['locations'][number],
): VocabularyEntry[] {
  return VOCABULARY.filter((entry) => entry.locations.includes(location));
}
