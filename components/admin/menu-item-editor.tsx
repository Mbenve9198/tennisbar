"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

interface MenuItem {
  name: string
  price: string
  description?: string
  popular?: boolean
  special?: boolean
}

interface MenuItemEditorProps {
  title: string
  items: MenuItem[]
  onUpdate: (items: MenuItem[]) => void
  category: string
}

export function MenuItemEditor({ title, items, onUpdate, category }: MenuItemEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editForm, setEditForm] = useState<MenuItem>({
    name: "",
    price: "",
    description: "",
    popular: false,
    special: false,
  })

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditForm({ ...items[index] })
    setIsAdding(false)
  }

  const handleAdd = () => {
    setIsAdding(true)
    setEditingIndex(null)
    setEditForm({
      name: "",
      price: "",
      description: "",
      popular: false,
      special: false,
    })
  }

  const handleSave = () => {
    if (!editForm.name || !editForm.price) return

    const newItems = [...items]

    if (isAdding) {
      newItems.push(editForm)
    } else if (editingIndex !== null) {
      newItems[editingIndex] = editForm
    }

    onUpdate(newItems)
    setEditingIndex(null)
    setIsAdding(false)
    setEditForm({
      name: "",
      price: "",
      description: "",
      popular: false,
      special: false,
    })
  }

  const handleDelete = (index: number) => {
    if (confirm("Eliminare questo elemento?")) {
      const newItems = items.filter((_, i) => i !== index)
      onUpdate(newItems)
    }
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setIsAdding(false)
    setEditForm({
      name: "",
      price: "",
      description: "",
      popular: false,
      special: false,
    })
  }

  return (
    <Card className="border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-black">{title}</CardTitle>
          <Button onClick={handleAdd} className="bg-black hover:bg-gray-800 text-white px-4 py-2">
            <span className="text-sm mr-2">➕</span>
            Aggiungi
          </Button>
        </div>
        <p className="text-sm text-gray-500">{items.length} elementi</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {(isAdding || editingIndex !== null) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-dashed border-gray-300 rounded-lg p-4 space-y-4"
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm text-gray-700">
                    Nome *
                  </Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Nome del piatto"
                    className="h-12 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="text-sm text-gray-700">
                    Prezzo *
                  </Label>
                  <Input
                    id="price"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    placeholder="€0,00"
                    className="h-12 mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm text-gray-700">
                  Descrizione
                </Label>
                <Textarea
                  id="description"
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Descrizione del piatto..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="popular"
                    checked={editForm.popular || false}
                    onCheckedChange={(checked) => setEditForm({ ...editForm, popular: checked })}
                  />
                  <Label htmlFor="popular" className="text-sm">
                    ⭐ Popolare
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="special"
                    checked={editForm.special || false}
                    onCheckedChange={(checked) => setEditForm({ ...editForm, special: checked })}
                  />
                  <Label htmlFor="special" className="text-sm">
                    🔥 Special
                  </Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-black hover:bg-gray-800 text-white flex-1 h-12">
                  <span className="text-sm mr-2">💾</span>
                  Salva
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1 h-12 bg-transparent">
                  <span className="text-sm mr-2">❌</span>
                  Annulla
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div key={index} layout className="p-4 border border-gray-100 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-black">{item.name}</h3>
                    {item.popular && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">
                        ⭐ Popolare
                      </Badge>
                    )}
                    {item.special && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">
                        🔥 Special
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-bold text-black">{item.price}</p>
                  {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => handleEdit(index)} className="flex-1 h-10">
                  <span className="text-sm mr-1">✏️</span>
                  Modifica
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(index)}
                  className="flex-1 h-10 border-gray-300 hover:bg-gray-100"
                >
                  <span className="text-sm mr-1">🗑️</span>
                  Elimina
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
