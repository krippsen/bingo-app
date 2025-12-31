'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { AdminGridEditor } from '@/components/AdminCellEditor'
import SwapGridEditor from '@/components/SwapGridEditor'
import BingoCard from '@/components/BingoCard'
import { createDefaultBingoCard } from '@/lib/bingo-utils'

type EditorMode = 'edit' | 'reorganize'

export default function AdminEdit() {
  const { status } = useSession()
  const router = useRouter()
  const [cells, setCells] = useState<string[]>(createDefaultBingoCard())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedCell, setSelectedCell] = useState<number | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode>('edit')

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin')
    }
  }, [status, router])

  // Fetch current bingo card
  useEffect(() => {
    async function fetchCard() {
      try {
        const response = await fetch('/api/bingo', { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data?.cells) {
            setCells(data.data.cells)
          }
        }
      } catch (err) {
        console.error('Error fetching card:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchCard()
    }
  }, [status])

  const handleCellChange = (index: number, value: string) => {
    setCells((prev) => {
      const newCells = [...prev]
      newCells[index] = value
      return newCells
    })
    setSuccess(false)
    setHasChanges(true)
  }

  const handleSelectCell = (index: number) => {
    setSelectedCell(index)
  }

  const handleSwapCells = (indexA: number, indexB: number) => {
    setCells((prev) => {
      const newCells = [...prev]
      const temp = newCells[indexA]
      newCells[indexA] = newCells[indexB]
      newCells[indexB] = temp
      return newCells
    })
    setSuccess(false)
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/bingo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cells }),
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }

      setSuccess(true)
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
            <svg
              className="w-8 h-8 text-white animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">Loading editor...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="py-6">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Edit Bingo Card
          </h1>
          <p className="text-slate-500 mt-1">
            Customize your bingo card content
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-secondary text-sm"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Editor Panel */}
        <div className="card-elevated p-4 sm:p-6">
          {/* Mode Toggle - Large touch targets for mobile */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setEditorMode('edit')}
                className={`
                  flex items-center justify-center gap-2 py-4 px-3 rounded-lg font-semibold text-base
                  transition-all min-h-[56px]
                  ${editorMode === 'edit'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-transparent text-slate-600 active:bg-slate-200'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Text
              </button>
              <button
                onClick={() => setEditorMode('reorganize')}
                className={`
                  flex items-center justify-center gap-2 py-4 px-3 rounded-lg font-semibold text-base
                  transition-all min-h-[56px]
                  ${editorMode === 'reorganize'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-transparent text-slate-600 active:bg-slate-200'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Reorganize
              </button>
            </div>
          </div>

          {/* Edit Mode */}
          {editorMode === 'edit' && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Edit Content</h2>
                  <p className="text-sm text-slate-500">Tap cells to change text</p>
                </div>
              </div>

              <AdminGridEditor
                cells={cells}
                onChange={handleCellChange}
                selectedCell={selectedCell}
                onSelectCell={handleSelectCell}
              />

              {/* Selected Cell Detail - Mobile optimized */}
              {selectedCell !== null && (
                <div className="mt-6 p-4 rounded-xl bg-blue-50 border-2 border-blue-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-bold text-blue-700">
                      Cell {selectedCell + 1}
                    </span>
                    <button
                      onClick={() => setSelectedCell(null)}
                      className="p-2 rounded-lg bg-blue-100 text-blue-600 active:bg-blue-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={cells[selectedCell]}
                    onChange={(e) => handleCellChange(selectedCell, e.target.value)}
                    placeholder="Enter cell content..."
                    maxLength={35}
                    className="input text-center text-lg py-4 border-2 border-blue-300 focus:border-blue-500"
                  />
                  <div className="flex justify-between mt-3 text-sm text-blue-600">
                    <span>Row {Math.floor(selectedCell / 5) + 1}, Col {(selectedCell % 5) + 1}</span>
                    <span className="font-semibold">{cells[selectedCell].length}/35</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Reorganize Mode */}
          {editorMode === 'reorganize' && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Reorganize Cells</h2>
                  <p className="text-sm text-slate-500">Swap cell positions</p>
                </div>
              </div>

              <SwapGridEditor
                cells={cells}
                onSwap={handleSwapCells}
              />
            </>
          )}
        </div>

        {/* Preview Panel */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Live Preview</h2>
              <p className="text-sm text-slate-500">How players will see it</p>
            </div>
          </div>

          <BingoCard cells={cells} isPreview={true} />

          {/* Reset Player Marks */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              Player Management
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Reset all shared marks to let everyone start fresh
            </p>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to reset all marks? This affects ALL players.')) {
                  try {
                    const response = await fetch('/api/bingo', { method: 'DELETE' })
                    if (response.ok) {
                      alert('All marks have been reset!')
                    } else {
                      alert('Failed to reset marks')
                    }
                  } catch {
                    alert('Error resetting marks')
                  }
                }
              }}
              className="btn btn-danger w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset All Player Marks
            </button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 animate-slide-up">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-rose-700">Error saving changes</p>
            <p className="text-sm text-rose-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-slide-up">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-emerald-700">Changes saved successfully!</p>
            <p className="text-sm text-emerald-600">Your bingo card has been updated.</p>
          </div>
        </div>
      )}

      {/* Save Button - Sticky Footer */}
      <div className="sticky bottom-4 mt-8">
        <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-blue-200">
          <div className="text-center sm:text-left">
            <p className="font-medium text-slate-700">
              {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
            </p>
            <p className="text-sm text-slate-500">
              {hasChanges ? 'Click save to publish your changes' : 'Your bingo card is up to date'}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`btn px-8 py-3 text-lg w-full sm:w-auto ${
              hasChanges ? 'btn-primary' : 'btn-secondary opacity-50'
            }`}
          >
            {isSaving ? (
              <>
                <svg
                  className="w-5 h-5 mr-2 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
