import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  checkForBingo,
  getWinningCells,
  createEmptyBingoCard,
  createDefaultBingoCard,
  WINNING_PATTERNS,
} from '@/lib/bingo-utils'

describe('checkForBingo', () => {
  // Row wins
  it('should detect win in first row [0,1,2,3,4]', () => {
    expect(checkForBingo([0, 1, 2, 3, 4])).toBe(true)
  })

  it('should detect win in second row [5,6,7,8,9]', () => {
    expect(checkForBingo([5, 6, 7, 8, 9])).toBe(true)
  })

  it('should detect win in third row [10,11,12,13,14]', () => {
    expect(checkForBingo([10, 11, 12, 13, 14])).toBe(true)
  })

  it('should detect win in fourth row [15,16,17,18,19]', () => {
    expect(checkForBingo([15, 16, 17, 18, 19])).toBe(true)
  })

  it('should detect win in fifth row [20,21,22,23,24]', () => {
    expect(checkForBingo([20, 21, 22, 23, 24])).toBe(true)
  })

  // Column wins
  it('should detect win in first column [0,5,10,15,20]', () => {
    expect(checkForBingo([0, 5, 10, 15, 20])).toBe(true)
  })

  it('should detect win in second column [1,6,11,16,21]', () => {
    expect(checkForBingo([1, 6, 11, 16, 21])).toBe(true)
  })

  it('should detect win in third column [2,7,12,17,22]', () => {
    expect(checkForBingo([2, 7, 12, 17, 22])).toBe(true)
  })

  it('should detect win in fourth column [3,8,13,18,23]', () => {
    expect(checkForBingo([3, 8, 13, 18, 23])).toBe(true)
  })

  it('should detect win in fifth column [4,9,14,19,24]', () => {
    expect(checkForBingo([4, 9, 14, 19, 24])).toBe(true)
  })

  // Diagonal wins
  it('should detect win in main diagonal [0,6,12,18,24]', () => {
    expect(checkForBingo([0, 6, 12, 18, 24])).toBe(true)
  })

  it('should detect win in anti-diagonal [4,8,12,16,20]', () => {
    expect(checkForBingo([4, 8, 12, 16, 20])).toBe(true)
  })

  // No win cases
  it('should return false when no winning pattern', () => {
    expect(checkForBingo([0, 1, 2, 3, 5])).toBe(false)
  })

  it('should return false with empty marks array', () => {
    expect(checkForBingo([])).toBe(false)
  })

  it('should return false with only 4 in a row', () => {
    expect(checkForBingo([0, 1, 2, 3])).toBe(false)
  })

  // Edge cases
  it('should handle duplicate indices in marks', () => {
    expect(checkForBingo([0, 1, 2, 3, 4, 0, 1])).toBe(true)
  })

  it('should handle win with extra marks', () => {
    expect(checkForBingo([0, 1, 2, 3, 4, 7, 15, 22])).toBe(true)
  })

  it('should handle null/undefined gracefully', () => {
    expect(checkForBingo(null as unknown as number[])).toBe(false)
    expect(checkForBingo(undefined as unknown as number[])).toBe(false)
  })
})

describe('getWinningCells', () => {
  it('should return indices of winning cells for row win', () => {
    expect(getWinningCells([0, 1, 2, 3, 4])).toEqual([0, 1, 2, 3, 4])
  })

  it('should return indices of winning cells for column win', () => {
    expect(getWinningCells([0, 5, 10, 15, 20])).toEqual([0, 5, 10, 15, 20])
  })

  it('should return indices of winning cells for diagonal win', () => {
    expect(getWinningCells([0, 6, 12, 18, 24])).toEqual([0, 6, 12, 18, 24])
  })

  it('should return empty array when no win', () => {
    expect(getWinningCells([0, 1, 2])).toEqual([])
  })

  it('should return first winning pattern when multiple wins exist', () => {
    // Has both row [0,1,2,3,4] and column [0,5,10,15,20]
    const result = getWinningCells([0, 1, 2, 3, 4, 5, 10, 15, 20])
    // Should return the first matching pattern (row)
    expect(result).toEqual([0, 1, 2, 3, 4])
  })

  it('should handle empty array', () => {
    expect(getWinningCells([])).toEqual([])
  })

  it('should handle null/undefined gracefully', () => {
    expect(getWinningCells(null as unknown as number[])).toEqual([])
    expect(getWinningCells(undefined as unknown as number[])).toEqual([])
  })
})

describe('createEmptyBingoCard', () => {
  it('should return array of 25 empty strings', () => {
    const card = createEmptyBingoCard()
    expect(card).toHaveLength(25)
    expect(card.every((cell) => cell === '')).toBe(true)
  })
})

describe('createDefaultBingoCard', () => {
  it('should return array of 25 strings with FREE in center', () => {
    const card = createDefaultBingoCard()
    expect(card).toHaveLength(25)
    expect(card[12]).toBe('FREE')
  })

  it('should have empty strings for non-center cells', () => {
    const card = createDefaultBingoCard()
    for (let i = 0; i < 25; i++) {
      if (i !== 12) {
        expect(card[i]).toBe('')
      }
    }
  })
})

describe('WINNING_PATTERNS', () => {
  it('should have 12 winning patterns', () => {
    expect(WINNING_PATTERNS).toHaveLength(12)
  })

  it('should have 5 rows, 5 columns, and 2 diagonals', () => {
    // 5 rows + 5 columns + 2 diagonals = 12
    expect(WINNING_PATTERNS).toHaveLength(12)
  })

  it('each pattern should have 5 indices', () => {
    WINNING_PATTERNS.forEach((pattern) => {
      expect(pattern).toHaveLength(5)
    })
  })

  it('all indices should be between 0 and 24', () => {
    WINNING_PATTERNS.forEach((pattern) => {
      pattern.forEach((index) => {
        expect(index).toBeGreaterThanOrEqual(0)
        expect(index).toBeLessThanOrEqual(24)
      })
    })
  })
})
