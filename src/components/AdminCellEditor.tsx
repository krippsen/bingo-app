'use client'

import { useState, useRef, useEffect } from 'react'
import { MAX_CELL_LENGTH } from '@/types'
import { getCharacterCount, isApproachingLimit, isAtLimit } from '@/lib/validation'

interface AdminCellEditorProps {
  index: number
  value: string
  onChange: (index: number, value: string) => void
  isSelected?: boolean
  onSelect?: (index: number) => void
}

export default function AdminCellEditor({
  index,
  value,
  onChange,
  isSelected = false,
  onSelect,
}: AdminCellEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const charCount = getCharacterCount(value)
  const approaching = isApproachingLimit(value)
  const atLimit = isAtLimit(value)

  // Focus input when selected
  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSelected])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue.length <= MAX_CELL_LENGTH) {
      onChange(index, newValue)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    onSelect?.(index)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const row = Math.floor(index / 5) + 1
  const col = (index % 5) + 1

  return (
    <div
      className={`
        relative aspect-square w-full
        transition-all duration-300
        ${isSelected ? 'z-10 scale-105' : 'z-0'}
      `}
    >
      {/* Cell container */}
      <div
        className={`
          absolute inset-0 rounded-xl sm:rounded-2xl
          transition-all duration-300
          ${
            isSelected
              ? 'ring-4 ring-blue-500 ring-offset-2 shadow-xl shadow-blue-500/30 bg-blue-50 border-2 border-blue-400'
              : isFocused
              ? 'ring-2 ring-blue-400 shadow-lg bg-blue-50 border-2 border-blue-300'
              : atLimit
              ? 'bg-rose-50 border-2 border-rose-300 shadow-md hover:shadow-lg'
              : approaching
              ? 'bg-amber-50 border-2 border-amber-300 shadow-md hover:shadow-lg'
              : 'bg-white border-2 border-gray-300 hover:border-blue-400 shadow-md hover:shadow-lg'
          }
        `}
      >
        {/* Position indicator */}
        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md z-20">
          {index + 1}
        </div>

        {/* Input container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="..."
            maxLength={MAX_CELL_LENGTH}
            className={`
              w-full text-center bg-transparent
              text-xs sm:text-sm font-medium
              placeholder:text-slate-300
              focus:outline-none
              ${
                atLimit
                  ? 'text-rose-600'
                  : approaching
                  ? 'text-amber-700'
                  : 'text-slate-700'
              }
            `}
            aria-label={`Cell ${index + 1}, Row ${row} Column ${col}`}
          />
        </div>

        {/* Character counter badge */}
        <div
          className={`
            absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-md z-20
            ${
              atLimit
                ? 'bg-rose-500 text-white'
                : approaching
                ? 'bg-amber-500 text-white'
                : charCount > 0
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-300 text-slate-600'
            }
          `}
        >
          {charCount}/{MAX_CELL_LENGTH}
        </div>

      </div>
    </div>
  )
}

// Grid-based editor component for all cells
interface AdminGridEditorProps {
  cells: string[]
  onChange: (index: number, value: string) => void
  selectedCell: number | null
  onSelectCell: (index: number) => void
}

export function AdminGridEditor({
  cells,
  onChange,
  selectedCell,
  onSelectCell,
}: AdminGridEditorProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* BINGO Header */}
      <div className="flex justify-center gap-2 sm:gap-3 mb-4">
        {['B', 'I', 'N', 'G', 'O'].map((letter) => (
          <div
            key={letter}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-600 flex items-center justify-center shadow-md"
          >
            <span className="text-white font-bold text-lg sm:text-xl">
              {letter}
            </span>
          </div>
        ))}
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {cells.map((value, index) => (
          <AdminCellEditor
            key={index}
            index={index}
            value={value}
            onChange={onChange}
            isSelected={selectedCell === index}
            onSelect={onSelectCell}
          />
        ))}
      </div>

      {/* Helper text */}
      <div className="mt-4 text-center text-sm text-slate-500">
        Click any cell to edit. Max {MAX_CELL_LENGTH} characters per cell.
      </div>
    </div>
  )
}
