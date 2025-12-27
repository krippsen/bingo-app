'use client'

interface BingoCellProps {
  index: number
  content: string
  isMarked: boolean
  isWinning: boolean
  onToggle: (index: number) => void
  disabled?: boolean
}

export default function BingoCell({
  index,
  content,
  isMarked,
  isWinning,
  onToggle,
  disabled = false,
}: BingoCellProps) {
  // Dynamic font size based on content length for readability
  const getFontSize = () => {
    const len = content.length
    if (len <= 8) return 'text-sm sm:text-base'
    if (len <= 15) return 'text-xs sm:text-sm'
    if (len <= 25) return 'text-[11px] sm:text-xs'
    return 'text-[9px] sm:text-[11px]'
  }

  const handleClick = () => {
    if (!disabled) {
      onToggle(index)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault()
      onToggle(index)
    }
  }

  return (
    <button
      type="button"
      aria-pressed={isMarked}
      aria-label={`Cell ${index + 1}: ${content || 'Empty'}${isMarked ? ', marked' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`
        relative w-full
        flex items-center justify-center
        p-1.5 text-center
        border-2 rounded-lg
        transition-all duration-200 ease-out
        overflow-hidden
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${disabled ? 'cursor-default opacity-90' : 'cursor-pointer active:scale-95'}
        ${
          isWinning
            ? 'bg-green-500 border-green-600 ring-4 ring-green-300 focus-visible:ring-green-400'
            : isMarked
            ? 'bg-blue-600 border-blue-700 shadow-lg focus-visible:ring-blue-400'
            : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50 focus-visible:ring-blue-400'
        }
      `}
      style={{ aspectRatio: '1 / 1.1' }}
    >
      {/* Cell content - optimized for up to 35 characters */}
      <span
        className={`
          ${getFontSize()}
          leading-tight
          font-medium
          overflow-hidden
          w-full
          ${isWinning || isMarked ? 'text-white' : 'text-gray-800'}
        `}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 5,
          WebkitBoxOrient: 'vertical',
          wordBreak: 'break-word',
        }}
      >
        {content || '\u00A0'}
      </span>

      {/* Checkmark for marked cells */}
      {isMarked && !isWinning && (
        <div className="absolute top-0.5 right-0.5 pointer-events-none">
          <svg className="w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Star for winning cells */}
      {isWinning && (
        <div className="absolute top-0.5 right-0.5 pointer-events-none">
          <span className="text-yellow-300 text-sm drop-shadow">★</span>
        </div>
      )}
    </button>
  )
}
