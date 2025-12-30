import { kv } from '@vercel/kv'
import type { BingoCard } from '@/types'
import { createDefaultBingoCard } from './bingo-utils'

const BINGO_CARD_KEY = 'bingo-card:main'

/**
 * Get the bingo card from storage
 * @returns The bingo card or null if not found
 */
export async function getBingoCard(): Promise<BingoCard | null> {
  try {
    const card = await kv.get<BingoCard>(BINGO_CARD_KEY)
    if (!card) return null

    return {
      ...card,
      markedCells: card.markedCells || [],
      updatedAt: new Date(card.updatedAt),
    }
  } catch (error) {
    console.error('Error reading bingo card:', error)
    return null
  }
}

/**
 * Save the bingo card to storage (preserves existing markedCells)
 * @param cells - Array of 25 cell strings
 * @returns The saved bingo card
 */
export async function saveBingoCard(cells: string[]): Promise<BingoCard> {
  // Preserve existing markedCells if card exists
  const existing = await getBingoCard()

  const card: BingoCard = {
    id: 'main',
    cells,
    markedCells: existing?.markedCells || [],
    updatedAt: new Date(),
  }

  await kv.set(BINGO_CARD_KEY, card)

  return card
}

/**
 * Toggle a cell's marked state (for any user)
 * @param cellIndex - Index of the cell to toggle (0-24)
 * @returns The updated bingo card
 */
export async function toggleCellMark(cellIndex: number): Promise<BingoCard> {
  const card = await getOrCreateBingoCard()

  const markedCells = card.markedCells.includes(cellIndex)
    ? card.markedCells.filter(i => i !== cellIndex)  // Unmark
    : [...card.markedCells, cellIndex]                // Mark

  const updatedCard: BingoCard = {
    ...card,
    markedCells,
    updatedAt: new Date(),
  }

  await kv.set(BINGO_CARD_KEY, updatedCard)

  return updatedCard
}

/**
 * Reset all marked cells (admin only)
 * @returns The updated bingo card with no marks
 */
export async function resetMarkedCells(): Promise<BingoCard> {
  const card = await getOrCreateBingoCard()

  const updatedCard: BingoCard = {
    ...card,
    markedCells: [],
    updatedAt: new Date(),
  }

  await kv.set(BINGO_CARD_KEY, updatedCard)

  return updatedCard
}

/**
 * Get the bingo card or create a default one if it doesn't exist
 * @returns The bingo card
 */
export async function getOrCreateBingoCard(): Promise<BingoCard> {
  const existing = await getBingoCard()
  if (existing) {
    return existing
  }

  // Create default card
  return await saveBingoCard(createDefaultBingoCard())
}
