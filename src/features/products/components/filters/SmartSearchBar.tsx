import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { getAutocomplete } from '../../api/productsApi'
import { useQuery } from '@tanstack/react-query'

interface SmartSearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  initialValue?: string
}

export function SmartSearchBar({
  onSearch,
  placeholder = 'Search products...',
  initialValue = '',
}: SmartSearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debouncedQuery = useDebounce(query, 150) // 150ms per UX spec
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Fetch autocomplete suggestions
  const { data: autocomplete, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ['autocomplete', debouncedQuery],
    queryFn: () => getAutocomplete(debouncedQuery, 10),
    enabled: debouncedQuery.length >= 2,
  })

  // Trigger search when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowSuggestions(value.length >= 2)
  }

  const handleClear = () => {
    setQuery('')
    setShowSuggestions(false)
    onSearch('')
  }

  const handleSuggestionClick = (suggestion: { name: string }) => {
    setQuery(suggestion.name)
    setShowSuggestions(false)
    onSearch(suggestion.name)
  }

  const suggestions = autocomplete?.suggestions || []
  const hasSuggestions = suggestions.length > 0

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showSuggestions && query.length >= 2 && (
        <div className="absolute z-50 mt-2 w-full rounded-md border bg-popover shadow-md">
          {isLoadingSuggestions ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Loading suggestions...</span>
            </div>
          ) : hasSuggestions ? (
            <ul className="max-h-60 overflow-auto py-1">
              {suggestions.map(suggestion => (
                <li key={`${suggestion.type}-${suggestion.id}`}>
                  <button
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center justify-between"
                  >
                    <span>{suggestion.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {suggestion.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
