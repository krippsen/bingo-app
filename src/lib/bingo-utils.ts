/**
 * Winning patterns for a 5x5 bingo grid
 * Each array represents indices that form a winning line
 */
export const WINNING_PATTERNS: number[][] = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
]

/**
 * Check if the marked cells contain a winning bingo pattern
 * @param markedCells - Array of cell indices that are marked
 * @returns true if there's a winning pattern, false otherwise
 */
export function checkForBingo(markedCells: number[]): boolean {
  if (!markedCells || markedCells.length < 5) {
    return false
  }

  const markedSet = new Set(markedCells)

  return WINNING_PATTERNS.some((pattern) =>
    pattern.every((index) => markedSet.has(index))
  )
}

/**
 * Get the winning cells if there's a bingo
 * @param markedCells - Array of cell indices that are marked
 * @returns Array of indices that form the winning pattern, or empty array if no win
 */
export function getWinningCells(markedCells: number[]): number[] {
  if (!markedCells || markedCells.length < 5) {
    return []
  }

  const markedSet = new Set(markedCells)

  for (const pattern of WINNING_PATTERNS) {
    if (pattern.every((index) => markedSet.has(index))) {
      return pattern
    }
  }

  return []
}

/**
 * Create an empty bingo card with 25 empty cells
 * @returns Array of 25 empty strings
 */
export function createEmptyBingoCard(): string[] {
  return Array(25).fill('')
}

/**
 * Create a default bingo card with empty cells
 * @returns Array of 25 empty strings
 */
export function createDefaultBingoCard(): string[] {
  return Array(25).fill('')
}

// Note: localStorage functions removed - marks are now stored on server for shared experience
