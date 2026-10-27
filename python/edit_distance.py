"""
Edit Distance Module (Levenshtein & Damerau-Levenshtein Algorithms)
Part of NLP Spelling and Grammar Checker Project.

Theoretical Foundation:
- Levenshtein Distance: Minimum number of single-character edits (insertions, deletions, substitutions)
  required to change one word into another.
- Damerau-Levenshtein: Extends Levenshtein by allowing transpositions of two adjacent characters,
  which accounts for ~80% of human typing errors.
- Dynamic Programming Recurrence:
    D[i, j] = min(
        D[i-1, j] + 1,                   # Deletion
        D[i, j-1] + 1,                   # Insertion
        D[i-1, j-1] + cost(s1[i], s2[j]) # Substitution (0 if match, 1 or 2 if different)
    )
"""

from typing import List, Tuple, Dict, Any


def levenshtein_matrix(source: str, target: str, sub_cost: int = 1) -> Tuple[int, List[List[int]]]:
    """
    Computes Levenshtein Distance and the complete DP table.

    Args:
        source: Source word (original / misspelled string)
        target: Target word (candidate string)
        sub_cost: Cost of character substitution (typically 1 or 2)

    Returns:
        (distance, matrix): Final edit distance and full 2D matrix of shape (len(source)+1, len(target)+1)
    """
    m, n = len(source), len(target)
    # Initialize DP matrix with dimensions (m+1) x (n+1)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    # Base cases: cost of transforming string to empty string
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    # Compute recurrence relation
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if source[i - 1].lower() == target[j - 1].lower():
                cost = 0
            else:
                cost = sub_cost
            dp[i][j] = min(
                dp[i - 1][j] + 1,        # Deletion
                dp[i][j - 1] + 1,        # Insertion
                dp[i - 1][j - 1] + cost  # Substitution
            )

    return dp[m][n], dp


def damerau_levenshtein(source: str, target: str) -> Tuple[int, List[List[int]]]:
    """
    Computes Damerau-Levenshtein Distance including adjacent character transpositions.
    """
    m, n = len(source), len(target)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            cost = 0 if source[i - 1].lower() == target[j - 1].lower() else 1
            dp[i][j] = min(
                dp[i - 1][j] + 1,        # Deletion
                dp[i][j - 1] + 1,        # Insertion
                dp[i - 1][j - 1] + cost  # Substitution
            )
            # Transposition check
            if (i > 1 and j > 1 and
                    source[i - 1].lower() == target[j - 2].lower() and
                    source[i - 2].lower() == target[j - 1].lower()):
                dp[i][j] = min(dp[i][j], dp[i - 2][j - 2] + 1)

    return dp[m][n], dp


def backtrack_alignment(source: str, target: str, dp: List[List[int]]) -> List[Dict[str, Any]]:
    """
    Backtraces through the DP matrix to recover the optimal edit path operations.
    """
    i, j = len(source), len(target)
    operations = []

    while i > 0 or j > 0:
        current_val = dp[i][j]

        # Check match or substitution from diagonal
        if i > 0 and j > 0:
            char_s = source[i - 1]
            char_t = target[j - 1]
            match_cost = 0 if char_s.lower() == char_t.lower() else 1
            if current_val == dp[i - 1][j - 1] + match_cost:
                op_type = "MATCH" if match_cost == 0 else "SUBSTITUTE"
                operations.append({
                    "operation": op_type,
                    "source_char": char_s,
                    "target_char": char_t,
                    "pos_source": i - 1,
                    "pos_target": j - 1
                })
                i -= 1
                j -= 1
                continue

        # Check deletion (came from above)
        if i > 0 and current_val == dp[i - 1][j] + 1:
            operations.append({
                "operation": "DELETE",
                "source_char": source[i - 1],
                "target_char": "",
                "pos_source": i - 1,
                "pos_target": j
            })
            i -= 1
            continue

        # Check insertion (came from left)
        if j > 0 and current_val == dp[i][j - 1] + 1:
            operations.append({
                "operation": "INSERT",
                "source_char": "",
                "target_char": target[j - 1],
                "pos_source": i,
                "pos_target": j - 1
            })
            j -= 1
            continue

    operations.reverse()
    return operations


def format_dp_matrix(source: str, target: str, dp: List[List[int]]) -> str:
    """
    Formats the 2D DP matrix as an ASCII grid for terminal or debugging inspection.
    """
    header = ["   ", " # "] + [f" {c} " for c in target]
    rows = [" ".join(header)]
    
    for i in range(len(source) + 1):
        row_char = "#" if i == 0 else source[i - 1]
        row_vals = [f" {dp[i][j]:2d}" for j in range(len(target) + 1)]
        rows.append(f" {row_char} " + "".join(row_vals))

    return "\n".join(rows)


if __name__ == "__main__":
    w1 = "recieve"
    w2 = "receive"
    dist, matrix = levenshtein_matrix(w1, w2)
    print(f"Levenshtein Distance between '{w1}' and '{w2}': {dist}")
    print("\nDynamic Programming Alignment Table:")
    print(format_dp_matrix(w1, w2, matrix))
    print("\nBacktraced Operations:")
    for op in backtrack_alignment(w1, w2, matrix):
        print(f" - {op['operation']}: '{op['source_char']}' -> '{op['target_char']}'")
