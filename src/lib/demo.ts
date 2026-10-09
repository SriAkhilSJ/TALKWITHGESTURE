export interface DemoStep {
  sign: string;
  phrase: string;
  holdMs: number;
}

export const RAILWAY_DEMO: DemoStep[] = [
  { sign: 'HELP', phrase: 'I NEED HELP', holdMs: 1600 },
  { sign: 'TICKET', phrase: 'I NEED A TICKET', holdMs: 1600 },
  { sign: 'WHERE', phrase: 'WHERE IS IT', holdMs: 1600 },
  { sign: 'THANK YOU', phrase: 'THANK YOU', holdMs: 1600 },
];

export function isDemoLabelVisible(active: boolean): string | null {
  return active ? 'DEMO MODE — controlled sequence, not live recognition' : null;
}
