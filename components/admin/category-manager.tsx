"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CategoryItem {
  name: string
  price: string
  description?: string
}

interface Category {
  category: string
  items: CategoryItem[]
}

interface CategoryManagerProps {
  title: string
  categories: Category[]
  onUpdate: (categories: Category[]) => void
}

export function CategoryManager({ title, categories, onUpdate }: CategoryManagerProps) {
  const [editingCategory, setEditingCategory] = useState<number | null>(null)
  const [editingItem, setEditingItem] = useState<{ categoryIndex: number; itemIndex: number } | null>(null)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [isAddingItem, setIsAddingItem] = useState<number | null>(null)

  const [categoryForm, setCategoryForm] = useState("")
  const [itemForm, setItemForm] = useState<CategoryItem>({
    name: "",
    price: "",
    description: "",
  })

  const handleAddCategory = () => {
    setIsAddingCategory(true)
    setCategoryForm("")
  }

  const handleSaveCategory = () => {
    if (!categoryForm) return

    const newCategories = [...categories, { category: categoryForm, items: [] }]
    onUpdate(newCategories)
    setIsAddingCategory(false)
    setCategoryForm("")
  }

  const handleDeleteCategory = (categoryIndex: number) => {
    if (confirm("Eliminare questa categoria e tutti i suoi elementi?")) {
      const newCategories = categories.filter((_, i) => i !== categoryIndex)
      onUpdate(newCategories)
    }
  }

  const handleEditCategory = (categoryIndex: number) => {
    setEditingCategory(categoryIndex)
    setCategoryForm(categories[categoryIndex].category)
  }

  const handleSaveEditCategory = () => {
    if (!categoryForm || editingCategory === null) return

    const newCategories = [...categories]
    newCategories[editingCategory].category = categoryForm
    onUpdate(newCategories)
    setEditingCategory(null)
    setCategoryForm("")
  }

  const handleAddItem = (categoryIndex: number) => {
    setIsAddingItem(categoryIndex)
    setItemForm({ name: "", price: "", description: "" })
  }

  const handleSaveItem = () => {
    if (!itemForm.name || !itemForm.price || isAddingItem === null) return

    const newCategories = [...categories]
    newCategories[isAddingItem].items.push(itemForm)
    onUpdate(newCategories)
    setIsAddingItem(null)
    setItemForm({ name: "", price: "", description: "" })
  }

  const handleEditItem = (categoryIndex: number, itemIndex: number) => {
    setEditingItem({ categoryIndex, itemIndex })
    setItemForm({ ...categories[categoryIndex].items[itemIndex] })
  }

  const handleSaveEditItem = () => {
    if (!itemForm.name || !itemForm.price || !editingItem) return

    const newCategories = [...categories]
    newCategories[editingItem.categoryIndex].items[editingItem.itemIndex] = itemForm
    onUpdate(newCategories)
    setEditingItem(null)
    setItemForm({ name: "", price: "", description: "" })
  }

  const handleDeleteItem = (categoryIndex: number, itemIndex: number) => {
    if (confirm("Eliminare questo elemento?")) {
      const newCategories = [...categories]
      newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter((_, i) => i !== itemIndex)
      onUpdate(newCategories)
    }
  }

  return (
    <Card className="border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-black">{title}</CardTitle>
          <Button onClick={handleAddCategory} className="bg-black hover:bg-gray-800 text-white px-4 py-2">
            <span className="text-sm mr-2">📁</span>
            Categoria
          </Button>
        </div>
        <p className="text-sm text-gray-500">{categories.length} categorie</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <AnimatePresence>
          {isAddingCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-dashed border-gray-300 rounded-lg p-4 space-y-4"
            >
              <div>
                <Label htmlFor="category-name" className="text-sm text-gray-700">
                  Nome Categoria *
                </Label>
                <Input
                  id="category-name"
                  value={categoryForm}
                  onChange={(e) => setCategoryForm(e.target.value)}
                  placeholder="es. Energy & Sport"
                  className="h-12 mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveCategory} className="bg-black hover:bg-gray-800 text-white flex-1 h-12">
                  <span className="text-sm mr-2">💾</span>
                  Salva
                </Button>
                <Button onClick={() => setIsAddingCategory(false)} variant="outline" className="flex-1 h-12">
                  <span className="text-sm mr-2">❌</span>
                  Annulla
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {categories.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="border border-gray-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {editingCategory === categoryIndex ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input value={categoryForm} onChange={(e) => setCategoryForm(e.target.value)} className="h-10" />
                    <Button
                      size="sm"
                      onClick={handleSaveEditCategory}
                      className="bg-black hover:bg-gray-800 text-white px-3"
                    >
                      💾
                    </Button>
                    <Button size="sm" onClick={() => setEditingCategory(null)} variant="outline" className="px-3">
                      ❌
                    </Button>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-base text-black">{category.category}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddItem(categoryIndex)}
                        className="bg-black hover:bg-gray-800 text-white px-3 py-2"
                      >
                        <span className="text-xs mr-1">➕</span>
                        Item
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCategory(categoryIndex)}
                        className="px-3"
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCategory(categoryIndex)}
                        className="px-3 border-gray-300 hover:bg-gray-100"
                      >
                        🗑️
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="border border-gray-200 rounded-md p-3">
                  {editingItem?.categoryIndex === categoryIndex && editingItem?.itemIndex === itemIndex ? (
                    <div className="grid gap-3">
                      <Input
                        placeholder="Nome"
                        value={itemForm.name}
                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      />
                      <Input
                        placeholder="Prezzo"
                        value={itemForm.price}
                        onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                      />
                      <Input
                        placeholder="Descrizione"
                        value={itemForm.description}
                        onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEditItem}
                          className="bg-black hover:bg-gray-800 text-white"
                        >
                          Salva
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                          Annulla
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.price}</p>
                        {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditItem(categoryIndex, itemIndex)}
                          className="px-3"
                        >
                          ✏️
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteItem(categoryIndex, itemIndex)}
                          className="px-3 border-gray-300 hover:bg-gray-100"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <AnimatePresence>
                {isAddingItem === categoryIndex && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-dashed border-gray-300 rounded-lg p-4 space-y-4"
                  >
                    <div>
                      <Label htmlFor="item-name" className="text-sm text-gray-700">
                        Nome Item *
                      </Label>
                      <Input
                        id="item-name"
                        value={itemForm.name}
                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                        placeholder="es. T-Shirt"
                        className="h-12 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-price" className="text-sm text-gray-700">
                        Prezzo Item *
                      </Label>
                      <Input
                        id="item-price"
                        value={itemForm.price}
                        onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                        placeholder="es. 39,99"
                        className="h-12 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-description" className="text-sm text-gray-700">
                        Descrizione Item
                      </Label>
                      <Input
                        id="item-description"
                        value={itemForm.description}
                        onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                        placeholder="es. 100% cotone"
                        className="h-12 mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveItem} className="bg-black hover:bg-gray-800 text-white flex-1 h-12">
                        <span className="text-sm mr-2">💾</span>
                        Salva
                      </Button>
                      <Button onClick={() => setIsAddingItem(null)} variant="outline" className="flex-1 h-12">
                        <span className="text-sm mr-2">❌</span>
                        Annulla
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
