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
  Edit3,
  Trash2,
  Filter,
  ArrowLeft,
  MoreVertical,
  Eye,
  Home,
  Menu,
  Settings,
  Tag,
  DollarSign,
  Clock,
  Star
} from "lucide-react"

interface MenuItem {
  _id: string
  name: string
  description?: string
  price: number
  beer_price_30cl?: number
  beer_price_50cl?: number
  category: string
  subcategory?: string
  tags: string[]
  available: boolean
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
    const isAuthenticated = localStorage.getItem("admin_session")
    if (!isAuthenticated) {
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
      
      if (data.success) {
        setMenuData(data.data)
        
        // Flatten all items
        const items: MenuItem[] = []
        
        // Hamburger
        if (data.data.hamburger) {
          items.push(...data.data.hamburger.map((item: any) => ({
            ...item,
            category: "hamburger"
          })))
        }
        
        // Food 
        if (data.data.food) {
          items.push(...data.data.food.map((item: any) => ({
            ...item,
            category: "food"
          })))
        }
        
        // Drinks
        if (data.data.drinks?.items) {
          items.push(...data.data.drinks.items.map((item: any) => ({
            ...item,
            category: "drinks"
          })))
        }
        if (data.data.drinks?.subcategories) {
          Object.entries(data.data.drinks.subcategories).forEach(([subcat, subItems]: [string, any]) => {
            if (Array.isArray(subItems)) {
              items.push(...subItems.map((item: any) => ({
                ...item,
                category: "drinks",
                subcategory: subcat
              })))
            }
          })
        }
        
        // Desserts
        if (data.data.desserts) {
          items.push(...data.data.desserts.map((item: any) => ({
            ...item,
            category: "desserts"
          })))
        }
        
        setAllItems(items)
        setFilteredItems(items)
        
        // Update category counts
        categories.forEach(cat => {
          if (cat.id === "all") {
            cat.count = items.length
          } else {
            cat.count = items.filter(item => item.category === cat.id).length
          }
        })
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

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    setFilteredItems(filtered)
  }, [allItems, selectedCategory, searchQuery])

  const getItemPrice = (item: MenuItem) => {
    if (item.beer_price_30cl && item.beer_price_50cl) {
      return `€${item.beer_price_30cl}/${item.beer_price_50cl}`
    }
    return `€${item.price?.toFixed(2) || "N/A"}`
  }

  const getItemTags = (item: MenuItem) => {
    const tags = []
    if (item.tags?.includes("popular")) tags.push({ label: "Popolare", color: "bg-orange-100 text-orange-700" })
    if (item.tags?.includes("special")) tags.push({ label: "Special", color: "bg-purple-100 text-purple-700" })
    if (item.tags?.includes("vegetarian")) tags.push({ label: "Vegetariano", color: "bg-green-100 text-green-700" })
    if (!item.available) tags.push({ label: "Non Disponibile", color: "bg-red-100 text-red-700" })
    return tags
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
        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cerca per nome, descrizione o tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-12"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Category Filters */}
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
                <Card className="border-l-4 border-l-slate-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Item Header */}
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-lg text-gray-900">
                              {getItemPrice(item)}
                            </p>
                            {item.subcategory && (
                              <p className="text-xs text-gray-500 capitalize">
                                {item.subcategory}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Tags */}
                        {getItemTags(item).length > 0 && (
                          <div className="flex gap-1 flex-wrap mb-3">
                            {getItemTags(item).map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className={`text-xs ${tag.color}`}
                              >
                                {tag.label}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/menu/edit/${item._id}`)}
                            className="flex-1"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Modifica
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Toggle availability
                              console.log("Toggle availability for:", item.name)
                            }}
                            className={item.available ? "text-green-600" : "text-red-600"}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Eliminare "${item.name}"?`)) {
                                console.log("Delete item:", item.name)
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun risultato</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 
                `Nessun item trovato per "${searchQuery}"` : 
                "Nessun item in questa categoria"
              }
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                }}
              >
                Pulisci filtri
              </Button>
            )}
          </motion.div>
        )}
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