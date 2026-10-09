import { useEffect, useMemo, useRef, useState } from 'react';
import { CameraPanel } from './components/CameraPanel';
import { DemoBanner } from './components/DemoBanner';
import { DetectionPanel } from './components/DetectionPanel';
import { HeaderBar } from './components/HeaderBar';
import { SentenceBoard } from './components/SentenceBoard';
import { StaffReply } from './components/StaffReply';
import { VocabularyRail } from './components/VocabularyRail';
import type { CounterLocation } from './config/constants';
import { featuredFor, findByShortcut, type VocabularyEntry } from './data/vocabulary';
import { useCamera } from './hooks/useCamera';
import { useHands } from './hooks/useHands';
import { useOfflineStatus } from './hooks/useOfflineStatus';
import { useRecognition } from './hooks/useRecognition';
import { RAILWAY_DEMO } from './lib/demo';
import {
  addPhrase,
  applyAcceptedLetter,
  clearSentence,
  emptySentence,
  removeLast,
  setText,
  type SentenceState,
} from './lib/sentence';
import { createSpeech } from './lib/speech';
import { createStaffListener } from './lib/stt';
import type { InputMode } from './lib/types';

export default function App() {
  const { online } = useOfflineStatus();
  const camera = useCamera();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hands = useHands(camera.videoRef, canvasRef, camera.active);
  const [location, setLocation] = useState<CounterLocation>('railway');
  const [mode, setMode] = useState<InputMode>('service');
  const [sentence, setSentence] = useState<SentenceState>(emptySentence());
  const [demo, setDemo] = useState(false);
  const [demoLabel, setDemoLabel] = useState<string | null>(null);
  const [staffText, setStaffText] = useState('');
  const [staffError, setStaffError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const speechRef = useRef(createSpeech());
  const listenerRef = useRef(
    createStaffListener(
      (text, final) => {
        setStaffText((prev) => (final ? `${prev} ${text}`.trim() : text));
      },
      (message) => {
        setStaffError(message);
        setListening(false);
      },
    ),
  );

  const recognition = useRecognition(hands.hands, camera.active && !demo);
  const vocab = useMemo(() => featuredFor(location), [location]);

  useEffect(() => {
    if (demo || !recognition.acceptedLetter) return;
    setSentence((prev) => applyAcceptedLetter(prev, recognition.acceptedLetter!, mode));
  }, [demo, mode, recognition.acceptedLetter]);

  useEffect(() => {
    if (!demo) {
      setDemoLabel(null);
      return;
    }
    let cancelled = false;
    setSentence(emptySentence());
    const run = async () => {
      for (const step of RAILWAY_DEMO) {
        if (cancelled) return;
        setDemoLabel(`${step.sign} → ${step.phrase}`);
        setSentence((prev) =>
          addPhrase(prev, {
            sign: step.sign,
            letters: step.sign,
            shortcut: step.sign[0],
            phrase: step.phrase,
            category: 'assistance',
            locations: ['railway'],
          }),
        );
        await wait(step.holdMs);
      }
      if (!cancelled) setDemoLabel('Demo sequence complete');
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [demo]);

  const preview = useMemo(() => {
    if (demo && demoLabel) return demoLabel;
    if (!recognition.letter) return 'No stable sign yet';
    if (mode === 'service') {
      return findByShortcut(recognition.letter)?.phrase ?? recognition.letter;
    }
    return `Letter ${recognition.letter}`;
  }, [demo, demoLabel, mode, recognition.letter]);

  const toggleMic = () => {
    setStaffError(null);
    if (listening) {
      listenerRef.current.stop();
      setListening(false);
      return;
    }
    listenerRef.current.start();
    setListening(true);
  };

  const pickVocab = (entry: VocabularyEntry) => {
    setSentence((prev) => addPhrase(prev, entry));
  };

  return (
    <div className="counter-grid min-h-screen bg-counter-bg text-counter-text">
      <HeaderBar
        online={online}
        engine={recognition.engine}
        location={location}
        onLocation={setLocation}
        demo={demo}
        onToggleDemo={() => setDemo((value) => !value)}
      />
      <DemoBanner visible={demo} stepLabel={demoLabel} />
      <main className="mx-auto grid max-w-7xl gap-5 p-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <CameraPanel
            videoRef={camera.videoRef}
            canvasRef={canvasRef}
            active={camera.active}
            handCount={hands.handCount}
            trackingReady={hands.ready}
            onStart={() => void camera.start()}
            onStop={camera.stop}
            error={camera.error || hands.error || recognition.error}
          />
          <VocabularyRail items={vocab} onPick={pickVocab} />
        </div>
        <div className="space-y-5">
          <DetectionPanel
            letter={demo ? demoLabel?.split(' ')[0] ?? null : recognition.letter}
            phrasePreview={preview}
            confidence={demo ? 1 : recognition.confidence}
            stable={demo ? true : recognition.stable}
            progress={demo ? 1 : recognition.progress}
            mode={mode}
            onMode={setMode}
          />
          <SentenceBoard
            text={sentence.text}
            spelled={sentence.spelled}
            onSpeak={() => speechRef.current.play(sentence.text || staffText)}
            onStopSpeak={() => speechRef.current.stop()}
            onUndo={() => setSentence((prev) => removeLast(prev))}
            onClear={() => setSentence(clearSentence())}
            onEdit={(value) => setSentence(setText(value))}
          />
          <StaffReply
            supported={listenerRef.current.supported}
            listening={listening}
            text={staffText}
            error={staffError}
            onToggle={toggleMic}
            onChange={setStaffText}
          />
          {recognition.loading && (
            <p className="text-sm text-counter-mute">Loading local ISL alphabet model…</p>
          )}
        </div>
      </main>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
