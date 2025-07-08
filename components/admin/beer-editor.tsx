"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BeerItem {
  name: string
  type: string
  small: string
  pinta: string
}

interface BeerEditorProps {
  beers: BeerItem[]
  onUpdate: (beers: BeerItem[]) => void
}

export function BeerEditor({ beers, onUpdate }: BeerEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editForm, setEditForm] = useState<BeerItem>({
    name: "",
    type: "",
    small: "",
    pinta: "",
  })

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditForm({ ...beers[index] })
    setIsAdding(false)
  }

  const handleAdd = () => {
    setIsAdding(true)
    setEditingIndex(null)
    setEditForm({
      name: "",
      type: "",
      small: "",
      pinta: "",
    })
  }

  const handleSave = () => {
    if (!editForm.name || !editForm.type || !editForm.pinta) return

    const newBeers = [...beers]

    if (isAdding) {
      newBeers.push(editForm)
    } else if (editingIndex !== null) {
      newBeers[editingIndex] = editForm
    }

    onUpdate(newBeers)
    setEditingIndex(null)
    setIsAdding(false)
    setEditForm({
      name: "",
      type: "",
      small: "",
      pinta: "",
    })
  }

  const handleDelete = (index: number) => {
    if (confirm("Eliminare questa birra?")) {
      const newBeers = beers.filter((_, i) => i !== index)
      onUpdate(newBeers)
    }
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setIsAdding(false)
    setEditForm({
      name: "",
      type: "",
      small: "",
      pinta: "",
    })
  }

  return (
    <Card className="border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-black">🍺 Birre alla Spina</CardTitle>
          <Button onClick={handleAdd} className="bg-black hover:bg-gray-800 text-white px-4 py-2">
            <span className="text-sm mr-2">➕</span>
            Aggiungi
          </Button>
        </div>
        <p className="text-sm text-gray-500">{beers.length} birre</p>
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
                  <Label htmlFor="beer-name" className="text-sm text-gray-700">
                    Nome Birra *
                  </Label>
                  <Input
                    id="beer-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="es. BUDWEISER"
                    className="h-12 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="beer-type" className="text-sm text-gray-700">
                    Tipo *
                  </Label>
                  <Input
                    id="beer-type"
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    placeholder="es. Lager 5%"
                    className="h-12 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="beer-small" className="text-sm text-gray-700">
                    Prezzo Small
                  </Label>
                  <Input
                    id="beer-small"
                    value={editForm.small}
                    onChange={(e) => setEditForm({ ...editForm, small: e.target.value })}
                    placeholder="€4,00 o –"
                    className="h-12 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="beer-pinta" className="text-sm text-gray-700">
                    Prezzo Pinta *
                  </Label>
                  <Input
                    id="beer-pinta"
                    value={editForm.pinta}
                    onChange={(e) => setEditForm({ ...editForm, pinta: e.target.value })}
                    placeholder="€6,00"
                    className="h-12 mt-1"
                  />
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
          {beers.map((beer, index) => (
            <motion.div key={index} layout className="p-4 border border-gray-100 rounded-lg">
              <div className="mb-3">
                <h3 className="font-semibold text-black">{beer.name}</h3>
                <p className="text-sm text-gray-600">{beer.type}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="text-xs text-gray-500">Small</span>
                  <p className="font-bold text-black">{beer.small}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Pinta</span>
                  <p className="font-bold text-black">{beer.pinta}</p>
                </div>
              </div>
              <div className="flex gap-2">
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
