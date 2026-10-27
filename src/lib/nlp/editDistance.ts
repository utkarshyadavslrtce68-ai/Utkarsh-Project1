import { DPMatrixResult, DPOperation } from './types';

/**
 * Computes Levenshtein Distance and the complete Dynamic Programming Matrix.
 */
export function computeLevenshtein(source: string, target: string): DPMatrixResult {
  const m = source.length;
  const n = target.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = source[i - 1]?.toLowerCase() === target[j - 1]?.toLowerCase();
      const cost = match ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,       // Deletion
        dp[i]![j - 1]! + 1,       // Insertion
        dp[i - 1]![j - 1]! + cost // Substitution
      );
    }
  }

  const operations = backtrackAlignment(source, target, dp);
  return {
    distance: dp[m]![n]!,
    matrix: dp,
    operations
  };
}

/**
 * Backtracks through the DP matrix to produce the optimal sequence of alignment operations.
 */
export function backtrackAlignment(source: string, target: string, dp: number[][]): DPOperation[] {
  let i = source.length;
  let j = target.length;
  const ops: DPOperation[] = [];

  while (i > 0 || j > 0) {
    const current = dp[i]![j]!;

    // Check diagonal (Match or Substitution)
    if (i > 0 && j > 0) {
      const sChar = source[i - 1]!;
      const tChar = target[j - 1]!;
      const match = sChar.toLowerCase() === tChar.toLowerCase();
      const cost = match ? 0 : 1;

      if (current === dp[i - 1]![j - 1]! + cost) {
        ops.push({
          type: match ? 'MATCH' : 'SUBSTITUTE',
          sourceChar: sChar,
          targetChar: tChar,
          i: i - 1,
          j: j - 1
        });
        i--;
        j--;
        continue;
      }
    }

    // Check deletion (came from above)
    if (i > 0 && current === dp[i - 1]![j]! + 1) {
      ops.push({
        type: 'DELETE',
        sourceChar: source[i - 1]!,
        targetChar: '',
        i: i - 1,
        j: j
      });
      i--;
      continue;
    }

    // Check insertion (came from left)
    if (j > 0 && current === dp[i]![j - 1]! + 1) {
      ops.push({
        type: 'INSERT',
        sourceChar: '',
        targetChar: target[j - 1]!,
        i: i,
        j: j - 1
      });
      j--;
      continue;
    }
  }

  return ops.reverse();
}
