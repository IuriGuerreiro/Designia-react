import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'

export function HeaderSearchBar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`)
    } else {
      navigate('/products')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for products..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-10 h-10 border-input focus-visible:ring-primary"
        />
      </div>
    </form>
  )
}
