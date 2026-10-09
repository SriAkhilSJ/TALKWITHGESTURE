# Original ISL-Vision model files

These files are copied from [RecursiveByte/ISL-Vision](https://github.com/RecursiveByte/ISL-Vision) (MIT License):

- `hand_landmark_dnn.keras` — Keras 3 Sequential FFNN, input 127, output 26 softmax classes A–Z
- `scaler.pkl` — sklearn `StandardScaler` fitted on the training landmarks

They are **not used at runtime**. The browser loads:

- `public/models/isl-ffnn/weights.bin`
- `public/models/isl-ffnn/manifest.json`
- `public/models/isl-ffnn/scaler.json`

Re-export after changing the Keras model:

```bash
python tools/export_model.py \
  --keras tools/original-model/hand_landmark_dnn.keras \
  --scaler tools/original-model/scaler.pkl \
  --out public/models/isl-ffnn
```
