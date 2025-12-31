import { put, list } from '@vercel/blob'
import type { BingoCard } from '@/types'
import { createDefaultBingoCard } from './bingo-utils'

const BINGO_CARD_FILENAME = 'bingo-card.json'

/**
 * Get the bingo card from Vercel Blob storage
 * @returns The bingo card or null if not found
 */
export async function getBingoCard(): Promise<BingoCard | null> {
  try {
    // List blobs to find our bingo card
    const { blobs } = await list({ prefix: BINGO_CARD_FILENAME })

    if (blobs.length === 0) {
      console.log('No blob found, returning null')
      return null
    }

    // Add timestamp to bust any edge/CDN caching
    const urlWithCacheBust = `${blobs[0].url}?t=${Date.now()}`

    // Fetch the blob content with all cache-busting options
    const response = await fetch(urlWithCacheBust, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch blob:', response.status)
      return null
    }

    const card = await response.json() as BingoCard
    console.log('Fetched card with markedCells:', card.markedCells)

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
 * Save the bingo card to Vercel Blob storage (preserves existing markedCells)
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

  const blob = await put(BINGO_CARD_FILENAME, JSON.stringify(card), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  console.log('Saved card to blob:', blob.url)

  return card
}

/**
 * Toggle a cell's marked state (for any user)
 * @param cellIndex - Index of the cell to toggle (0-24)
 * @returns The updated bingo card
 */
export async function toggleCellMark(cellIndex: number): Promise<BingoCard> {
  const card = await getOrCreateBingoCard()

  console.log('Before toggle - markedCells:', card.markedCells, 'toggling index:', cellIndex)

  const markedCells = card.markedCells.includes(cellIndex)
    ? card.markedCells.filter(i => i !== cellIndex)  // Unmark
    : [...card.markedCells, cellIndex]                // Mark

  const updatedCard: BingoCard = {
    ...card,
    markedCells,
    updatedAt: new Date(),
  }

  console.log('After toggle - markedCells:', updatedCard.markedCells)

  const blob = await put(BINGO_CARD_FILENAME, JSON.stringify(updatedCard), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  console.log('Saved toggled card to blob:', blob.url)

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

  await put(BINGO_CARD_FILENAME, JSON.stringify(updatedCard), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
  })

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
  console.log('Creating default bingo card')
  return await saveBingoCard(createDefaultBingoCard())
}
