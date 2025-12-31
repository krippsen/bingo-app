'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import BingoCell from './BingoCell'
import BingoWinModal from './BingoWinModal'
import {
  checkForBingo,
  getWinningCells,
  createDefaultBingoCard,
} from '@/lib/bingo-utils'
import { GRID_SIZE } from '@/types'
import type { BingoCard as BingoCardType } from '@/types'

interface BingoCardProps {
  cells?: string[]
  markedCells?: number[]
  isLoading?: boolean
  error?: string | null
  isPreview?: boolean
  showReset?: boolean
  onReset?: () => void
}

const POLL_INTERVAL = 3000 // 3 seconds

export default function BingoCard({
  cells: initialCells,
  markedCells: initialMarkedCells,
  isLoading = false,
  error = null,
  isPreview = false,
  showReset = false,
  onReset,
}: BingoCardProps) {
  const [cells, setCells] = useState<string[]>(initialCells || createDefaultBingoCard())
  const [markedCells, setMarkedCells] = useState<number[]>(initialMarkedCells || [])
  const [winningCells, setWinningCells] = useState<number[]>([])
  const [showWinModal, setShowWinModal] = useState(false)
  const [hasWon, setHasWon] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const lastFetchRef = useRef<string>('')

  // Update cells when props change
  useEffect(() => {
    if (initialCells) {
      setCells(initialCells)
    }
  }, [initialCells])

  // Update markedCells when props change
  useEffect(() => {
    if (initialMarkedCells) {
      setMarkedCells(initialMarkedCells)
      lastFetchRef.current = JSON.stringify(initialMarkedCells)
    }
  }, [initialMarkedCells])

  // Poll for updates from server (shared marks from other users)
  useEffect(() => {
    if (isPreview) return

    const fetchUpdates = async () => {
      try {
        const response = await fetch('/api/bingo', { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const card = data.data as BingoCardType
            const marksKey = JSON.stringify(card.markedCells || [])

            // Only update if marks actually changed (avoid unnecessary re-renders)
            if (marksKey !== lastFetchRef.current) {
              lastFetchRef.current = marksKey
              setMarkedCells(card.markedCells || [])
              setCells(card.cells)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching bingo updates:', err)
      }
    }

    // Initial fetch
    fetchUpdates()

    // Set up polling
    const interval = setInterval(fetchUpdates, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [isPreview])

  // Check for bingo win
  useEffect(() => {
    if (markedCells.length >= 5 && !isPreview) {
      if (checkForBingo(markedCells)) {
        const winning = getWinningCells(markedCells)
        setWinningCells(winning)
        if (!hasWon) {
          setHasWon(true)
          setShowWinModal(true)
        }
      } else {
        setWinningCells([])
        setHasWon(false)
      }
    } else {
      setWinningCells([])
      setHasWon(false)
    }
  }, [markedCells, isPreview, hasWon])

  // Toggle cell mark via server - NO optimistic updates, trust server only
  const handleCellToggle = useCallback(async (index: number) => {
    if (isPreview || isToggling) return

    setIsToggling(true)

    try {
      const response = await fetch('/api/bingo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cellIndex: index }),
        cache: 'no-store',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // Update with server state - this is the single source of truth
          setMarkedCells(data.data.markedCells || [])
          setCells(data.data.cells || cells)
          lastFetchRef.current = JSON.stringify(data.data.markedCells || [])
        }
      } else {
        console.error('Failed to toggle cell:', response.status)
      }
    } catch (err) {
      console.error('Error toggling cell:', err)
    } finally {
      setIsToggling(false)
    }
  }, [isPreview, isToggling, cells])

  // Reset all marks via server (admin only)
  const handleReset = useCallback(async () => {
    try {
      const response = await fetch('/api/bingo', {
        method: 'DELETE',
        cache: 'no-store',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setMarkedCells(data.data.markedCells || [])
          lastFetchRef.current = JSON.stringify(data.data.markedCells || [])
        }
        setWinningCells([])
        setHasWon(false)
        setShowWinModal(false)
        onReset?.()
      } else {
        console.error('Failed to reset marks - unauthorized or server error')
      }
    } catch (err) {
      console.error('Error resetting marks:', err)
    }
  }, [onReset])

  const markedCount = markedCells.length

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="card-elevated p-6">
          <div className="flex justify-center gap-2 mb-6">
            {['B', 'I', 'N', 'G', 'O'].map((letter) => (
              <div key={letter} className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="card-elevated p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card-elevated p-5 sm:p-6">
        {/* BINGO Header */}
        <div className="flex justify-center gap-2 mb-5">
          {['B', 'I', 'N', 'G', 'O'].map((letter) => (
            <div
              key={letter}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-blue-600 flex items-center justify-center shadow-md"
            >
              <span className="text-white font-bold text-xl">{letter}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {!isPreview && (
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-semibold text-blue-600">{markedCount}/25</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${(markedCount / 25) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Bingo Grid */}
        <div className="grid grid-cols-5 gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {cells.map((content, index) => (
            <BingoCell
              key={index}
              index={index}
              content={content}
              isMarked={markedCells.includes(index)}
              isWinning={winningCells.includes(index)}
              onToggle={handleCellToggle}
              disabled={isPreview || isToggling}
            />
          ))}
        </div>

        {/* Toggling indicator */}
        {isToggling && (
          <div className="mt-3 text-center text-sm text-gray-500">
            Saving...
          </div>
        )}

        {/* Win banner */}
        {hasWon && !isPreview && (
          <div className="mt-5 p-4 bg-green-100 border-2 border-green-300 rounded-xl text-center animate-fade-in">
            <span className="text-green-800 font-bold text-lg">🎉 BINGO! Everyone wins! 🎉</span>
          </div>
        )}

        {/* Reset button (admin only) */}
        {showReset && (
          <div className="mt-5 text-center">
            <button onClick={handleReset} className="btn btn-danger">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset All Marks
            </button>
          </div>
        )}
      </div>

      {/* Win Modal */}
      {!isPreview && (
        <BingoWinModal
          isOpen={showWinModal}
          onClose={() => setShowWinModal(false)}
          onReset={handleReset}
        />
      )}
    </div>
  )
}
