import { MAX_CELL_LENGTH, TOTAL_CELLS } from '@/types'

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate cell content (max 35 characters)
 * @param content - The cell content to validate
 * @returns Validation result with error message if invalid
 */
export function validateCellContent(content: string): ValidationResult {
  if (typeof content !== 'string') {
    return { valid: false, error: 'Cell content must be a string' }
  }

  const trimmed = content.trim()

  if (trimmed.length > MAX_CELL_LENGTH) {
    return {
      valid: false,
      error: `Cell content exceeds maximum length of ${MAX_CELL_LENGTH} characters`,
    }
  }

  return { valid: true }
}

/**
 * Validate an entire bingo card (25 cells, each max 35 characters)
 * @param cells - Array of 25 cell strings
 * @returns Validation result with error message if invalid
 */
export function validateBingoCard(cells: unknown): ValidationResult {
  if (!Array.isArray(cells)) {
    return { valid: false, error: 'Cells must be an array' }
  }

  if (cells.length !== TOTAL_CELLS) {
    return {
      valid: false,
      error: `Bingo card must have exactly ${TOTAL_CELLS} cells`,
    }
  }

  for (let i = 0; i < cells.length; i++) {
    const cellResult = validateCellContent(cells[i])
    if (!cellResult.valid) {
      return {
        valid: false,
        error: `Cell ${i + 1}: ${cellResult.error}`,
      }
    }
  }

  return { valid: true }
}

/**
 * Get character count for a cell
 * @param content - The cell content
 * @returns Character count
 */
export function getCharacterCount(content: string): number {
  return content.trim().length
}

/**
 * Check if cell is approaching the character limit
 * @param content - The cell content
 * @returns true if 30+ characters
 */
export function isApproachingLimit(content: string): boolean {
  return getCharacterCount(content) >= 30
}

/**
 * Check if cell is at the character limit
 * @param content - The cell content
 * @returns true if exactly at limit
 */
export function isAtLimit(content: string): boolean {
  return getCharacterCount(content) >= MAX_CELL_LENGTH
}

/**
 * Truncate content to max length
 * @param content - The cell content
 * @returns Truncated content
 */
export function truncateContent(content: string): string {
  const trimmed = content.trim()
  if (trimmed.length <= MAX_CELL_LENGTH) {
    return trimmed
  }
  return trimmed.slice(0, MAX_CELL_LENGTH)
}
