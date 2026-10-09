import * as tf from '@tensorflow/tfjs';
import { CLASS_TO_CHAR, FEATURE_SIZE, MODEL_PATHS } from '../config/constants';
import { loadDenseNet, forwardFfnn, type DenseNet } from './ffnn';
import {
  applyStandardScaler,
  loadScaler,
  type StandardScalerParams,
} from './scaler';
import type { InferenceEngine, Prediction } from './types';

export interface LocalModel {
  engine: InferenceEngine;
  predict(features: Float32Array | number[]): Prediction;
  dispose(): void;
}

/**
 * Load the landmark classifier for in-browser inference.
 * TensorFlow.js is preferred; a pure-JS FFNN is used if TF.js fails so
 * recognition never depends on a network or a Python backend.
 */
export async function loadLocalModel(): Promise<LocalModel> {
  const scaler = await loadScaler(MODEL_PATHS.scaler);
  const net = await loadDenseNet(MODEL_PATHS.weights, MODEL_PATHS.manifest);

  try {
    await tf.ready();
    const tfModel = buildTfModel(net);
    const probe = tf.zeros([1, FEATURE_SIZE]);
    const out = tfModel.predict(probe) as tf.Tensor;
    out.dispose();
    probe.dispose();
    return makeTfjsModel(tfModel, scaler);
  } catch (error) {
    console.warn('TensorFlow.js unavailable, using JavaScript FFNN', error);
    return makeJsModel(net, scaler);
  }
}

export function makeJsModel(
  net: DenseNet,
  scaler: StandardScalerParams,
): LocalModel {
  return {
    engine: 'javascript',
    predict(features) {
      const scaled = applyStandardScaler(features, scaler);
      return forwardFfnn(scaled, net);
    },
    dispose() {
      /* no-op */
    },
  };
}

function makeTfjsModel(
  model: tf.LayersModel,
  scaler: StandardScalerParams,
): LocalModel {
  return {
    engine: 'tfjs',
    predict(features) {
      const scaled = applyStandardScaler(features, scaler);
      return tf.tidy(() => {
        const input = tf.tensor2d(Array.from(scaled), [1, FEATURE_SIZE]);
        const output = model.predict(input) as tf.Tensor;
        const probabilities = Array.from(output.dataSync());
        let best = 0;
        for (let i = 1; i < probabilities.length; i += 1) {
          if (probabilities[i] > probabilities[best]) best = i;
        }
        return {
          letter: CLASS_TO_CHAR[best],
          index: best,
          confidence: probabilities[best],
          probabilities,
        } satisfies Prediction;
      });
    },
    dispose() {
      model.dispose();
    },
  };
}

function buildTfModel(net: DenseNet): tf.LayersModel {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      units: 256,
      activation: 'relu',
      inputShape: [FEATURE_SIZE],
    }),
  );
  model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 26, activation: 'softmax' }));
  model.setWeights([
    tf.tensor(net.w1, [127, 256]),
    tf.tensor(net.b1, [256]),
    tf.tensor(net.w2, [256, 128]),
    tf.tensor(net.b2, [128]),
    tf.tensor(net.w3, [128, 64]),
    tf.tensor(net.b3, [64]),
    tf.tensor(net.w4, [64, 26]),
    tf.tensor(net.b4, [26]),
  ]);
  return model;
}
