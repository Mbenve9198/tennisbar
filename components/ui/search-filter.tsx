"use client"

import { useState, useMemo } from "react"
import { Search, Filter, X, ChefHat, Leaf, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { type MenuItem } from "@/hooks/use-menu-data"

interface SearchFilterProps {
  allItems: MenuItem[]
  onFilteredItemsChange: (items: MenuItem[]) => void
  onActiveFiltersChange?: (filters: string[]) => void
}

const quickFilters = [
  {
    id: "popular",
    label: "Popolari",
    icon: Zap,
    color: "bg-yellow-500 hover:bg-yellow-600",
  },
  {
    id: "special", 
    label: "Speciali",
    icon: ChefHat,
    color: "bg-orange-500 hover:bg-orange-600",
  },
  {
    id: "vegetarian",
    label: "Vegetariano", 
    icon: Leaf,
    color: "bg-green-500 hover:bg-green-600",
  }
]

const categoryFilters = [
  { id: "hamburger", label: "🍔 Burger" },
  { id: "food", label: "🍽️ Food" },
  { id: "drinks", label: "🍺 Drinks" },
  { id: "desserts", label: "🍰 Dolci" }
]

export function SearchFilter({ 
  allItems, 
  onFilteredItemsChange, 
  onActiveFiltersChange 
}: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Ricerca fuzzy e filtri
  const filteredItems = useMemo(() => {
    let items = allItems

    // Filtro per termine di ricerca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Filtro per tags attivi
    if (activeFilters.length > 0) {
      items = items.filter(item => {
        return activeFilters.every(filter => {
          // Filtri speciali per tag
          if (filter === "popular" || filter === "special" || filter === "vegetarian") {
            return item.tags.includes(filter)
          }
          // Filtri per categoria (assumendo che categoryId contenga section)
          return true // Per ora semplifico, ma potremmo aggiungere logica categoria
        })
      })
    }

    return items
  }, [allItems, searchTerm, activeFilters])

  // Aggiorna i risultati quando cambiano
  useMemo(() => {
    onFilteredItemsChange(filteredItems)
    onActiveFiltersChange?.(activeFilters)
  }, [filteredItems, activeFilters, onFilteredItemsChange, onActiveFiltersChange])

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    )
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setActiveFilters([])
  }

  const hasActiveFilters = searchTerm || activeFilters.length > 0

  return (
    <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Cerca nel menu... (es. hamburger, birra, dolci)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-12 h-12 text-base"
        />
        {searchTerm && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSearchTerm("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {quickFilters.map(filter => {
          const isActive = activeFilters.includes(filter.id)
          const Icon = filter.icon
          
          return (
            <Button
              key={filter.id}
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={() => toggleFilter(filter.id)}
              className={`flex items-center gap-1 whitespace-nowrap ${
                isActive ? filter.color + " text-white" : ""
              }`}
            >
              <Icon className="w-3 h-3" />
              {filter.label}
            </Button>
          )
        })}
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1"
        >
          <Filter className="w-3 h-3" />
          Più filtri
        </Button>
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <Card className="p-3 mb-3">
          <h4 className="text-sm font-medium mb-2">Categorie</h4>
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map(filter => (
              <Button
                key={filter.id}
                size="sm" 
                variant={activeFilters.includes(filter.id) ? "default" : "outline"}
                onClick={() => toggleFilter(filter.id)}
                className="text-xs"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Active Filters & Results */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <>
              <span className="text-gray-600 dark:text-gray-300">
                {filteredItems.length} di {allItems.length} piatti
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAllFilters}
                className="text-xs h-6 px-2"
              >
                <X className="w-3 h-3 mr-1" />
                Pulisci
              </Button>
            </>
          )}
        </div>

        {/* Active Filter Badges */}
        {activeFilters.length > 0 && (
          <div className="flex gap-1 overflow-x-auto">
            {activeFilters.map(filterId => {
              const filter = quickFilters.find(f => f.id === filterId) || 
                          categoryFilters.find(f => f.id === filterId)
              return filter ? (
                <Badge
                  key={filterId}
                  variant="secondary"
                  className="text-xs cursor-pointer"
                  onClick={() => toggleFilter(filterId)}
                >
                  {filter.label}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ) : null
            })}
          </div>
        )}
      </div>
    </div>
  )
} 