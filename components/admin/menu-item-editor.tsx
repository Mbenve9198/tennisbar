"use client"

import { useState, useEffect } from "react"
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

// Interfaccia per il pricing flessibile
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

// Interfaccia MenuItem aggiornata per corrispondere al modello
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

interface Category {
  _id: string
  name: string
  emoji: string
  section: string
}

interface Subcategory {
  _id: string
  name: string
  categoryId: string
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

const PRICING_TYPES = [
  { value: 'simple', label: 'Prezzo Semplice' },
  { value: 'multiple', label: 'Prezzi Multipli' },
  { value: 'range', label: 'Fascia di Prezzo' },
  { value: 'custom', label: 'Prezzo Personalizzato' }
]

export default function MenuItemEditor({ 
  item, 
  onSave, 
  onCancel, 
  onDelete,
  isEditing = false 
}: MenuItemEditorProps) {
  const [editing, setEditing] = useState(isEditing)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([])
  
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description || "",
    categoryId: item.categoryId,
    subcategoryId: item.subcategoryId || "",
    pricing: item.pricing || { type: 'simple' as const, simple: '' },
    type: item.type || "",
    tags: item.tags || [],
    order: item.order || 0,
    isActive: item.isActive !== undefined ? item.isActive : true
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Carica categorie e sottocategorie all'inizializzazione
  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        
        if (data.success) {
          setCategories(data.data.categories)
          setSubcategories(data.data.subcategories)
        }
      } catch (error) {
        console.error("Errore nel caricamento di categorie e sottocategorie:", error)
      }
    }

    fetchCategoriesAndSubcategories()
  }, [])

  // Filtra sottocategorie in base alla categoria selezionata
  useEffect(() => {
    if (formData.categoryId) {
      const filtered = subcategories.filter(sub => sub.categoryId === formData.categoryId)
      setFilteredSubcategories(filtered)
    } else {
      setFilteredSubcategories([])
    }
  }, [formData.categoryId, subcategories])

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome richiesto"
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = "Categoria richiesta"
    }

    // Validazione pricing
    switch (formData.pricing.type) {
      case 'simple':
        if (!formData.pricing.simple?.trim()) {
          newErrors.pricing = "Prezzo semplice richiesto"
        }
        break
      case 'multiple':
        if (!formData.pricing.multiple?.pinta?.trim()) {
          newErrors.pricing = "Almeno il prezzo pinta è richiesto"
        }
        break
      case 'range':
        if (!formData.pricing.range?.trim()) {
          newErrors.pricing = "Fascia di prezzo richiesta"
        }
        break
      case 'custom':
        if (!formData.pricing.custom?.trim()) {
          newErrors.pricing = "Prezzo personalizzato richiesto"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
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
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: item.name,
      description: item.description || "",
      categoryId: item.categoryId,
      subcategoryId: item.subcategoryId || "",
      pricing: item.pricing || { type: 'simple' as const, simple: '' },
      type: item.type || "",
      tags: item.tags || [],
      order: item.order || 0,
      isActive: item.isActive !== undefined ? item.isActive : true
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

  const handlePricingChange = (field: string, value: string | object) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value
      }
    }))
  }

  const handlePricingTypeChange = (newType: 'simple' | 'multiple' | 'range' | 'custom') => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        type: newType,
        // Reset all other pricing fields
        simple: '',
        multiple: { small: '', pinta: '' },
        range: '',
        custom: ''
      }
    }))
  }

  const handleToggleActive = async () => {
    const newActiveStatus = !item.isActive
    
    try {
      const response = await fetch(`/api/menu/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActiveStatus })
      })

      const data = await response.json()
      
      if (data.success) {
        onSave({ ...item, isActive: newActiveStatus })
      } else {
        throw new Error(data.error || 'Update failed')
      }
    } catch (error) {
      console.error("Error toggling active status:", error)
      alert("Errore durante l'aggiornamento: " + (error as Error).message)
    }
  }

  const formatDisplayPrice = (pricing: IPricing): string => {
    switch (pricing.type) {
      case 'simple':
        return pricing.simple || 'N/A'
      case 'multiple':
        const small = pricing.multiple?.small
        const pinta = pricing.multiple?.pinta
        if (small && pinta) return `${small}/${pinta}`
        if (pinta) return pinta
        return 'N/A'
      case 'range':
        return pricing.range || 'N/A'
      case 'custom':
        return pricing.custom || 'N/A'
      default:
        return 'N/A'
    }
  }

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat._id === categoryId)
    return category ? `${category.emoji} ${category.name}` : 'Categoria non trovata'
  }

  const getSubcategoryName = (subcategoryId: string): string => {
    const subcategory = subcategories.find(sub => sub._id === subcategoryId)
    return subcategory ? subcategory.name : ''
  }

  if (editing) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Info Base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <Label htmlFor="type">Tipo/Descrizione Breve</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="es. Lager 5%, IPA 5,6%, etc."
                />
              </div>
            </div>

            {/* Descrizione */}
            <div>
              <Label htmlFor="description">Descrizione Dettagliata</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Descrizione completa del prodotto..."
              />
            </div>

            {/* Categoria e Sottocategoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, categoryId: value, subcategoryId: '' }))
                  }}
                >
                  <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.emoji} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
              </div>

              <div>
                <Label htmlFor="subcategory">Sottocategoria</Label>
                <Select 
                  value={formData.subcategoryId || "none"} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    subcategoryId: value === "none" ? "" : value 
                  }))}
                  disabled={!formData.categoryId || filteredSubcategories.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona sottocategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessuna sottocategoria</SelectItem>
                    {filteredSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory._id} value={subcategory._id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Gestione Prezzi */}
            <div className="space-y-4">
              <div>
                <Label>Tipo di Prezzo *</Label>
                <Select 
                  value={formData.pricing.type} 
                  onValueChange={handlePricingTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.pricing && <p className="text-red-500 text-sm mt-1">{errors.pricing}</p>}
              </div>

              {/* Campi pricing dinamici */}
              {formData.pricing.type === 'simple' && (
                <div>
                  <Label htmlFor="simple-price">Prezzo Semplice *</Label>
                  <Input
                    id="simple-price"
                    value={formData.pricing.simple || ''}
                    onChange={(e) => handlePricingChange('simple', e.target.value)}
                    placeholder="es. €12,90"
                  />
                </div>
              )}

              {formData.pricing.type === 'multiple' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="small-price">Prezzo Small</Label>
                    <Input
                      id="small-price"
                      value={formData.pricing.multiple?.small || ''}
                      onChange={(e) => handlePricingChange('multiple', { 
                        ...formData.pricing.multiple, 
                        small: e.target.value 
                      })}
                      placeholder="es. €4,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pinta-price">Prezzo Pinta *</Label>
                    <Input
                      id="pinta-price"
                      value={formData.pricing.multiple?.pinta || ''}
                      onChange={(e) => handlePricingChange('multiple', { 
                        ...formData.pricing.multiple, 
                        pinta: e.target.value 
                      })}
                      placeholder="es. €6,00"
                    />
                  </div>
                </div>
              )}

              {formData.pricing.type === 'range' && (
                <div>
                  <Label htmlFor="range-price">Fascia di Prezzo *</Label>
                  <Input
                    id="range-price"
                    value={formData.pricing.range || ''}
                    onChange={(e) => handlePricingChange('range', e.target.value)}
                    placeholder="es. €5,00 / €8,00"
                  />
                </div>
              )}

              {formData.pricing.type === 'custom' && (
                <div>
                  <Label htmlFor="custom-price">Prezzo Personalizzato *</Label>
                  <Input
                    id="custom-price"
                    value={formData.pricing.custom || ''}
                    onChange={(e) => handlePricingChange('custom', e.target.value)}
                    placeholder="es. Su richiesta, Variabile, etc."
                  />
                </div>
              )}
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

            {/* Impostazioni */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Ordinamento</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Attivo nel menu</Label>
              </div>
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
    <Card className={`border-l-4 ${item.isActive ? 'border-l-green-500' : 'border-l-gray-400'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {item.name}
                  {item.type && (
                    <span className="ml-2 text-sm text-gray-500 font-normal">
                      {item.type}
                    </span>
                  )}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{getCategoryName(item.categoryId)}</span>
                  {item.subcategoryId && (
                    <>
                      <span>→</span>
                      <span>{getSubcategoryName(item.subcategoryId)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-lg text-gray-900">
                  {formatDisplayPrice(item.pricing)}
                </p>
                <p className="text-xs text-gray-500">
                  Ordine: {item.order}
                </p>
              </div>
            </div>

            {/* Tags e Status */}
            <div className="flex gap-1 flex-wrap mb-3">
              {item.tags && item.tags.length > 0 && item.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {!item.isActive && (
                <Badge variant="destructive" className="text-xs">
                  Non Attivo
                </Badge>
              )}
            </div>

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
                onClick={handleToggleActive}
                className={item.isActive ? "text-green-600" : "text-gray-600"}
              >
                {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
