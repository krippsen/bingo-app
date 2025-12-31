import { supabase } from './supabase'
import type { BingoCard } from '@/types'
import { createDefaultBingoCard } from './bingo-utils'

const CARD_ID = 'main'

// Database row type
interface BingoCardRow {
  id: string
  cells: string[]
  marked_cells: number[]
  updated_at: string
}

// Convert database row to BingoCard
function rowToCard(row: BingoCardRow): BingoCard {
  return {
    id: row.id,
    cells: row.cells,
    markedCells: row.marked_cells,
    updatedAt: new Date(row.updated_at),
  }
}

/**
 * Get the bingo card from Supabase
 * @returns The bingo card or null if not found
 */
export async function getBingoCard(): Promise<BingoCard | null> {
  try {
    const { data, error } = await supabase
      .from('bingo_cards')
      .select('*')
      .eq('id', CARD_ID)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      console.error('Error fetching bingo card:', error)
      return null
    }

    return rowToCard(data)
  } catch (error) {
    console.error('Error reading bingo card:', error)
    return null
  }
}

/**
 * Save the bingo card to Supabase (preserves existing markedCells)
 * @param cells - Array of 25 cell strings
 * @returns The saved bingo card
 */
export async function saveBingoCard(cells: string[]): Promise<BingoCard> {
  // Preserve existing markedCells if card exists
  const existing = await getBingoCard()

  const { data, error } = await supabase
    .from('bingo_cards')
    .upsert({
      id: CARD_ID,
      cells,
      marked_cells: existing?.markedCells || [],
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving bingo card:', error)
    throw new Error('Failed to save bingo card')
  }

  return rowToCard(data)
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

  const { data, error } = await supabase
    .from('bingo_cards')
    .update({
      marked_cells: markedCells,
      updated_at: new Date().toISOString(),
    })
    .eq('id', CARD_ID)
    .select()
    .single()

  if (error) {
    console.error('Error toggling cell mark:', error)
    throw new Error('Failed to toggle cell mark')
  }

  return rowToCard(data)
}

/**
 * Reset all marked cells (admin only)
 * @returns The updated bingo card with no marks
 */
export async function resetMarkedCells(): Promise<BingoCard> {
  const { data, error } = await supabase
    .from('bingo_cards')
    .update({
      marked_cells: [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', CARD_ID)
    .select()
    .single()

  if (error) {
    console.error('Error resetting marked cells:', error)
    throw new Error('Failed to reset marked cells')
  }

  return rowToCard(data)
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
