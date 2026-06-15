import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHashtag, faWallet, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { isValidAddress, isValidTokenId } from '../lib/api'

interface SearchBarProps {
  placeholder?: string
  autoFocus?: boolean
  large?: boolean
}

export function SearchBar({ placeholder, autoFocus, large }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const trimmed = query.trim()

    if (!trimmed) {
      setError('Enter a token ID or wallet address')
      return
    }

    if (/^\d+$/.test(trimmed)) {
      const id = parseInt(trimmed, 10)
      if (!isValidTokenId(id)) {
        setError('Token ID must be 0–9999')
        return
      }
      navigate(`/normie/${id}`)
      return
    }

    const addr = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`
    if (!isValidAddress(addr)) {
      setError('Invalid wallet address')
      return
    }
    navigate(`/wallet/${addr}`)
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        <div
          className={`card-elevated flex items-center gap-2 p-2 ${
            large ? 'sm:p-2.5' : ''
          }`}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder ?? 'Enter token ID (0–9999) or wallet address'}
            autoFocus={autoFocus}
            className={`flex-1 bg-transparent px-3 text-fg placeholder:text-muted focus:outline-none font-mono ${
              large ? 'py-3 text-base sm:text-lg' : 'py-2.5 text-sm'
            }`}
          />
          <button type="submit" className="btn-primary shrink-0">
            {large ? 'Analyze' : 'Go'}
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <QuickChip
          icon={faHashtag}
          label="Try #42"
          onClick={() => navigate('/normie/42')}
        />
        <QuickChip
          icon={faHashtag}
          label="Try #117"
          onClick={() => navigate('/normie/117')}
        />
        <QuickChip
          icon={faWallet}
          label="Wallet lookup"
          hint
        />
      </div>
    </div>
  )
}

function QuickChip({
  icon,
  label,
  onClick,
  hint,
}: {
  icon: typeof faHashtag
  label: string
  onClick?: () => void
  hint?: boolean
}) {
  if (hint) {
    return (
      <span className="badge text-muted">
        <FontAwesomeIcon icon={icon} className="text-fg-soft" />
        {label}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="badge hover:border-border-strong hover:bg-surface-hover transition cursor-pointer"
    >
      <FontAwesomeIcon icon={icon} className="text-fg-soft" />
      {label}
    </button>
  )
}
