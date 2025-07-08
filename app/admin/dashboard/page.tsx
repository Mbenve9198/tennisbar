"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { MenuItemEditor } from "@/components/admin/menu-item-editor"
import { BeerEditor } from "@/components/admin/beer-editor"
import { CategoryManager } from "@/components/admin/category-manager"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Home, 
  Menu, 
  Settings, 
  TrendingUp, 
  Users, 
  Coffee,
  Plus,
  Edit3,
  Search,
  Clock,
  AlertCircle,
  BarChart3,
  Tag,
  LogOut,
  Eye
} from "lucide-react"
import { AdminAuth } from "@/lib/admin-auth"

// Import menu data
import {
  hamburgerClassici as initialHamburgerClassici,
  superHamburger as initialSuperHamburger,
  miniPiatti as initialMiniPiatti,
  piattiItaliani as initialPiattiItaliani,
  pinse as initialPinse,
  sandwich as initialSandwich,
  piattiGriglia as initialPiattiGriglia,
  insalate as initialInsalate,
  dolci as initialDolci,
  birreSpina as initialBirreSpina,
  bevande as initialBevande,
  viniCocktail as initialViniCocktail,
  caffetteria as initialCaffetteria,
} from "@/lib/menu-data"

const tabs = [
  { id: "overview", label: "Home", emoji: "🏠" },
  { id: "food", label: "Food", emoji: "🍔" },
  { id: "drinks", label: "Drinks", emoji: "🍺" },
  { id: "desserts", label: "Dolci", emoji: "🍰" },
  { id: "beverages", label: "Bevande", emoji: "🥤" },
  { id: "settings", label: "Settings", emoji: "⚙️" },
]

interface DashboardStats {
  totalItems: number
  activeItems: number
  categories: number
  lastUpdate: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    activeItems: 0,
    categories: 0,
    lastUpdate: ""
  })
  const [loading, setLoading] = useState(true)

  // Menu data states
  const [hamburgerClassici, setHamburgerClassici] = useState(initialHamburgerClassici)
  const [superHamburger, setSuperHamburger] = useState(initialSuperHamburger)
  const [miniPiatti, setMiniPiatti] = useState(initialMiniPiatti)
  const [piattiItaliani, setPiattiItaliani] = useState(initialPiattiItaliani)
  const [pinse, setPinse] = useState(initialPinse)
  const [sandwich, setSandwich] = useState(initialSandwich)
  const [piattiGriglia, setPiattiGriglia] = useState(initialPiattiGriglia)
  const [insalate, setInsalate] = useState(initialInsalate)
  const [dolci, setDolci] = useState(initialDolci)
  const [birreSpina, setBirreSpina] = useState(initialBirreSpina)
  const [bevande, setBevande] = useState(initialBevande)
  const [viniCocktail, setViniCocktail] = useState(initialViniCocktail)
  const [caffetteria, setCaffetteria] = useState(initialCaffetteria)

  useEffect(() => {
    if (AdminAuth.isAuthenticated()) {
      setIsAuthenticated(true)
      loadMenuData()
    } else {
      router.push("/admin")
    }
  }, [router])

  const loadMenuData = () => {
    const savedData = localStorage.getItem("menuData")
    if (savedData) {
      const data = JSON.parse(savedData)
      setHamburgerClassici(data.hamburgerClassici || initialHamburgerClassici)
      setSuperHamburger(data.superHamburger || initialSuperHamburger)
      setMiniPiatti(data.miniPiatti || initialMiniPiatti)
      setPiattiItaliani(data.piattiItaliani || initialPiattiItaliani)
      setPinse(data.pinse || initialPinse)
      setSandwich(data.sandwich || initialSandwich)
      setPiattiGriglia(data.piattiGriglia || initialPiattiGriglia)
      setInsalate(data.insalate || initialInsalate)
      setDolci(data.dolci || initialDolci)
      setBirreSpina(data.birreSpina || initialBirreSpina)
      setBevande(data.bevande || initialBevande)
      setViniCocktail(data.viniCocktail || initialViniCocktail)
      setCaffetteria(data.caffetteria || initialCaffetteria)
    }
  }

  const saveMenuData = () => {
    const menuData = {
      hamburgerClassici,
      superHamburger,
      miniPiatti,
      piattiItaliani,
      pinse,
      sandwich,
      piattiGriglia,
      insalate,
      dolci,
      birreSpina,
      bevande,
      viniCocktail,
      caffetteria,
    }
    localStorage.setItem("menuData", JSON.stringify(menuData))

    // Emetti evento per notificare il frontend
    window.dispatchEvent(new Event("menuDataUpdated"))
  }

  const handleLogout = () => {
    AdminAuth.logout()
    router.push("/admin")
  }

  const getTotalItems = () => {
    return (
      hamburgerClassici.length +
      superHamburger.length +
      miniPiatti.length +
      piattiItaliani.length +
      pinse.length +
      sandwich.length +
      piattiGriglia.length +
      insalate.length +
      dolci.length
    )
  }

  useEffect(() => {
    // Auto-save quando i dati cambiano
    const menuData = {
      hamburgerClassici,
      superHamburger,
      miniPiatti,
      piattiItaliani,
      pinse,
      sandwich,
      piattiGriglia,
      insalate,
      dolci,
      birreSpina,
      bevande,
      viniCocktail,
      caffetteria,
    }
    localStorage.setItem("menuData", JSON.stringify(menuData))
    window.dispatchEvent(new Event("menuDataUpdated"))
  }, [
    hamburgerClassici,
    superHamburger,
    miniPiatti,
    piattiItaliani,
    pinse,
    sandwich,
    piattiGriglia,
    insalate,
    dolci,
    birreSpina,
    bevande,
    viniCocktail,
    caffetteria,
  ])

  useEffect(() => {
    // Load dashboard stats
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/menu")
      const data = await response.json()
      
      if (data.success) {
        // Count totals
        let totalItems = 0
        let categories = 0
        
        Object.values(data.data).forEach((category: any) => {
          if (Array.isArray(category)) {
            totalItems += category.length
            categories += 1
          } else if (category.subcategories) {
            Object.values(category.subcategories).forEach((subcategory: any) => {
              if (Array.isArray(subcategory)) {
                totalItems += subcategory.length
              }
            })
            if (category.items?.length) {
              totalItems += category.items.length
            }
            categories += 1
          }
        })

        setStats({
          totalItems,
          activeItems: totalItems, // Per ora tutti sono attivi
          categories,
          lastUpdate: new Date().toLocaleDateString('it-IT')
        })
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="text-4xl"
        >
          ⏳
        </motion.div>
      </div>
    )
  }

  const quickActions = [
    {
      title: "Aggiungi Item",
      description: "Nuovo piatto o bevanda",
      icon: Plus,
      color: "bg-green-500",
      action: () => router.push("/admin/menu/add")
    },
    {
      title: "Modifica Menu",
      description: "Gestisci items esistenti",
      icon: Edit3,
      color: "bg-blue-500",
      action: () => router.push("/admin/menu")
    },
    {
      title: "Operazioni Bulk",
      description: "Gestione multipla items",
      icon: Users,
      color: "bg-slate-500",
      action: () => router.push("/admin/menu/bulk")
    },
    {
      title: "Gestione Prezzi",
      description: "Template e cronologia",
      icon: BarChart3,
      color: "bg-indigo-500",
      action: () => router.push("/admin/pricing")
    },
    {
      title: "Categorie",
      description: "Organizza il menu",
      icon: Tag,
      color: "bg-purple-500",
      action: () => router.push("/admin/categories")
    },
    {
      title: "Vedi Menu",
      description: "Preview cliente",
      icon: Eye,
      color: "bg-orange-500",
      action: () => window.open("/", "_blank")
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-sm text-gray-500">Tennis Sports Bar</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Esci
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-slate-700 to-slate-900 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Benvenuto nel Pannello Admin</h2>
                  <p className="text-white/80 text-sm">Gestisci il menu del Tennis Bar</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Ultimo aggiornamento: {stats.lastUpdate}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Menu className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              <p className="text-sm text-gray-500">Items Totali</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeItems}</p>
              <p className="text-sm text-gray-500">Attivi</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.categories}</p>
              <p className="text-sm text-gray-500">Categorie</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">100%</p>
              <p className="text-sm text-gray-500">Disponibili</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Azioni Rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  onClick={action.action}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Alert className="border-green-200 bg-green-50">
            <AlertCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Sistema operativo. Menu caricato correttamente con {stats.totalItems} items.
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 gap-1">
          <button className="p-4 text-center bg-slate-700 text-white">
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
