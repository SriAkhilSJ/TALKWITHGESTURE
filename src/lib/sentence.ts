import { findByShortcut, matchSpelledWord, type VocabularyEntry } from '../data/vocabulary';
import type { InputMode } from './types';

export interface SentenceState {
  tokens: string[];
  spelled: string;
  text: string;
}

export function emptySentence(): SentenceState {
  return { tokens: [], spelled: '', text: '' };
}

export function joinTokens(tokens: string[]): string {
  return tokens.join(' ').replace(/\s+/g, ' ').trim();
}

export function applyAcceptedLetter(
  state: SentenceState,
  letter: string,
  mode: InputMode,
): SentenceState {
  if (!letter) return state;
  const upper = letter.toUpperCase();

  if (mode === 'service') {
    const entry = findByShortcut(upper);
    if (entry) return addPhrase(state, entry);
    return addToken(state, upper);
  }

  const spelled = `${state.spelled}${upper}`;
  const matched = matchSpelledWord(spelled);
  if (matched) {
    return {
      tokens: [...state.tokens, matched.phrase],
      spelled: '',
      text: joinTokens([...state.tokens, matched.phrase]),
    };
  }
  return { ...state, spelled, text: joinTokens([...state.tokens, spelled]) };
}

export function addPhrase(
  state: SentenceState,
  entry: VocabularyEntry,
): SentenceState {
  const tokens = [...state.tokens, entry.phrase];
  return { tokens, spelled: '', text: joinTokens(tokens) };
}

export function addToken(state: SentenceState, token: string): SentenceState {
  const tokens = [...state.tokens, token];
  return { tokens, spelled: '', text: joinTokens(tokens) };
}

export function removeLast(state: SentenceState): SentenceState {
  if (state.spelled.length > 0) {
    const spelled = state.spelled.slice(0, -1);
    return { ...state, spelled, text: joinTokens([...state.tokens, spelled]) };
  }
  const tokens = state.tokens.slice(0, -1);
  return { tokens, spelled: '', text: joinTokens(tokens) };
}

export function clearSentence(): SentenceState {
  return emptySentence();
}

export function setText(text: string): SentenceState {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return emptySentence();
  return { tokens: [cleaned], spelled: '', text: cleaned };
}
