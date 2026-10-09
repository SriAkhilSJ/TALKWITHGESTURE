import { describe, expect, it, vi } from 'vitest';
import { createSpeech } from '../src/lib/speech';
import { createStaffListener } from '../src/lib/stt';

describe('speech fallbacks', () => {
  it('reports TTS availability from the browser', () => {
    const speech = createSpeech();
    expect(typeof speech.available).toBe('boolean');
    expect(() => speech.play('I NEED HELP')).not.toThrow();
    expect(() => speech.stop()).not.toThrow();
  });

  it('degrades staff STT when the Web Speech API is missing', () => {
    const original = window.SpeechRecognition;
    const originalWebkit = window.webkitSpeechRecognition;
    // @ts-expect-error test override
    window.SpeechRecognition = undefined;
    window.webkitSpeechRecognition = undefined;
    const onError = vi.fn();
    const listener = createStaffListener(() => undefined, onError);
    expect(listener.supported).toBe(false);
    listener.start();
    expect(onError).toHaveBeenCalled();
    window.SpeechRecognition = original;
    window.webkitSpeechRecognition = originalWebkit;
  });
});
