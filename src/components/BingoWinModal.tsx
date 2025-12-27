'use client'

import { useEffect, useRef, useCallback } from 'react'

interface BingoWinModalProps {
  isOpen: boolean
  onClose: () => void
  onReset: () => void
}

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  duration: number
  size: number
}

export default function BingoWinModal({
  isOpen,
  onClose,
  onReset,
}: BingoWinModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Generate confetti pieces
  const confettiColors = [
    '#14b8a6', // teal-500
    '#0d9488', // teal-600
    '#10b981', // emerald-500
    '#22c55e', // green-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#06b6d4', // cyan-500
    '#0891b2', // cyan-600
  ]

  const generateConfetti = useCallback((): ConfettiPiece[] => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      size: 8 + Math.random() * 8,
    }))
  }, [])

  // Focus trap and keyboard handling
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      setTimeout(() => closeButtonRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handlePlayAgain = () => {
    onReset()
    onClose()
  }

  const confetti = generateConfetti()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bingo-win-title"
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Confetti Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="absolute top-0"
            style={{
              left: `${piece.x}%`,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              backgroundColor: piece.color,
              borderRadius: piece.id % 3 === 0 ? '50%' : '2px',
              animation: `confetti-fall ${piece.duration}s linear ${piece.delay}s infinite`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative mx-4 w-full max-w-md animate-bounce-in"
      >
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-teal-500 rounded-3xl blur-xl opacity-40 animate-pulse" />

        {/* Card */}
        <div className="relative rounded-3xl bg-white p-8 shadow-2xl">
          {/* Close button */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute right-4 top-4 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
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
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Trophy/Celebration Icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/50 animate-float">
                <span className="text-5xl">🏆</span>
              </div>
              {/* Sparkles around the trophy */}
              <span className="absolute top-0 left-1/4 text-2xl animate-ping">✨</span>
              <span className="absolute top-2 right-1/4 text-xl animate-ping" style={{ animationDelay: '0.3s' }}>⭐</span>
              <span className="absolute bottom-0 left-1/3 text-lg animate-ping" style={{ animationDelay: '0.6s' }}>✨</span>
            </div>

            {/* Title */}
            <h2
              id="bingo-win-title"
              className="mb-3 text-5xl font-black text-teal-600"
            >
              BINGO!
            </h2>

            {/* Subtitle */}
            <p className="mb-2 text-xl font-semibold text-slate-800">
              Congratulations! 🎉
            </p>
            <p className="mb-8 text-slate-500">
              You completed a winning pattern!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handlePlayAgain}
                className="btn btn-primary px-8 py-4 text-lg"
              >
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Play Again
              </button>
              <button
                onClick={onClose}
                className="btn btn-secondary px-8 py-4 text-lg"
              >
                Keep Celebrating
              </button>
            </div>
          </div>

          {/* Bottom decoration */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-2 h-2 rounded-full bg-teal-400" />
            <div className="w-2 h-2 rounded-full bg-teal-500" />
            <div className="w-2 h-2 rounded-full bg-teal-600" />
          </div>
        </div>
      </div>

      {/* Extra confetti bursts */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
