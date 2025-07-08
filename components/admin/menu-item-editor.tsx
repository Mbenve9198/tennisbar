"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Save, 
  X, 
  Edit3, 
  Plus,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"

interface MenuItem {
  _id: string
  name: string
  description?: string
  price?: number
  beer_price_30cl?: number
  beer_price_50cl?: number
  pricing?: {
    regular?: number
    small?: number
    large?: number
  }
  category: string
  subcategory?: string
  tags: string[]
  available: boolean
}

interface MenuItemEditorProps {
  item: MenuItem
  onSave: (updatedItem: MenuItem) => void
  onCancel: () => void
  onDelete?: (item: MenuItem) => void
  isEditing?: boolean
}

const AVAILABLE_TAGS = [
  "popular", "special", "vegetarian", "vegan", "gluten-free", 
  "spicy", "new", "seasonal", "signature", "recommended"
]

export default function MenuItemEditor({ 
  item, 
  onSave, 
  onCancel, 
  onDelete,
  isEditing = false 
}: MenuItemEditorProps) {
  const [editing, setEditing] = useState(isEditing)
  const [loading, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description || "",
    price: item.price || 0,
    beer_price_30cl: item.beer_price_30cl || 0,
    beer_price_50cl: item.beer_price_50cl || 0,
    category: item.category,
    subcategory: item.subcategory || "",
    tags: item.tags || [],
    available: item.available
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome richiesto"
    }
    
    if (formData.price <= 0 && !formData.beer_price_30cl && !formData.beer_price_50cl) {
      newErrors.price = "Almeno un prezzo deve essere specificato"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const response = await fetch(`/api/menu/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        onSave({ ...item, ...formData })
        setEditing(false)
      } else {
        throw new Error(data.error || 'Update failed')
      }
    } catch (error) {
      console.error("Error saving item:", error)
      alert("Errore durante il salvataggio: " + (error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price || 0,
      beer_price_30cl: item.beer_price_30cl || 0,
      beer_price_50cl: item.beer_price_50cl || 0,
      category: item.category,
      subcategory: item.subcategory || "",
      tags: item.tags || [],
      available: item.available
    })
    setErrors({})
    setEditing(false)
    onCancel()
  }

  const handleAddTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleToggleAvailability = async () => {
    const newAvailability = !item.available
    
    try {
      const response = await fetch(`/api/menu/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newAvailability })
      })

      const data = await response.json()
      
      if (data.success) {
        onSave({ ...item, available: newAvailability })
      } else {
        throw new Error(data.error || 'Update failed')
      }
    } catch (error) {
      console.error("Error toggling availability:", error)
      alert("Errore durante l'aggiornamento: " + (error as Error).message)
    }
  }

  if (editing) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Nome */}
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Descrizione */}
            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Prezzi */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Prezzo Normale (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className={errors.price ? "border-red-500" : ""}
                />
              </div>
              <div>
                <Label htmlFor="beer_30">Birra 30cl (€)</Label>
                <Input
                  id="beer_30"
                  type="number"
                  step="0.01"
                  value={formData.beer_price_30cl}
                  onChange={(e) => setFormData(prev => ({ ...prev, beer_price_30cl: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="beer_50">Birra 50cl (€)</Label>
                <Input
                  id="beer_50"
                  type="number"
                  step="0.01"
                  value={formData.beer_price_50cl}
                  onChange={(e) => setFormData(prev => ({ ...prev, beer_price_50cl: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}

            {/* Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hamburger">Hamburger</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="drinks">Drinks</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subcategory">Sottocategoria</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  placeholder="Opzionale"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={handleAddTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Aggiungi tag" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_TAGS.filter(tag => !formData.tags.includes(tag)).map((tag) => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Disponibilità */}
            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: checked }))}
              />
              <Label htmlFor="available">Disponibile</Label>
            </div>

            {/* Azioni */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Salvataggio..." : "Salva"}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                <X className="w-4 h-4 mr-2" />
                Annulla
              </Button>
              {onDelete && (
                <Button 
                  variant="destructive" 
                  onClick={() => onDelete(item)}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // View mode
  return (
    <Card className="border-l-4 border-l-slate-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
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
                  {item.beer_price_30cl && item.beer_price_50cl 
                    ? `€${item.beer_price_30cl}/${item.beer_price_50cl}`
                    : `€${item.price?.toFixed(2) || "N/A"}`
                  }
                </p>
                {item.subcategory && (
                  <p className="text-xs text-gray-500 capitalize">
                    {item.subcategory}
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-3">
                {item.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {!item.available && (
                  <Badge variant="destructive" className="text-xs">
                    Non Disponibile
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="flex-1"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Modifica
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleAvailability}
                className={item.available ? "text-green-600" : "text-red-600"}
              >
                {item.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(item)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
