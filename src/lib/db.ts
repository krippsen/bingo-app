import { promises as fs } from 'fs'
import path from 'path'
import type { BingoCard } from '@/types'
import { createDefaultBingoCard } from './bingo-utils'

// Simple file-based storage for development
// Replace with Vercel Postgres or KV for production
const DATA_FILE = path.join(process.cwd(), 'data', 'bingo-card.json')

/**
 * Ensure the data directory exists
 */
async function ensureDataDir(): Promise<void> {
  const dataDir = path.dirname(DATA_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

/**
 * Get the bingo card from storage
 * @returns The bingo card or null if not found
 */
export async function getBingoCard(): Promise<BingoCard | null> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(DATA_FILE, 'utf-8')
    const card = JSON.parse(data) as BingoCard
    return {
      ...card,
      markedCells: card.markedCells || [],  // Default to empty array if missing
      updatedAt: new Date(card.updatedAt),
    }
  } catch (error) {
    // File doesn't exist or is invalid, return null
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null
    }
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
  await ensureDataDir()

  // Preserve existing markedCells if card exists
  const existing = await getBingoCard()

  const card: BingoCard = {
    id: 'main',
    cells,
    markedCells: existing?.markedCells || [],
    updatedAt: new Date(),
  }

  await fs.writeFile(DATA_FILE, JSON.stringify(card, null, 2), 'utf-8')

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

  await fs.writeFile(DATA_FILE, JSON.stringify(updatedCard, null, 2), 'utf-8')

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

  await fs.writeFile(DATA_FILE, JSON.stringify(updatedCard, null, 2), 'utf-8')

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
