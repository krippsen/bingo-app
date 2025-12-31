import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateBingoCard, saveBingoCard, toggleCellMark, resetMarkedCells } from '@/lib/db'
import { validateBingoCard } from '@/lib/validation'
import { auth } from '@/lib/auth'
import { TOTAL_CELLS } from '@/types'

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/bingo
 * Fetch the current bingo card
 */
export async function GET() {
  try {
    const card = await getOrCreateBingoCard()
    return NextResponse.json({
      success: true,
      data: card,
    })
  } catch (error) {
    console.error('Error fetching bingo card:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch bingo card',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/bingo
 * Update the bingo card (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Parse request body
    let body: { cells?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON body',
        },
        { status: 400 }
      )
    }

    // Validate cells
    const validation = validateBingoCard(body.cells)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      )
    }

    // Save the card
    const card = await saveBingoCard(body.cells as string[])

    return NextResponse.json({
      success: true,
      data: card,
    })
  } catch (error) {
    console.error('Error updating bingo card:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update bingo card',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bingo
 * Toggle a cell's marked state (any user can do this)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: { cellIndex?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON body',
        },
        { status: 400 }
      )
    }

    // Validate cellIndex
    const cellIndex = body.cellIndex
    if (typeof cellIndex !== 'number' || cellIndex < 0 || cellIndex >= TOTAL_CELLS) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid cellIndex. Must be a number between 0 and ${TOTAL_CELLS - 1}`,
        },
        { status: 400 }
      )
    }

    // Toggle the cell mark
    const card = await toggleCellMark(cellIndex)

    return NextResponse.json({
      success: true,
      data: card,
    })
  } catch (error) {
    console.error('Error toggling cell mark:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to toggle cell mark',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/bingo
 * Reset all marked cells (admin only)
 */
export async function DELETE() {
  try {
    // Check authentication - only admin can reset
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - admin access required',
        },
        { status: 401 }
      )
    }

    // Reset all marks
    const card = await resetMarkedCells()

    return NextResponse.json({
      success: true,
      data: card,
    })
  } catch (error) {
    console.error('Error resetting marks:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset marks',
      },
      { status: 500 }
    )
  }
}
