import { HAND_CONNECTIONS, LANDMARK_COLORS } from '../config/constants';
import type { DetectedHand } from './types';

export function drawHands(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  hands: DetectedHand[],
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  if (!video.videoWidth || !video.videoHeight) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  hands.forEach((hand, handIdx) => {
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = handIdx === 0 ? '#34D399' : '#22D3EE';
    for (const [a, b] of HAND_CONNECTIONS) {
      const start = hand.landmarks[a];
      const end = hand.landmarks[b];
      if (!start || !end) continue;
      ctx.beginPath();
      ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
      ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
      ctx.stroke();
    }

    hand.landmarks.forEach((lm, idx) => {
      const x = lm.x * canvas.width;
      const y = lm.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = colorFor(idx);
      ctx.fill();
      if (idx === 0) {
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#F5C518';
        ctx.fillText(`${hand.label[0]}`, x + 12, y);
      }
    });
  });

  ctx.restore();
}

function colorFor(idx: number): string {
  if (idx === 0) return LANDMARK_COLORS.wrist;
  if (idx <= 4) return LANDMARK_COLORS.thumb;
  if (idx <= 8) return LANDMARK_COLORS.index;
  if (idx <= 12) return LANDMARK_COLORS.middle;
  if (idx <= 16) return LANDMARK_COLORS.ring;
  return LANDMARK_COLORS.pinky;
}
