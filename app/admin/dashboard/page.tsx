"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { MenuItemEditor } from "@/components/admin/menu-item-editor"
import { BeerEditor } from "@/components/admin/beer-editor"
import { CategoryManager } from "@/components/admin/category-manager"

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

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

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
    const adminAuth = localStorage.getItem("adminAuth")
    if (adminAuth === "true") {
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
    localStorage.removeItem("adminAuth")
    localStorage.removeItem("adminUser")
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="text-2xl"
            >
              ⚙️
            </motion.div>
            <div>
              <h1 className="text-lg font-medium text-black">Admin</h1>
              <p className="text-xs text-gray-500">Tennis Sports Bar</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push("/")} className="text-gray-600 hover:text-black p-2">
              <span className="text-lg">🏠</span>
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-black p-2">
              <span className="text-lg">🚪</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="flex overflow-x-auto px-2 py-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 mx-1 rounded-lg transition-all ${
                activeTab === tab.id ? "bg-black text-white" : "text-gray-600 hover:text-black hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="px-4 py-6 pb-20">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <Card className="border border-gray-100">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🍽️</div>
                    <div className="text-2xl font-light text-black">{getTotalItems()}</div>
                    <div className="text-xs text-gray-500">Piatti</div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-100">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🍺</div>
                    <div className="text-2xl font-light text-black">{birreSpina.length}</div>
                    <div className="text-xs text-gray-500">Birre</div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-100">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🥤</div>
                    <div className="text-2xl font-light text-black">{bevande.length}</div>
                    <div className="text-xs text-gray-500">Bevande</div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-100">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">☕</div>
                    <div className="text-2xl font-light text-black">{caffetteria.length}</div>
                    <div className="text-xs text-gray-500">Caffè</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-black">Azioni Rapide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setActiveTab("food")}
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white justify-start"
                  >
                    <span className="text-lg mr-3">🍔</span>
                    Gestisci Piatti
                  </Button>
                  <Button
                    onClick={() => setActiveTab("drinks")}
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white justify-start"
                  >
                    <span className="text-lg mr-3">🍺</span>
                    Gestisci Birre
                  </Button>
                  <Button
                    onClick={saveMenuData}
                    variant="outline"
                    className="w-full h-12 border-gray-300 hover:bg-gray-50 justify-start bg-transparent"
                  >
                    <span className="text-lg mr-3">💾</span>
                    Salva Modifiche
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Food Tab */}
          {activeTab === "food" && (
            <motion.div
              key="food"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <MenuItemEditor
                title="🍔 Hamburger Classici"
                items={hamburgerClassici}
                onUpdate={setHamburgerClassici}
                category="hamburger"
              />
              <MenuItemEditor
                title="🔥 Super Hamburger"
                items={superHamburger}
                onUpdate={setSuperHamburger}
                category="hamburger"
              />
              <MenuItemEditor title="🍢 Mini Piatti" items={miniPiatti} onUpdate={setMiniPiatti} category="appetizer" />
              <MenuItemEditor
                title="🍝 Little Italy"
                items={piattiItaliani}
                onUpdate={setPiattiItaliani}
                category="pasta"
              />
              <MenuItemEditor title="🍕 Pinse" items={pinse} onUpdate={setPinse} category="pizza" />
              <MenuItemEditor title="🥪 Sandwich" items={sandwich} onUpdate={setSandwich} category="sandwich" />
              <MenuItemEditor
                title="🥩 Piatti Griglia"
                items={piattiGriglia}
                onUpdate={setPiattiGriglia}
                category="grill"
              />
              <MenuItemEditor title="🥗 Insalate" items={insalate} onUpdate={setInsalate} category="salad" />
            </motion.div>
          )}

          {/* Drinks Tab */}
          {activeTab === "drinks" && (
            <motion.div
              key="drinks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <BeerEditor beers={birreSpina} onUpdate={setBirreSpina} />
            </motion.div>
          )}

          {/* Desserts Tab */}
          {activeTab === "desserts" && (
            <motion.div
              key="desserts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MenuItemEditor title="🍰 Dolci" items={dolci} onUpdate={setDolci} category="dessert" />
            </motion.div>
          )}

          {/* Beverages Tab */}
          {activeTab === "beverages" && (
            <motion.div
              key="beverages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <CategoryManager title="🥤 Bevande Analcoliche" categories={bevande} onUpdate={setBevande} />
              <CategoryManager title="🍷 Vini & Cocktail" categories={viniCocktail} onUpdate={setViniCocktail} />
              <MenuItemEditor title="☕ Caffetteria" items={caffetteria} onUpdate={setCaffetteria} category="coffee" />
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card className="border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-black">⚙️ Impostazioni</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div>
                      <h3 className="font-medium text-black">💾 Salva Menu</h3>
                      <p className="text-sm text-gray-500">Salva tutte le modifiche</p>
                    </div>
                    <Button onClick={saveMenuData} className="bg-black hover:bg-gray-800 text-white px-6">
                      Salva
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div>
                      <h3 className="font-medium text-black">🔄 Reset Menu</h3>
                      <p className="text-sm text-gray-500">Ripristina valori originali</p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-100 bg-transparent"
                      onClick={() => {
                        if (confirm("Sei sicuro di voler ripristinare il menu originale?")) {
                          localStorage.removeItem("menuData")
                          window.location.reload()
                        }
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
