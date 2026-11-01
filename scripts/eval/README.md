# Extraction evaluation

Requires Node 22.6+ with TypeScript stripping (the npm command enables it).
Run: npm run eval -- path/to/predictions.json

Input is a JSON object keyed by exact gold case ID. Each case contains optional
field arrays of raw SuggestionValueMap values, e.g. {"case-id":{"skills":["Editing"]}}.
Object fields must use the shared schema in api/profile/suggest/_types.ts.
Do not wrap entries in "value". Omitted fields mean no predictions.
Unknown IDs and fields fail. Container/value kinds are validated; nested object
schema correctness is the producer's responsibility and differences count as errors.

To generate real predictions once extraction exists, load cases with loadEvalCases,
send only each case's texts to the extractor, group returned suggestions by field,
and save their raw values under that case ID. Do not send gold labels to the model.
Record model version, prompt, settings and dataset revision alongside the prediction
file for reproducibility. No model integration or real predictions currently exist.

Output is JSON with coverage, skipped IDs, per-case counts, per-field metrics and
overall micro metrics. Only supplied cases enter the denominator; an explicit {}
case counts all its gold entries as missed. An empty input evaluates zero cases.
Micro scores sum counts before calculating ratios. TP is a one-to-one matched
entry, FP an unmatched prediction, FN an unmatched label. Precision=TP/(TP+FP),
recall=TP/(TP+FN), F1=2TP/(2TP+FP+FN). Zero denominators produce zero.
Duplicates consume separate labels and excess predictions are FP.

Matching ignores string case and whitespace, and object key order. All other
whole-entry details must agree, including role, production year and work type.
Bio paraphrases and partially correct objects may therefore count as errors.
Confirmation flags and provenance are not scored.

falsePositiveShare=FP/(TP+FP) is only a hallucination proxy (false discovery
proportion), not the classical FP/(FP+TN) rate; true negatives are undefined here.
An unmatched prediction may be source-supported but absent from labels.
unsupportedSourceClaims remains unassessed/null: determining genuinely unsupported
claims requires separate source review, not label mismatch or snippet presence.

The tests synthesize perfect predictions from gold solely to verify evaluator
correctness. Their scores are fixtures, never evidence of model performance.
No ground-truth files are changed.
