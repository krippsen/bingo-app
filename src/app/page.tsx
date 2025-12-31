'use client'

import { useState, useEffect } from 'react'
import BingoCard from '@/components/BingoCard'
import type { BingoCard as BingoCardType } from '@/types'

export default function Home() {
  const [bingoCard, setBingoCard] = useState<BingoCardType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBingoCard() {
      try {
        const response = await fetch('/api/bingo', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to fetch bingo card')
        }
        const data = await response.json()
        if (data.success && data.data) {
          setBingoCard(data.data)
        } else {
          setBingoCard(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBingoCard()
  }, [])

  return (
    <div className="py-6 sm:py-10">
      {/* Hero Section */}
      <div className="text-center mb-10">
        {/* Decorative elements */}
        <div className="relative inline-block mb-6">
          <div className="absolute -inset-4 bg-blue-500 rounded-full blur-xl opacity-25 animate-pulse" />
          <div className="relative w-20 h-20 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30 animate-float">
            <svg
              className="w-10 h-10 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-slate-800 mb-4">
          Let&apos;s Play{' '}
          <span className="text-blue-600">
            Bingo!
          </span>
        </h1>

        <p className="text-lg text-slate-500 max-w-md mx-auto mb-2">
          Click on cells to mark them. Complete a row, column, or diagonal to win!
        </p>

        {/* Quick tips */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-sm text-slate-600">Click to mark</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-slate-600">5 in a row wins</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-sm text-slate-600">Shared with everyone</span>
          </div>
        </div>
      </div>

      {/* Bingo Card */}
      <BingoCard
        cells={bingoCard?.cells}
        isLoading={isLoading}
        error={error}
      />

      {/* Fun footer */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white shadow-lg">
          <span className="text-2xl">🎯</span>
          <span className="text-slate-600 font-medium">
            Good luck and have fun!
          </span>
          <span className="text-2xl">🍀</span>
        </div>
      </div>
    </div>
  )
}
