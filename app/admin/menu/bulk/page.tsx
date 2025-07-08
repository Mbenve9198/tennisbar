"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowLeft,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  DollarSign,
  Tag,
  MoreHorizontal,
  Settings,
  AlertTriangle
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

interface BulkAction {
  id: string
  name: string
  icon: any
  color: string
  description: string
  requiresConfirm?: boolean
}

export default function BulkOperationsPage() {
  const [allItems, setAllItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showBulkPanel, setShowBulkPanel] = useState(false)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

  const categories = [
    { id: "all", name: "Tutti", emoji: "🔍" },
    { id: "hamburger", name: "Hamburger", emoji: "🍔" },
    { id: "food", name: "Food", emoji: "🍝" },
    { id: "drinks", name: "Drinks", emoji: "🥤" },
    { id: "desserts", name: "Desserts", emoji: "🍰" }
  ]

  const bulkActions: BulkAction[] = [
    {
      id: "make_available",
      name: "Rendi Disponibili",
      icon: Eye,
      color: "bg-green-600",
      description: "Rendi visibili gli items selezionati"
    },
    {
      id: "make_unavailable", 
      name: "Nascondi",
      icon: EyeOff,
      color: "bg-orange-600",
      description: "Nascondi gli items selezionati"
    },
    {
      id: "add_tag",
      name: "Aggiungi Tag",
      icon: Tag,
      color: "bg-blue-600",
      description: "Aggiungi un tag a tutti gli items"
    },
    {
      id: "update_prices",
      name: "Aggiorna Prezzi",
      icon: DollarSign,
      color: "bg-purple-600",
      description: "Modifica i prezzi in blocco"
    },
    {
      id: "delete",
      name: "Elimina",
      icon: Trash2,
      color: "bg-red-600",
      description: "Elimina permanentemente",
      requiresConfirm: true
    }
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

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item._id)))
    }
  }

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const getSelectedItems = () => {
    return allItems.filter(item => selectedItems.has(item._id))
  }

  const handleBulkAction = async (actionId: string) => {
    if (selectedItems.size === 0) return

    const action = bulkActions.find(a => a.id === actionId)
    if (!action) return

    if (action.requiresConfirm) {
      const confirmed = confirm(`Confermi di voler ${action.name.toLowerCase()} ${selectedItems.size} items?`)
      if (!confirmed) return
    }

    setProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log(`Executing ${actionId} on ${selectedItems.size} items`)
      
      // Reset selection
      setSelectedItems(new Set())
      setShowBulkPanel(false)
      
    } catch (error) {
      console.error("Bulk operation failed:", error)
    } finally {
      setProcessing(false)
    }
  }

  const getItemPrice = (item: MenuItem) => {
    if (item.beer_price_30cl && item.beer_price_50cl) {
      return `€${item.beer_price_30cl}/${item.beer_price_50cl}`
    }
    return `€${item.price?.toFixed(2) || "N/A"}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Caricamento items...</p>
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
              onClick={() => router.push("/admin/menu")}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Operazioni Bulk</h1>
              <p className="text-sm text-gray-500">
                {selectedItems.size > 0 ? `${selectedItems.size} selezionati` : `${filteredItems.length} items`}
              </p>
            </div>
          </div>
          {selectedItems.size > 0 && (
            <Button
              onClick={() => setShowBulkPanel(true)}
              className="bg-slate-700 hover:bg-slate-800 text-white"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Azioni ({selectedItems.size})
            </Button>
          )}
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
                placeholder="Cerca items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
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
                </Button>
              ))}
            </div>

            {/* Select All */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  Seleziona tutti ({filteredItems.length})
                </span>
              </div>
              {selectedItems.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItems(new Set())}
                >
                  Deseleziona tutto
                </Button>
              )}
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
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <Card className={`transition-all ${selectedItems.has(item._id) ? 'border-slate-500 bg-slate-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <Checkbox
                        checked={selectedItems.has(item._id)}
                        onCheckedChange={() => handleSelectItem(item._id)}
                        className="mt-1"
                      />

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {item.description || "Nessuna descrizione"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                              {item.subcategory && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.subcategory}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <p className="font-bold text-lg text-gray-900">
                              {getItemPrice(item)}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {item.available ? (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Visibile
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 text-xs">
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Nascosto
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {item.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{item.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
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
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun risultato</h3>
            <p className="text-gray-500">
              {searchQuery ? 
                `Nessun item trovato per "${searchQuery}"` : 
                "Nessun item in questa categoria"
              }
            </p>
          </div>
        )}
      </div>

      {/* Bulk Actions Panel */}
      <AnimatePresence>
        {showBulkPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowBulkPanel(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full bg-white rounded-t-xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Azioni Bulk</h2>
                  <p className="text-sm text-gray-500">
                    {selectedItems.size} items selezionati
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBulkPanel(false)}
                >
                  ✕
                </Button>
              </div>

              {/* Selected Items Preview */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Items Selezionati:</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {getSelectedItems().slice(0, 5).map((item) => (
                    <div key={item._id} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500">- {item.category}</span>
                    </div>
                  ))}
                  {getSelectedItems().length > 5 && (
                    <div className="text-sm text-gray-500">
                      +{getSelectedItems().length - 5} altri items...
                    </div>
                  )}
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="space-y-3">
                {bulkActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => handleBulkAction(action.id)}
                    disabled={processing}
                  >
                    <div className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center mr-4`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{action.name}</p>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                    {action.requiresConfirm && (
                      <AlertTriangle className="w-4 h-4 text-orange-500 ml-auto" />
                    )}
                  </Button>
                ))}
              </div>

              {processing && (
                <div className="mt-6 text-center">
                  <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Elaborazione in corso...</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 