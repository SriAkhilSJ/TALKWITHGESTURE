import { CLASS_COUNT, CLASS_TO_CHAR, FEATURE_SIZE } from '../config/constants';
import type { Prediction } from './types';

export interface LayerWeights {
  name: string;
  shape: number[];
  offset: number;
  length: number;
}

export interface WeightManifest {
  layers: LayerWeights[];
  dtype: 'float32';
  endianness: 'little';
}

export interface DenseNet {
  w1: Float32Array;
  b1: Float32Array;
  w2: Float32Array;
  b2: Float32Array;
  w3: Float32Array;
  b3: Float32Array;
  w4: Float32Array;
  b4: Float32Array;
}

/**
 * Pure-JS forward pass of the original Keras Sequential:
 *   Dense(127→256, relu) → Dense(256→128, relu) → Dense(128→64, relu)
 *   → Dense(64→26, softmax)
 *
 * Dropout layers are inference-no-ops and are omitted.
 */
export function forwardFfnn(
  scaled: Float32Array | number[],
  net: DenseNet,
): Prediction {
  if (scaled.length !== FEATURE_SIZE) {
    throw new Error(`Expected ${FEATURE_SIZE} scaled features`);
  }
  const h1 = denseRelu(scaled, net.w1, net.b1, FEATURE_SIZE, 256);
  const h2 = denseRelu(h1, net.w2, net.b2, 256, 128);
  const h3 = denseRelu(h2, net.w3, net.b3, 128, 64);
  const logits = denseLinear(h3, net.w4, net.b4, 64, CLASS_COUNT);
  const probabilities = softmax(logits);
  let best = 0;
  for (let i = 1; i < probabilities.length; i += 1) {
    if (probabilities[i] > probabilities[best]) best = i;
  }
  return {
    letter: CLASS_TO_CHAR[best],
    index: best,
    confidence: probabilities[best],
    probabilities: Array.from(probabilities),
  };
}

export function parseWeightBuffer(
  buffer: ArrayBuffer,
  manifest: WeightManifest,
): DenseNet {
  const view = new DataView(buffer);
  const read = (layerName: string): Float32Array => {
    const layer = manifest.layers.find((item) => item.name === layerName);
    if (!layer) throw new Error(`Missing layer ${layerName}`);
    const count = layer.length / 4;
    const out = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      out[i] = view.getFloat32(layer.offset + i * 4, true);
    }
    return out;
  };
  return {
    w1: read('dense/kernel'),
    b1: read('dense/bias'),
    w2: read('dense_1/kernel'),
    b2: read('dense_1/bias'),
    w3: read('dense_2/kernel'),
    b3: read('dense_2/bias'),
    w4: read('dense_3/kernel'),
    b4: read('dense_3/bias'),
  };
}

export async function loadDenseNet(
  weightsUrl: string,
  manifestUrl: string,
): Promise<DenseNet> {
  const [weightsRes, manifestRes] = await Promise.all([
    fetch(weightsUrl),
    fetch(manifestUrl),
  ]);
  if (!weightsRes.ok) throw new Error(`Failed to load weights: ${weightsRes.status}`);
  if (!manifestRes.ok) {
    throw new Error(`Failed to load manifest: ${manifestRes.status}`);
  }
  const manifest = (await manifestRes.json()) as WeightManifest;
  const buffer = await weightsRes.arrayBuffer();
  return parseWeightBuffer(buffer, manifest);
}

function denseRelu(
  input: ArrayLike<number>,
  kernel: Float32Array,
  bias: Float32Array,
  inSize: number,
  outSize: number,
): Float32Array {
  const out = denseLinear(input, kernel, bias, inSize, outSize);
  for (let i = 0; i < out.length; i += 1) {
    if (out[i] < 0) out[i] = 0;
  }
  return out;
}

function denseLinear(
  input: ArrayLike<number>,
  kernel: Float32Array,
  bias: Float32Array,
  inSize: number,
  outSize: number,
): Float32Array {
  const out = new Float32Array(outSize);
  for (let o = 0; o < outSize; o += 1) {
    let sum = bias[o];
    for (let i = 0; i < inSize; i += 1) {
      sum += input[i] * kernel[i * outSize + o];
    }
    out[o] = sum;
  }
  return out;
}

function softmax(logits: Float32Array): Float32Array {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i += 1) {
    if (logits[i] > max) max = logits[i];
  }
  const out = new Float32Array(logits.length);
  let total = 0;
  for (let i = 0; i < logits.length; i += 1) {
    const v = Math.exp(logits[i] - max);
    out[i] = v;
    total += v;
  }
  for (let i = 0; i < out.length; i += 1) {
    out[i] /= total;
  }
  return out;
}
