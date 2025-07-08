"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Save,
  Clock,
  Edit3,
  Copy,
  Percent,
  Calculator,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Home,
  Menu,
  Settings,
  Tag
} from "lucide-react"

interface PriceTemplate {
  id: string
  name: string
  description: string
  categories: string[]
  adjustmentType: "percentage" | "fixed"
  adjustmentValue: number
  createdAt: string
}

interface PriceHistory {
  id: string
  itemId: string
  itemName: string
  oldPrice: number
  newPrice: number
  changeType: "increase" | "decrease"
  changeAmount: number
  changePercent: number
  updatedBy: string
  updatedAt: string
  reason?: string
}

interface PricingStats {
  averagePrice: number
  highestPrice: number
  lowestPrice: number
  totalRevenuePotential: number
  recentChanges: number
  avgPriceByCategory: { [key: string]: number }
}

export default function PricingManagementPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [templates, setTemplates] = useState<PriceTemplate[]>([])
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [stats, setStats] = useState<PricingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    categories: [] as string[],
    adjustmentType: "percentage" as "percentage" | "fixed",
    adjustmentValue: 0
  })
  const router = useRouter()

  const categories = ["hamburger", "food", "drinks", "desserts"]

  // Mock data
  const mockTemplates: PriceTemplate[] = [
    {
      id: "1",
      name: "Aumento Generale +10%",
      description: "Incremento generale del 10% su tutte le categorie",
      categories: ["hamburger", "food", "drinks", "desserts"],
      adjustmentType: "percentage",
      adjustmentValue: 10,
      createdAt: "2024-01-15"
    },
    {
      id: "2", 
      name: "Sconto Beverages €1",
      description: "Riduzione di €1 su tutte le bevande",
      categories: ["drinks"],
      adjustmentType: "fixed",
      adjustmentValue: -1,
      createdAt: "2024-01-10"
    },
    {
      id: "3",
      name: "Premium Hamburger +15%",
      description: "Aumento premium su hamburger special",
      categories: ["hamburger"],
      adjustmentType: "percentage", 
      adjustmentValue: 15,
      createdAt: "2024-01-05"
    }
  ]

  const mockHistory: PriceHistory[] = [
    {
      id: "1",
      itemId: "ham_001",
      itemName: "Hamburger Classico",
      oldPrice: 8.50,
      newPrice: 9.50,
      changeType: "increase",
      changeAmount: 1.00,
      changePercent: 11.76,
      updatedBy: "Admin",
      updatedAt: "2024-01-20T10:30:00Z",
      reason: "Aumento costi ingredienti"
    },
    {
      id: "2", 
      itemId: "bir_001",
      itemName: "Birra Media",
      oldPrice: 5.00,
      newPrice: 4.50,
      changeType: "decrease", 
      changeAmount: -0.50,
      changePercent: -10.00,
      updatedBy: "Admin",
      updatedAt: "2024-01-18T14:15:00Z",
      reason: "Promozione happy hour"
    },
    {
      id: "3",
      itemId: "des_001", 
      itemName: "Tiramisù",
      oldPrice: 6.00,
      newPrice: 6.50,
      changeType: "increase",
      changeAmount: 0.50, 
      changePercent: 8.33,
      updatedBy: "Admin",
      updatedAt: "2024-01-16T16:45:00Z"
    }
  ]

  const mockStats: PricingStats = {
    averagePrice: 7.85,
    highestPrice: 15.00,
    lowestPrice: 2.50,
    totalRevenuePotential: 642.50,
    recentChanges: 8,
    avgPriceByCategory: {
      hamburger: 9.25,
      food: 8.75,
      drinks: 4.50,
      desserts: 6.80
    }
  }

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("admin_session")
    if (!isAuthenticated) {
      router.push("/admin")
      return
    }
    
    loadPricingData()
  }, [router])

  const loadPricingData = async () => {
    try {
      setLoading(true)
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTemplates(mockTemplates)
      setPriceHistory(mockHistory)
      setStats(mockStats)
    } catch (error) {
      console.error("Error loading pricing data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createTemplate = () => {
    if (!newTemplate.name.trim()) return

    const template: PriceTemplate = {
      id: Date.now().toString(),
      ...newTemplate,
      createdAt: new Date().toISOString().split('T')[0]
    }

    setTemplates([...templates, template])
    setNewTemplate({
      name: "",
      description: "",
      categories: [],
      adjustmentType: "percentage",
      adjustmentValue: 0
    })
    setShowNewTemplate(false)
  }

  const applyTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    const confirmed = confirm(
      `Applicare "${template.name}" alle categorie ${template.categories.join(", ")}?\n\n` +
      `${template.adjustmentType === "percentage" ? 
        `Variazione: ${template.adjustmentValue > 0 ? "+" : ""}${template.adjustmentValue}%` :
        `Variazione: ${template.adjustmentValue > 0 ? "+" : ""}€${Math.abs(template.adjustmentValue)}`
      }`
    )

    if (!confirmed) return

    // Simulate template application
    console.log("Applying template:", template)
    
    // Here would be the actual API call to update prices
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    alert("Template applicato con successo!")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Caricamento sistema prezzi...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Gestione Prezzi</h1>
              <p className="text-sm text-gray-500">Template e cronologia</p>
            </div>
          </div>
          <Button
            onClick={() => setShowNewTemplate(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Template
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="templates">Template</TabsTrigger>
            <TabsTrigger value="history">Cronologia</TabsTrigger>
            <TabsTrigger value="analytics">Analisi</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">€{stats?.averagePrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Prezzo Medio</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">€{stats?.totalRevenuePotential.toFixed(0)}</p>
                  <p className="text-sm text-gray-500">Ricavo Potenziale</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">€{stats?.highestPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Prezzo Max</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.recentChanges}</p>
                  <p className="text-sm text-gray-500">Modifiche Recenti</p>
                </CardContent>
              </Card>
            </div>

            {/* Price by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prezzi Medi per Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats && Object.entries(stats.avgPriceByCategory).map(([category, price]) => (
                    <div key={category} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                          {category === "hamburger" && "🍔"}
                          {category === "food" && "🍝"}
                          {category === "drinks" && "🥤"}
                          {category === "desserts" && "🍰"}
                        </div>
                        <span className="font-medium capitalize">{category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-700">€{price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">media</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* New Template */}
            <AnimatePresence>
              {showNewTemplate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Nuovo Template Prezzi</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Nome Template</label>
                        <Input
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                          placeholder="Es. Aumento Stagionale +5%"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Descrizione</label>
                        <Input
                          value={newTemplate.description}
                          onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                          placeholder="Descrizione del template"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Categorie</label>
                        <div className="flex gap-2 flex-wrap">
                          {categories.map((cat) => (
                            <Button
                              key={cat}
                              variant={newTemplate.categories.includes(cat) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const newCategories = newTemplate.categories.includes(cat)
                                  ? newTemplate.categories.filter(c => c !== cat)
                                  : [...newTemplate.categories, cat]
                                setNewTemplate({...newTemplate, categories: newCategories})
                              }}
                            >
                              {cat}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo Modifica</label>
                          <div className="flex gap-2">
                            <Button
                              variant={newTemplate.adjustmentType === "percentage" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setNewTemplate({...newTemplate, adjustmentType: "percentage"})}
                            >
                              <Percent className="w-4 h-4 mr-1" />
                              %
                            </Button>
                            <Button
                              variant={newTemplate.adjustmentType === "fixed" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setNewTemplate({...newTemplate, adjustmentType: "fixed"})}
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              €
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Valore</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newTemplate.adjustmentValue}
                            onChange={(e) => setNewTemplate({...newTemplate, adjustmentValue: parseFloat(e.target.value) || 0})}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={createTemplate}
                          disabled={!newTemplate.name.trim() || newTemplate.categories.length === 0}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Salva Template
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowNewTemplate(false)}
                        >
                          Annulla
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Templates List */}
            <div className="space-y-3">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex gap-2 flex-wrap mb-2">
                          {template.categories.map((cat) => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            {template.adjustmentType === "percentage" ? 
                              `${template.adjustmentValue > 0 ? "+" : ""}${template.adjustmentValue}%` :
                              `${template.adjustmentValue > 0 ? "+" : ""}€${Math.abs(template.adjustmentValue)}`
                            }
                          </span>
                          <span>Creato: {formatDate(template.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => applyTemplate(template.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Applica
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cronologia Modifiche Prezzi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {priceHistory.map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{entry.itemName}</h4>
                          <p className="text-sm text-gray-500">da {entry.updatedBy}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            {entry.changeType === "increase" ? (
                              <TrendingUp className="w-4 h-4 text-red-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-green-500" />
                            )}
                            <span className={`font-medium ${entry.changeType === "increase" ? "text-red-600" : "text-green-600"}`}>
                              {entry.changeType === "increase" ? "+" : ""}€{entry.changeAmount.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            ({entry.changeType === "increase" ? "+" : ""}{entry.changePercent.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>€{entry.oldPrice.toFixed(2)} → €{entry.newPrice.toFixed(2)}</span>
                        <span className="text-gray-500">{formatDate(entry.updatedAt)}</span>
                      </div>
                      {entry.reason && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{entry.reason}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analisi Prezzi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Grafici in Sviluppo</h3>
                  <p className="text-gray-500">
                    Analytics avanzati con grafici dei prezzi saranno disponibili nella prossima versione
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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