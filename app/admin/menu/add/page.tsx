"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft,
  Save,
  Plus,
  X,
  DollarSign,
  Tag,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react"

interface NewMenuItem {
  name: string
  description: string
  price: number
  beer_price_30cl?: number
  beer_price_50cl?: number
  category: string
  subcategory?: string
  tags: string[]
  available: boolean
  is_beer: boolean
}

export default function AddMenuItemPage() {
  const [item, setItem] = useState<NewMenuItem>({
    name: "",
    description: "",
    price: 0,
    category: "food",
    tags: [],
    available: true,
    is_beer: false
  })
  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const categories = [
    { id: "hamburger", name: "Hamburger", emoji: "🍔" },
    { id: "food", name: "Food", emoji: "🍝" },
    { id: "drinks", name: "Drinks", emoji: "🥤" },
    { id: "desserts", name: "Desserts", emoji: "🍰" }
  ]

  const subcategoriesMap: { [key: string]: string[] } = {
    drinks: ["birre_spina", "cocktail", "vini", "analcoliche"],
    food: ["antipasti", "primi", "secondi", "contorni"]
  }

  const popularTags = [
    "popular", "special", "vegetarian", "vegan", "gluten-free", 
    "spicy", "seasonal", "new", "bestseller"
  ]

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("admin_session")
    if (!isAuthenticated) {
      router.push("/admin")
      return
    }
  }, [router])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!item.name.trim()) {
      newErrors.name = "Il nome è obbligatorio"
    }
    
    if (!item.description.trim()) {
      newErrors.description = "La descrizione è obbligatoria"
    }

    if (item.is_beer) {
      if (!item.beer_price_30cl || item.beer_price_30cl <= 0) {
        newErrors.beer_price_30cl = "Prezzo 30cl obbligatorio"
      }
      if (!item.beer_price_50cl || item.beer_price_50cl <= 0) {
        newErrors.beer_price_50cl = "Prezzo 50cl obbligatorio"
      }
    } else {
      if (!item.price || item.price <= 0) {
        newErrors.price = "Il prezzo è obbligatorio"
      }
    }

    if (!item.category) {
      newErrors.category = "La categoria è obbligatoria"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSuccess(true)
      
      // Redirect after success
      setTimeout(() => {
        router.push("/admin/menu")
      }, 2000)
      
    } catch (error) {
      console.error("Error saving item:", error)
      setErrors({ general: "Errore nel salvare l'item" })
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !item.tags.includes(newTag.trim())) {
      setItem({ ...item, tags: [...item.tags, newTag.trim()] })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setItem({ ...item, tags: item.tags.filter(tag => tag !== tagToRemove) })
  }

  const togglePopularTag = (tag: string) => {
    if (item.tags.includes(tag)) {
      removeTag(tag)
    } else {
      setItem({ ...item, tags: [...item.tags, tag] })
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Item Aggiunto!</h2>
          <p className="text-gray-600">"{item.name}" è stato aggiunto al menu</p>
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500">Reindirizzamento...</p>
        </motion.div>
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
              <h1 className="text-xl font-bold text-gray-900">Nuovo Item</h1>
              <p className="text-sm text-gray-500">Aggiungi al menu</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salva
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* General Errors */}
        {errors.general && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {errors.general}
            </AlertDescription>
          </Alert>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informazioni Base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nome Item *
              </label>
              <Input
                value={item.name}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                placeholder="Es. Hamburger Classico"
                className={errors.name ? "border-red-300" : ""}
              />
              {errors.name && (
                <p className="text-red-600 text-sm">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Descrizione *
              </label>
              <Textarea
                value={item.description}
                onChange={(e) => setItem({ ...item, description: e.target.value })}
                placeholder="Descrivi gli ingredienti e caratteristiche..."
                rows={3}
                className={errors.description ? "border-red-300" : ""}
              />
              {errors.description && (
                <p className="text-red-600 text-sm">{errors.description}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Categoria *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={item.category === category.id ? "default" : "outline"}
                    onClick={() => setItem({ ...item, category: category.id })}
                    className="justify-start"
                  >
                    <span className="mr-2">{category.emoji}</span>
                    {category.name}
                  </Button>
                ))}
              </div>
              {errors.category && (
                <p className="text-red-600 text-sm">{errors.category}</p>
              )}
            </div>

            {/* Subcategory */}
            {subcategoriesMap[item.category] && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Sottocategoria
                </label>
                <div className="flex gap-2 flex-wrap">
                  {subcategoriesMap[item.category].map((subcat) => (
                    <Button
                      key={subcat}
                      variant={item.subcategory === subcat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setItem({ 
                        ...item, 
                        subcategory: item.subcategory === subcat ? undefined : subcat 
                      })}
                    >
                      {subcat.replace("_", " ")}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Prezzi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Beer toggle */}
            <div className="flex items-center gap-3">
              <Button
                variant={item.is_beer ? "default" : "outline"}
                size="sm"
                onClick={() => setItem({ ...item, is_beer: !item.is_beer })}
              >
                🍺 È una birra?
              </Button>
            </div>

            {item.is_beer ? (
              /* Beer pricing */
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Prezzo 30cl *
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.50"
                      value={item.beer_price_30cl || ""}
                      onChange={(e) => setItem({ 
                        ...item, 
                        beer_price_30cl: parseFloat(e.target.value) || 0 
                      })}
                      placeholder="0.00"
                      className={`pl-8 ${errors.beer_price_30cl ? "border-red-300" : ""}`}
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">€</span>
                  </div>
                  {errors.beer_price_30cl && (
                    <p className="text-red-600 text-sm">{errors.beer_price_30cl}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Prezzo 50cl *
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.50"
                      value={item.beer_price_50cl || ""}
                      onChange={(e) => setItem({ 
                        ...item, 
                        beer_price_50cl: parseFloat(e.target.value) || 0 
                      })}
                      placeholder="0.00"
                      className={`pl-8 ${errors.beer_price_50cl ? "border-red-300" : ""}`}
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">€</span>
                  </div>
                  {errors.beer_price_50cl && (
                    <p className="text-red-600 text-sm">{errors.beer_price_50cl}</p>
                  )}
                </div>
              </div>
            ) : (
              /* Regular pricing */
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Prezzo *
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.50"
                    value={item.price || ""}
                    onChange={(e) => setItem({ 
                      ...item, 
                      price: parseFloat(e.target.value) || 0 
                    })}
                    placeholder="0.00"
                    className={`pl-8 ${errors.price ? "border-red-300" : ""}`}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">€</span>
                </div>
                {errors.price && (
                  <p className="text-red-600 text-sm">{errors.price}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags & Opzioni
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Availability */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Disponibile
              </label>
              <Button
                variant={item.available ? "default" : "outline"}
                size="sm"
                onClick={() => setItem({ ...item, available: !item.available })}
              >
                {item.available ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Visibile
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Nascosto
                  </>
                )}
              </Button>
            </div>

            {/* Popular Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tag Popolari
              </label>
              <div className="flex gap-2 flex-wrap">
                {popularTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={item.tags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePopularTag(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tag Personalizzati
              </label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Aggiungi tag..."
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Active Tags */}
            {item.tags.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tag Attivi
                </label>
                <div className="flex gap-2 flex-wrap">
                  {item.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Anteprima</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {item.name || "Nome Item"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.description || "Descrizione item..."}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">
                    {item.is_beer && item.beer_price_30cl && item.beer_price_50cl
                      ? `€${item.beer_price_30cl}/${item.beer_price_50cl}`
                      : `€${item.price?.toFixed(2) || "0.00"}`
                    }
                  </p>
                </div>
              </div>
              {item.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 