export interface SpeakHandle {
  play: (text: string, lang?: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  available: boolean;
  voices: () => SpeechSynthesisVoice[];
}

export function createSpeech(): SpeakHandle {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;

  const pickVoice = (lang: string): SpeechSynthesisVoice | null => {
    if (!synth) return null;
    const voices = synth.getVoices();
    const exact = voices.find((v) => v.lang === lang);
    if (exact) return exact;
    const prefix = lang.split('-')[0];
    return voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ?? null;
  };

  return {
    available: Boolean(synth),
    voices: () => (synth ? synth.getVoices() : []),
    play(text: string, lang = 'en-IN') {
      if (!synth || !text.trim()) return;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      const voice = pickVoice(lang) ?? pickVoice('en-US');
      if (voice) utterance.voice = voice;
      utterance.rate = 0.92;
      utterance.pitch = 1;
      synth.speak(utterance);
    },
    stop() {
      synth?.cancel();
    },
    pause() {
      synth?.pause();
    },
    resume() {
      synth?.resume();
    },
  };
}
