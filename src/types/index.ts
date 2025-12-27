export interface BingoCard {
  id: string
  cells: string[]
  markedCells: number[]  // Shared marked cells - stored on server
  updatedAt: Date
}

export interface BingoState {
  markedCells: number[]
  hasWon: boolean
  winningCells: number[]
}

export interface BingoApiResponse {
  success: boolean
  data?: BingoCard
  error?: string
}

export const GRID_SIZE = 5
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE
export const MAX_CELL_LENGTH = 35
export const CENTER_CELL_INDEX = 12
