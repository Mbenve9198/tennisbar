"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, Reorder, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  GripVertical,
  Save,
  Eye,
  EyeOff,
  FolderPlus,
  Folder,
  Tag,
  Home,
  Menu,
  Settings,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface Category {
  id: string
  name: string
  emoji: string
  description: string
  order: number
  visible: boolean
  itemCount: number
  subcategories?: Subcategory[]
}

interface Subcategory {
  id: string
  name: string
  categoryId: string
  order: number
  visible: boolean
  itemCount: number
}

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("📁")
  const [newCategoryDescription, setNewCategoryDescription] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const router = useRouter()

  // Mock data iniziale
  const initialCategories: Category[] = [
    {
      id: "hamburger",
      name: "Hamburger",
      emoji: "🍔",
      description: "Hamburger classici e speciali",
      order: 1,
      visible: true,
      itemCount: 14,
      subcategories: [
        { id: "classici", name: "Classici", categoryId: "hamburger", order: 1, visible: true, itemCount: 8 },
        { id: "special", name: "Special", categoryId: "hamburger", order: 2, visible: true, itemCount: 6 }
      ]
    },
    {
      id: "food",
      name: "Food",
      emoji: "🍝",
      description: "Piatti italiani e internazionali",
      order: 2,
      visible: true,
      itemCount: 30,
      subcategories: [
        { id: "antipasti", name: "Antipasti", categoryId: "food", order: 1, visible: true, itemCount: 8 },
        { id: "primi", name: "Primi Piatti", categoryId: "food", order: 2, visible: true, itemCount: 12 },
        { id: "secondi", name: "Secondi Piatti", categoryId: "food", order: 3, visible: true, itemCount: 10 }
      ]
    },
    {
      id: "drinks",
      name: "Drinks",
      emoji: "🥤", 
      description: "Bevande, birre e cocktail",
      order: 3,
      visible: true,
      itemCount: 22,
      subcategories: [
        { id: "birre_spina", name: "Birre alla Spina", categoryId: "drinks", order: 1, visible: true, itemCount: 8 },
        { id: "cocktail", name: "Cocktail", categoryId: "drinks", order: 2, visible: true, itemCount: 6 },
        { id: "analcoliche", name: "Analcoliche", categoryId: "drinks", order: 3, visible: true, itemCount: 8 }
      ]
    },
    {
      id: "desserts",
      name: "Desserts",
      emoji: "🍰",
      description: "Dolci e gelati",
      order: 4,
      visible: true,
      itemCount: 15
    }
  ]

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("admin_session")
    if (!isAuthenticated) {
      router.push("/admin")
      return
    }
    
    loadCategories()
  }, [router])

  const loadCategories = async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCategories(initialCategories)
    } catch (error) {
      console.error("Error loading categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReorderCategories = (newOrder: Category[]) => {
    const reorderedCategories = newOrder.map((cat, index) => ({
      ...cat,
      order: index + 1
    }))
    setCategories(reorderedCategories)
    setHasChanges(true)
  }

  const handleReorderSubcategories = (categoryId: string, newSubcategories: Subcategory[]) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: newSubcategories.map((subcat, index) => ({
            ...subcat,
            order: index + 1
          }))
        }
      }
      return cat
    })
    setCategories(updatedCategories)
    setHasChanges(true)
  }

  const toggleCategoryVisibility = (categoryId: string) => {
    const updatedCategories = categories.map(cat => 
      cat.id === categoryId ? { ...cat, visible: !cat.visible } : cat
    )
    setCategories(updatedCategories)
    setHasChanges(true)
  }

  const toggleSubcategoryVisibility = (categoryId: string, subcategoryId: string) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId && cat.subcategories) {
        return {
          ...cat,
          subcategories: cat.subcategories.map(subcat =>
            subcat.id === subcategoryId ? { ...subcat, visible: !subcat.visible } : subcat
          )
        }
      }
      return cat
    })
    setCategories(updatedCategories)
    setHasChanges(true)
  }

  const addNewCategory = () => {
    if (!newCategoryName.trim()) return

    const newCategory: Category = {
      id: newCategoryName.toLowerCase().replace(/\s+/g, '_'),
      name: newCategoryName,
      emoji: newCategoryEmoji,
      description: newCategoryDescription,
      order: categories.length + 1,
      visible: true,
      itemCount: 0
    }

    setCategories([...categories, newCategory])
    setNewCategoryName("")
    setNewCategoryDescription("")
    setNewCategoryEmoji("📁")
    setShowAddCategory(false)
    setHasChanges(true)
  }

  const deleteCategory = (categoryId: string) => {
    if (confirm("Eliminare questa categoria? Tutti gli items verranno spostati in 'Non categorizzati'.")) {
      setCategories(categories.filter(cat => cat.id !== categoryId))
      setHasChanges(true)
    }
  }

  const saveChanges = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setHasChanges(false)
      console.log("Categories saved:", categories)
    } catch (error) {
      console.error("Error saving categories:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Caricamento categorie...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Gestione Categorie</h1>
              <p className="text-sm text-gray-500">{categories.length} categorie</p>
            </div>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button
                onClick={saveChanges}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salva
              </Button>
            )}
            <Button
              onClick={() => setShowAddCategory(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Changes Alert */}
        {hasChanges && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              Hai modifiche non salvate. Ricorda di salvare prima di uscire.
            </AlertDescription>
          </Alert>
        )}

        {/* Add New Category */}
        <AnimatePresence>
          {showAddCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nuova Categoria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Nome
                      </label>
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nome categoria"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Emoji
                      </label>
                      <Input
                        value={newCategoryEmoji}
                        onChange={(e) => setNewCategoryEmoji(e.target.value)}
                        placeholder="📁"
                        maxLength={2}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Descrizione
                    </label>
                    <Input
                      value={newCategoryDescription}
                      onChange={(e) => setNewCategoryDescription(e.target.value)}
                      placeholder="Descrizione categoria"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={addNewCategory}
                      disabled={!newCategoryName.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddCategory(false)}
                    >
                      Annulla
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories List with Drag & Drop */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Ordina Categorie
            </CardTitle>
            <p className="text-sm text-gray-500">
              Trascina per riordinare. L'ordine sarà riflesso nel menu cliente.
            </p>
          </CardHeader>
          <CardContent>
            <Reorder.Group
              axis="y"
              values={categories}
              onReorder={handleReorderCategories}
              className="space-y-3"
            >
              {categories.map((category) => (
                <Reorder.Item
                  key={category.id}
                  value={category}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <motion.div
                    layout
                    className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      {/* Drag Handle */}
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      
                      {/* Category Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{category.emoji}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                            <p className="text-sm text-gray-500">{category.description}</p>
                          </div>
                          <Badge variant="secondary" className="ml-auto">
                            {category.itemCount} items
                          </Badge>
                        </div>
                        
                        {/* Subcategories */}
                        {category.subcategories && category.subcategories.length > 0 && (
                          <div className="ml-8">
                            <Reorder.Group
                              axis="y"
                              values={category.subcategories}
                              onReorder={(newSubcategories) => 
                                handleReorderSubcategories(category.id, newSubcategories)
                              }
                              className="space-y-2"
                            >
                              {category.subcategories.map((subcategory) => (
                                <Reorder.Item
                                  key={subcategory.id}
                                  value={subcategory}
                                  className="cursor-grab active:cursor-grabbing"
                                >
                                  <motion.div
                                    layout
                                    className="bg-gray-50 border rounded p-3 flex items-center gap-3"
                                  >
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                    <div className="flex-1">
                                      <span className="font-medium text-gray-700">
                                        {subcategory.name}
                                      </span>
                                      <Badge variant="outline" className="ml-2 text-xs">
                                        {subcategory.itemCount}
                                      </Badge>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleSubcategoryVisibility(category.id, subcategory.id)}
                                      className={subcategory.visible ? "text-green-600" : "text-red-600"}
                                    >
                                      {subcategory.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </Button>
                                  </motion.div>
                                </Reorder.Item>
                              ))}
                            </Reorder.Group>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategoryVisibility(category.id)}
                          className={category.visible ? "text-green-600" : "text-red-600"}
                        >
                          {category.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistiche Categorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <span>{category.emoji}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-700">{category.itemCount}</p>
                    <p className="text-xs text-gray-500">items</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
          <button 
            onClick={() => router.push("/admin/menu")}
            className="p-4 text-center text-gray-600 hover:bg-gray-50"
          >
            <Menu className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Menu</span>
          </button>
          <button className="p-4 text-center bg-slate-700 text-white">
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