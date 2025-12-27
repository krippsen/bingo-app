'use client'

import { useState } from 'react'

interface SwapGridEditorProps {
  cells: string[]
  onSwap: (indexA: number, indexB: number) => void
}

export default function SwapGridEditor({ cells, onSwap }: SwapGridEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleCellTap = (index: number) => {
    if (selectedIndex === null) {
      // First tap - select this cell
      setSelectedIndex(index)
    } else if (selectedIndex === index) {
      // Tapped same cell - deselect
      setSelectedIndex(null)
    } else {
      // Second tap on different cell - swap them
      onSwap(selectedIndex, index)
      setSelectedIndex(null)
    }
  }

  const handleCancel = () => {
    setSelectedIndex(null)
  }

  // Dynamic font size based on content length
  const getFontSize = (content: string) => {
    const len = content.length
    if (len <= 8) return 'text-xs'
    if (len <= 15) return 'text-[10px]'
    return 'text-[9px]'
  }

  return (
    <div className="w-full">
      {/* Instructions banner */}
      <div className={`mb-4 p-4 rounded-xl text-center transition-all ${
        selectedIndex !== null
          ? 'bg-purple-100 border-2 border-purple-400'
          : 'bg-slate-100 border-2 border-slate-300'
      }`}>
        {selectedIndex !== null ? (
          <div className="flex flex-col gap-2">
            <p className="text-purple-700 font-bold text-lg">
              Cell {selectedIndex + 1} selected
            </p>
            <p className="text-purple-600 text-sm">
              Tap another cell to swap positions
            </p>
            <button
              onClick={handleCancel}
              className="mt-2 px-6 py-3 bg-white text-purple-700 font-semibold rounded-xl border-2 border-purple-300 active:bg-purple-50 min-h-[48px]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <p className="text-slate-700 font-semibold text-lg">
              Tap a cell to select it
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Then tap another cell to swap their positions
            </p>
          </div>
        )}
      </div>

      {/* BINGO Header */}
      <div className="flex justify-center gap-2 mb-3">
        {['B', 'I', 'N', 'G', 'O'].map((letter) => (
          <div
            key={letter}
            className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-md"
          >
            <span className="text-white font-bold text-xl">{letter}</span>
          </div>
        ))}
      </div>

      {/* Swap Grid - larger cells for mobile */}
      <div className="grid grid-cols-5 gap-2">
        {cells.map((content, index) => {
          const isSelected = selectedIndex === index
          const isSwapTarget = selectedIndex !== null && selectedIndex !== index

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleCellTap(index)}
              className={`
                relative w-full min-h-[72px] p-2
                flex items-center justify-center
                rounded-xl border-3 transition-all duration-200
                ${isSelected
                  ? 'bg-purple-500 border-purple-600 ring-4 ring-purple-300 scale-105 z-10 shadow-xl'
                  : isSwapTarget
                  ? 'bg-purple-50 border-purple-400 border-dashed active:bg-purple-100'
                  : 'bg-white border-slate-300 active:bg-slate-100'
                }
              `}
              style={{ aspectRatio: '1 / 1.1' }}
            >
              {/* Cell number badge */}
              <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md z-10 ${
                isSelected ? 'bg-white text-purple-600' : 'bg-purple-600 text-white'
              }`}>
                {index + 1}
              </div>

              {/* Swap arrow indicator for selected cell */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shadow-lg z-10">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              )}

              {/* Cell content */}
              <span
                className={`
                  ${getFontSize(content)}
                  leading-tight font-medium text-center w-full
                  ${isSelected ? 'text-white' : 'text-slate-700'}
                `}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                }}
              >
                {content || '\u00A0'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Helper text */}
      <div className="mt-4 text-center text-sm text-slate-500">
        {selectedIndex !== null
          ? `Swapping cell ${selectedIndex + 1}...`
          : 'Tap any cell to start reorganizing'
        }
      </div>
    </div>
  )
}
