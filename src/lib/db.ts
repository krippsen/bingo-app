import { put, list, del } from '@vercel/blob'
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
      console.log('[DB] No blob found')
      return null
    }

    // Get the most recent blob (in case there are multiples)
    const blob = blobs[0]
    console.log('[DB] Found blob:', blob.pathname, 'URL:', blob.url)

    // Add timestamp to bust any edge/CDN caching
    const urlWithCacheBust = `${blob.url}?t=${Date.now()}&r=${Math.random()}`

    // Fetch the blob content with all cache-busting options
    const response = await fetch(urlWithCacheBust, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    })

    if (!response.ok) {
      console.error('[DB] Failed to fetch blob:', response.status)
      return null
    }

    const card = await response.json() as BingoCard
    console.log('[DB] Fetched card - cells[0]:', card.cells?.[0], 'markedCells:', card.markedCells?.length || 0)

    return {
      ...card,
      markedCells: card.markedCells || [],
      updatedAt: new Date(card.updatedAt),
    }
  } catch (error) {
    console.error('[DB] Error reading bingo card:', error)
    return null
  }
}

/**
 * Delete all existing bingo card blobs
 */
async function deleteExistingBlobs(): Promise<void> {
  try {
    const { blobs } = await list({ prefix: BINGO_CARD_FILENAME })
    if (blobs.length > 0) {
      console.log('[DB] Deleting', blobs.length, 'existing blob(s)')
      await Promise.all(blobs.map(blob => del(blob.url)))
    }
  } catch (error) {
    console.error('[DB] Error deleting blobs:', error)
  }
}

/**
 * Save the bingo card to Vercel Blob storage (preserves existing markedCells)
 * @param cells - Array of 25 cell strings
 * @returns The saved bingo card
 */
export async function saveBingoCard(cells: string[]): Promise<BingoCard> {
  // Get existing card to preserve markedCells
  const existing = await getBingoCard()

  const card: BingoCard = {
    id: 'main',
    cells,
    markedCells: existing?.markedCells || [],
    updatedAt: new Date(),
  }

  console.log('[DB] Saving card - cells[0]:', cells[0], 'markedCells:', card.markedCells.length)

  // Delete old blobs first to avoid stale data
  await deleteExistingBlobs()

  // Save new blob
  const blob = await put(BINGO_CARD_FILENAME, JSON.stringify(card), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  console.log('[DB] Saved to:', blob.url)

  return card
}

/**
 * Toggle a cell's marked state (for any user)
 * @param cellIndex - Index of the cell to toggle (0-24)
 * @returns The updated bingo card
 */
export async function toggleCellMark(cellIndex: number): Promise<BingoCard> {
  const card = await getOrCreateBingoCard()

  console.log('[DB] Toggle - before:', card.markedCells, 'index:', cellIndex)

  const markedCells = card.markedCells.includes(cellIndex)
    ? card.markedCells.filter(i => i !== cellIndex)  // Unmark
    : [...card.markedCells, cellIndex]                // Mark

  const updatedCard: BingoCard = {
    ...card,
    markedCells,
    updatedAt: new Date(),
  }

  console.log('[DB] Toggle - after:', updatedCard.markedCells)

  // Delete old blobs first
  await deleteExistingBlobs()

  // Save new blob
  const blob = await put(BINGO_CARD_FILENAME, JSON.stringify(updatedCard), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  console.log('[DB] Toggle saved to:', blob.url)

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

  // Delete old blobs first
  await deleteExistingBlobs()

  // Save new blob
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
  console.log('[DB] Creating default bingo card')
  return await saveBingoCard(createDefaultBingoCard())
}
