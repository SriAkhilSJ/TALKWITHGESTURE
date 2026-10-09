import { describe, expect, it } from 'vitest';
import {
  applyAcceptedLetter,
  clearSentence,
  emptySentence,
  removeLast,
  setText,
} from '../src/lib/sentence';
import { findByShortcut, matchSpelledWord } from '../src/data/vocabulary';

describe('sentence builder', () => {
  it('maps a service shortcut to a phrase', () => {
    const next = applyAcceptedLetter(emptySentence(), 'H', 'service');
    expect(next.text).toBe('I NEED HELP');
    expect(findByShortcut('T')?.phrase).toBe('I NEED A TICKET');
  });

  it('builds HELP from fingerspelled letters', () => {
    let state = emptySentence();
    for (const letter of 'HEL') {
      state = applyAcceptedLetter(state, letter, 'spell');
    }
    expect(state.spelled).toBe('HEL');
    state = applyAcceptedLetter(state, 'P', 'spell');
    expect(state.text).toBe('I NEED HELP');
    expect(state.spelled).toBe('');
  });

  it('removes the last token and can clear the sentence', () => {
    let state = applyAcceptedLetter(emptySentence(), 'H', 'service');
    state = applyAcceptedLetter(state, 'T', 'service');
    expect(state.text).toBe('I NEED HELP I NEED A TICKET');
    state = removeLast(state);
    expect(state.text).toBe('I NEED HELP');
    state = clearSentence();
    expect(state.text).toBe('');
  });

  it('allows editing recognized text', () => {
    expect(setText('please wait here').text).toBe('please wait here');
  });

  it('matches spelled vocabulary words', () => {
    expect(matchSpelledWord('TICKET')?.sign).toBe('TICKET');
  });
});
