export interface StaffListener {
  supported: boolean;
  start: () => void;
  stop: () => void;
}

export function createStaffListener(
  onText: (text: string, final: boolean) => void,
  onError: (message: string) => void,
): StaffListener {
  const Ctor =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : undefined;

  if (!Ctor) {
    return {
      supported: false,
      start() {
        onError('Speech-to-text is not available in this browser. Type a reply instead.');
      },
      stop() {
        /* no-op */
      },
    };
  }

  let recognition: SpeechRecognition | null = null;
  let running = false;

  return {
    supported: true,
    start() {
      if (running) return;
      recognition = new Ctor();
      recognition.lang = 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let interim = '';
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const piece = event.results[i][0]?.transcript ?? '';
          if (event.results[i].isFinal) finalText += piece;
          else interim += piece;
        }
        if (finalText) onText(finalText.trim(), true);
        else if (interim) onText(interim.trim(), false);
      };
      recognition.onerror = (event) => {
        running = false;
        onError(event.error || 'Speech recognition failed');
      };
      recognition.onend = () => {
        running = false;
      };
      try {
        recognition.start();
        running = true;
      } catch (error) {
        running = false;
        onError(error instanceof Error ? error.message : 'Could not start microphone');
      }
    },
    stop() {
      running = false;
      recognition?.stop();
      recognition = null;
    },
  };
}
