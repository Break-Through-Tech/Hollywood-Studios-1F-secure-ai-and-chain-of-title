import { readFileSync } from 'node:fs';
import { loadEvalCases } from './gold.ts';
import { evaluate, parsePredictions } from './metrics.ts';

try {
  const args = process.argv.slice(2);
  if (args.length !== 1) throw new Error('Usage: npm run eval -- <predictions-file>');
  const predictions = parsePredictions(JSON.parse(readFileSync(args[0], 'utf8')));
  console.log(JSON.stringify(evaluate(loadEvalCases(), predictions), null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
