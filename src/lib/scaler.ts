import { FEATURE_SIZE } from '../config/constants';

export interface StandardScalerParams {
  n_features: number;
  with_mean: boolean;
  with_std: boolean;
  mean: number[];
  scale: number[];
}

/**
 * Apply the training-time sklearn StandardScaler:
 *   z = (x - mean) / scale
 *
 * Scale values of 0 are treated as 1 to avoid division by zero, matching
 * sklearn's behaviour when with_std is true.
 */
export function applyStandardScaler(
  features: Float32Array | number[],
  scaler: StandardScalerParams,
): Float32Array {
  if (scaler.n_features !== FEATURE_SIZE) {
    throw new Error(
      `Scaler expects ${FEATURE_SIZE} features, got n_features=${scaler.n_features}`,
    );
  }
  if (features.length !== FEATURE_SIZE) {
    throw new Error(
      `Feature vector length ${features.length} != ${FEATURE_SIZE}`,
    );
  }
  const out = new Float32Array(FEATURE_SIZE);
  for (let i = 0; i < FEATURE_SIZE; i += 1) {
    const x = features[i];
    const centered = scaler.with_mean ? x - scaler.mean[i] : x;
    const denom =
      scaler.with_std && scaler.scale[i] !== 0 ? scaler.scale[i] : 1;
    out[i] = centered / denom;
  }
  return out;
}

export async function loadScaler(url: string): Promise<StandardScalerParams> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load scaler: ${res.status}`);
  const data = (await res.json()) as StandardScalerParams;
  if (!Array.isArray(data.mean) || !Array.isArray(data.scale)) {
    throw new Error('Invalid scaler.json');
  }
  return data;
}
