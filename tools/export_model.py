#!/usr/bin/env python3
"""Export the ISL-Vision Keras FFNN + StandardScaler for browser inference."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import h5py
import joblib
import numpy as np


LAYER_MAP = {
    "dense/kernel": "layers/dense/vars/0",
    "dense/bias": "layers/dense/vars/1",
    "dense_1/kernel": "layers/dense_1/vars/0",
    "dense_1/bias": "layers/dense_1/vars/1",
    "dense_2/kernel": "layers/dense_2/vars/0",
    "dense_2/bias": "layers/dense_2/vars/1",
    "dense_3/kernel": "layers/dense_3/vars/0",
    "dense_3/bias": "layers/dense_3/vars/1",
}


def export_scaler(scaler_path: Path, out_dir: Path) -> None:
    scaler = joblib.load(scaler_path)
    payload = {
        "n_features": int(scaler.n_features_in_),
        "with_mean": bool(scaler.with_mean),
        "with_std": bool(scaler.with_std),
        "mean": scaler.mean_.astype(float).tolist(),
        "scale": scaler.scale_.astype(float).tolist(),
    }
    (out_dir / "scaler.json").write_text(json.dumps(payload))


def export_weights(keras_path: Path, out_dir: Path) -> None:
    import zipfile

    with zipfile.ZipFile(keras_path) as archive:
        with archive.open("model.weights.h5") as src:
            raw = src.read()
    tmp = out_dir / "_weights.h5"
    tmp.write_bytes(raw)
    blobs: list[bytes] = []
    manifest = {"layers": [], "dtype": "float32", "endianness": "little"}
    offset = 0
    with h5py.File(tmp, "r") as handle:
        for name, path in LAYER_MAP.items():
            array = np.array(handle[path], dtype=np.float32)
            encoded = array.astype("<f4").tobytes()
            blobs.append(encoded)
            manifest["layers"].append(
                {
                    "name": name,
                    "shape": list(array.shape),
                    "offset": offset,
                    "length": len(encoded),
                }
            )
            offset += len(encoded)
    tmp.unlink()
    (out_dir / "weights.bin").write_bytes(b"".join(blobs))
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--keras", type=Path, required=True)
    parser.add_argument("--scaler", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    export_scaler(args.scaler, args.out)
    export_weights(args.keras, args.out)
    print(f"exported browser model to {args.out}")


if __name__ == "__main__":
    main()
