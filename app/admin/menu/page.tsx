"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search,
  Plus,
  Filter,
  ArrowLeft,
  MoreVertical,
  Home,
  Menu,
  Settings,
  Tag
} from "lucide-react"
import { AdminAuth } from "@/lib/admin-auth"
import MenuItemEditor from "@/components/admin/menu-item-editor"

// Interfaccia aggiornata per corrispondere al modello
interface IPricing {
  type: 'simple' | 'multiple' | 'range' | 'custom'
  simple?: string
  multiple?: {
    small?: string
    pinta?: string
    [key: string]: string | undefined
  }
  range?: string
  custom?: string
}

interface MenuItem {
  _id: string
  name: string
  description?: string
  categoryId: string
  subcategoryId?: string
  pricing: IPricing
  type?: string
  tags: string[]
  order: number
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface MenuData {
  hamburger: MenuItem[]
  food: MenuItem[]
  drinks: {
    items: MenuItem[]
    subcategories: {
      [key: string]: MenuItem[]
    }
  }
  desserts: MenuItem[]
}

export default function AdminMenuPage() {
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [allItems, setAllItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const router = useRouter()

  const categories = [
    { id: "all", name: "Tutti", emoji: "🔍", count: 0 },
    { id: "hamburger", name: "Hamburger", emoji: "🍔", count: 0 },
    { id: "food", name: "Food", emoji: "🍝", count: 0 },
    { id: "drinks", name: "Drinks", emoji: "🥤", count: 0 },
    { id: "desserts", name: "Desserts", emoji: "🍰", count: 0 }
  ]

  // Check authentication
  useEffect(() => {
    if (!AdminAuth.isAuthenticated()) {
      router.push("/admin")
      return
    }
    
    loadMenuData()
  }, [router])

  const loadMenuData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/menu")
      const data = await response.json()
      
      if (data.success && Array.isArray(data.data)) {
        setMenuData(data.data)
        
        // Flatten all items from the API structure
        const items: MenuItem[] = []
        
        data.data.forEach((category: any) => {
          // Add direct category items
          if (category.items && Array.isArray(category.items)) {
            items.push(...category.items.map((item: any) => ({
              ...item,
              categoryId: category._id,
              tags: item.tags || [],
              pricing: item.pricing || { type: 'simple', simple: '€0,00' },
              order: item.order || 0,
              isActive: item.isActive !== undefined ? item.isActive : true
            })))
          }

          // Add items from subcategories
          if (category.subcategories && Array.isArray(category.subcategories)) {
            category.subcategories.forEach((subcategory: any) => {
              if (subcategory.items && Array.isArray(subcategory.items)) {
                items.push(...subcategory.items.map((item: any) => ({
                  ...item,
                  categoryId: category._id,
                  subcategoryId: subcategory._id,
                  tags: item.tags || [],
                  pricing: item.pricing || { type: 'simple', simple: '€0,00' },
                  order: item.order || 0,
                  isActive: item.isActive !== undefined ? item.isActive : true
                })))
              }
            })
          }
        })
        
        console.log(`Loaded ${items.length} menu items for admin:`, items)
        
        setAllItems(items)
        setFilteredItems(items)
        
        // Update category counts
        categories.forEach(cat => {
          if (cat.id === "all") {
            cat.count = items.length
          } else {
            // Count by section since we need to map back
            const sectionMap: {[key: string]: string} = {
              "hamburger": "hamburger",
              "food": "food", 
              "drinks": "drinks",
              "desserts": "desserts"
            }
            
            cat.count = data.data.filter((apiCategory: any) => 
              apiCategory.section === sectionMap[cat.id]
            ).reduce((total: number, apiCategory: any) => {
              let categoryItemCount = (apiCategory.items || []).length
              if (apiCategory.subcategories) {
                categoryItemCount += apiCategory.subcategories.reduce((subTotal: number, sub: any) => 
                  subTotal + (sub.items || []).length, 0
                )
              }
              return total + categoryItemCount
            }, 0)
          }
        })
      } else {
        console.error("Invalid API response structure:", data)
        setAllItems([])
        setFilteredItems([])
      }
    } catch (error) {
      console.error("Error loading menu data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search
  useEffect(() => {
    let filtered = allItems

    // Category filter - needs to be mapped from section
    if (selectedCategory !== "all") {
      // We need to find items that belong to categories with the right section
      const categoryData = menuData as any
      if (categoryData) {
        const relevantCategoryIds = categoryData
          .filter((cat: any) => cat.section === selectedCategory)
          .map((cat: any) => cat._id)
        
        filtered = filtered.filter(item => 
          relevantCategoryIds.includes(item.categoryId)
        )
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    setFilteredItems(filtered)
  }, [allItems, selectedCategory, searchQuery, menuData])

  const handleItemSave = (updatedItem: MenuItem) => {
    const updatedItems = allItems.map(item => 
      item._id === updatedItem._id ? updatedItem : item
    )
    setAllItems(updatedItems)
    setEditingItem(null)
  }

  const handleItemCancel = () => {
    setEditingItem(null)
  }

  const handleItemDelete = async (item: MenuItem) => {
    if (!confirm(`Sei sicuro di voler eliminare "${item.name}"?\n\nQuesta azione non può essere annullata.`)) {
      return
    }

    try {
      console.log(`Deleting item: ${item.name} (${item._id})`)
      
      const response = await fetch(`/api/menu/${item._id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        // Remove from local state
        const updatedItems = allItems.filter(i => i._id !== item._id)
        setAllItems(updatedItems)
        
        alert(`Item "${item.name}" eliminato!`)
      } else {
        throw new Error(data.error || 'Delete failed')
      }
      
    } catch (error) {
      console.error("Error deleting item:", error)
      alert("Errore durante l'eliminazione: " + (error as Error).message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Caricamento menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/dashboard")}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gestione Menu</h1>
              <p className="text-sm text-gray-500">{filteredItems.length} items</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/admin/menu/bulk")}
              variant="outline"
              size="sm"
            >
              <MoreVertical className="w-4 h-4 mr-2" />
              Bulk
            </Button>
            <Button
              onClick={() => router.push("/admin/menu/add")}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Cerca per nome, descrizione, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-shrink-0"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtri
                </Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                          className="flex-shrink-0"
                        >
                          <span className="mr-2">{category.emoji}</span>
                          {category.name}
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {category.count}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <MenuItemEditor
                  item={item}
                  onSave={handleItemSave}
                  onCancel={handleItemCancel}
                  onDelete={handleItemDelete}
                  isEditing={editingItem?._id === item._id}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nessun item trovato</p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Cancella filtri
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 gap-1">
          <button 
            onClick={() => router.push("/admin/dashboard")}
            className="p-4 text-center text-gray-600 hover:bg-gray-50"
          >
            <Home className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Dashboard</span>
          </button>
          <button className="p-4 text-center bg-slate-700 text-white">
            <Menu className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Menu</span>
          </button>
          <button 
            onClick={() => router.push("/admin/categories")}
            className="p-4 text-center text-gray-600 hover:bg-gray-50"
          >
            <Tag className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Categorie</span>
          </button>
          <button 
            onClick={() => router.push("/admin/settings")}
            className="p-4 text-center text-gray-600 hover:bg-gray-50"
          >
            <Settings className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Impostazioni</span>
          </button>
        </div>
      </div>
    </div>
  )
} 