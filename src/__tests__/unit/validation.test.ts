import { describe, it, expect } from 'vitest'
import {
  validateCellContent,
  validateBingoCard,
  getCharacterCount,
  isApproachingLimit,
  isAtLimit,
  truncateContent,
} from '@/lib/validation'
import { MAX_CELL_LENGTH } from '@/types'

describe('validateCellContent', () => {
  it('should accept string with 35 characters', () => {
    const content = 'a'.repeat(35)
    const result = validateCellContent(content)
    expect(result.valid).toBe(true)
  })

  it('should accept string with less than 35 characters', () => {
    const result = validateCellContent('Hello World')
    expect(result.valid).toBe(true)
  })

  it('should accept empty string', () => {
    const result = validateCellContent('')
    expect(result.valid).toBe(true)
  })

  it('should reject string with more than 35 characters', () => {
    const content = 'a'.repeat(36)
    const result = validateCellContent(content)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('exceeds maximum length')
  })

  it('should trim whitespace before validation', () => {
    const content = '   Hello   '
    const result = validateCellContent(content)
    expect(result.valid).toBe(true)
  })

  it('should handle special characters', () => {
    const content = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const result = validateCellContent(content)
    expect(result.valid).toBe(true)
  })

  it('should reject non-string input', () => {
    const result = validateCellContent(123 as unknown as string)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('must be a string')
  })
})

describe('validateBingoCard', () => {
  it('should accept valid card with 25 cells', () => {
    const cells = Array(25).fill('')
    const result = validateBingoCard(cells)
    expect(result.valid).toBe(true)
  })

  it('should reject card with less than 25 cells', () => {
    const cells = Array(24).fill('')
    const result = validateBingoCard(cells)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('exactly 25 cells')
  })

  it('should reject card with more than 25 cells', () => {
    const cells = Array(26).fill('')
    const result = validateBingoCard(cells)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('exactly 25 cells')
  })

  it('should reject card with invalid cell content', () => {
    const cells = Array(25).fill('')
    cells[5] = 'a'.repeat(36) // Invalid cell
    const result = validateBingoCard(cells)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Cell 6')
  })

  it('should accept card with all empty cells', () => {
    const cells = Array(25).fill('')
    const result = validateBingoCard(cells)
    expect(result.valid).toBe(true)
  })

  it('should reject non-array input', () => {
    const result = validateBingoCard('not an array')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('must be an array')
  })

  it('should reject null input', () => {
    const result = validateBingoCard(null)
    expect(result.valid).toBe(false)
  })
})

describe('getCharacterCount', () => {
  it('should return correct count for regular string', () => {
    expect(getCharacterCount('Hello')).toBe(5)
  })

  it('should return 0 for empty string', () => {
    expect(getCharacterCount('')).toBe(0)
  })

  it('should trim whitespace', () => {
    expect(getCharacterCount('  Hello  ')).toBe(5)
  })
})

describe('isApproachingLimit', () => {
  it('should return true for 30+ characters', () => {
    expect(isApproachingLimit('a'.repeat(30))).toBe(true)
    expect(isApproachingLimit('a'.repeat(35))).toBe(true)
  })

  it('should return false for less than 30 characters', () => {
    expect(isApproachingLimit('a'.repeat(29))).toBe(false)
  })
})

describe('isAtLimit', () => {
  it('should return true at 35 characters', () => {
    expect(isAtLimit('a'.repeat(35))).toBe(true)
  })

  it('should return true over 35 characters', () => {
    expect(isAtLimit('a'.repeat(40))).toBe(true)
  })

  it('should return false under 35 characters', () => {
    expect(isAtLimit('a'.repeat(34))).toBe(false)
  })
})

describe('truncateContent', () => {
  it('should not truncate short content', () => {
    const content = 'Hello'
    expect(truncateContent(content)).toBe('Hello')
  })

  it('should truncate content over 35 characters', () => {
    const content = 'a'.repeat(40)
    const result = truncateContent(content)
    expect(result).toHaveLength(MAX_CELL_LENGTH)
  })

  it('should trim whitespace', () => {
    const content = '   Hello   '
    expect(truncateContent(content)).toBe('Hello')
  })

  it('should handle exact limit', () => {
    const content = 'a'.repeat(35)
    expect(truncateContent(content)).toHaveLength(35)
  })
})
