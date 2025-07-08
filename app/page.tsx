"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, Loader2 } from "lucide-react"
import { 
  useMenuData, 
  formatPrice, 
  hasMultiplePrices, 
  filterItemsByTag,
  type MenuItem 
} from "@/hooks/use-menu-data"
import { MenuAppSkeleton } from "@/components/ui/skeleton"
import { SearchFilter } from "@/components/ui/search-filter"

const menuSections = [
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "hamburger", label: "Burger", emoji: "🍔" },
  { id: "food", label: "Food", emoji: "🍽️" },
  { id: "drinks", label: "Drinks", emoji: "🍺" },
  { id: "desserts", label: "Dolci", emoji: "🍰" },
  { id: "info", label: "Info", emoji: "📍" },
]

export default function TennisMenuApp() {
  const [activeSection, setActiveSection] = useState("home")
  const [beerSize, setBeerSize] = useState<"small" | "pinta">("pinta")
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [showSearch, setShowSearch] = useState(false)

  // Carica dati del menu dal database
  const { menuData, loading, error } = useMenuData()

  // Raccogli tutti gli items per la ricerca
  const allMenuItems = useMemo(() => {
    if (!menuData) return []
    
    const items: MenuItem[] = []
    
    // Items diretti dalle categorie
    Object.values(menuData).forEach(category => {
      if (category?.items) {
        items.push(...category.items)
      }
      // Items dalle sottocategorie
      if (category?.subcategories) {
        category.subcategories.forEach((sub: any) => {
          if (sub.items) {
            items.push(...sub.items)
          }
        })
      }
    })
    
    return items
  }, [menuData])

  // Stato di caricamento con skeleton
  if (loading) {
    return <MenuAppSkeleton />
  }

  // Gestione errori
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Errore nel caricamento del menu: {error}</p>
          <Button onClick={() => window.location.reload()}>Riprova</Button>
        </div>
      </div>
    )
  }

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  }

  // Componente per le card del menu
  const MenuCard = ({ item }: { item: MenuItem }) => {
    const isPopular = item.tags.includes('popular')
    const isSpecial = item.tags.includes('special')
    const showBeerSizes = hasMultiplePrices(item.pricing)

    return (
      <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 bg-gradient-to-br from-white via-gray-50 to-green-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
          {isPopular && (
            <Badge className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-700 text-white">
              <Star className="w-3 h-3 mr-1" />
              Popolare
            </Badge>
          )}
          {isSpecial && (
            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white">
              <Star className="w-3 h-3 mr-1" />
              Special
            </Badge>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {item.name}
            </CardTitle>
            {item.type && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.type}</p>
            )}
            <div className="flex justify-between items-center">
              {showBeerSizes ? (
                <div className="space-y-2 w-full">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Scegli la tua misura:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Piccola (30cl)</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {formatPrice(item.pricing, "small")}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pinta (50cl)</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {formatPrice(item.pricing, "pinta")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {formatPrice(item.pricing)}
                </span>
              )}
            </div>
          </CardHeader>
          {item.description && (
            <CardContent className="pt-0">
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.description}
              </CardDescription>
            </CardContent>
          )}
        </Card>
      </motion.div>
    )
  }

  // Componente per le header delle sezioni
  const SectionHeader = ({ title, emoji }: { title: string; emoji: string }) => (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white p-4 mb-6 rounded-lg shadow-lg relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
      <div className="relative z-10">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          {title}
        </h2>
      </div>
    </motion.div>
  )

  // Componente per le sottocategorie
  const SubcategorySection = ({ subcategory }: { subcategory: any }) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        {subcategory.name}
      </h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subcategory.items.map((item: MenuItem) => (
          <MenuCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Search & Filter Bar */}
      {showSearch && (
        <SearchFilter
          allItems={allMenuItems}
          onFilteredItemsChange={setFilteredItems}
        />
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Hero Section */}
        <motion.section
          id="home"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 mb-12"
        >
          <div className="bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
            <div className="relative z-10">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="mb-6 flex justify-center"
              >
                <img src="/logo.png" alt="Tennis Sports Bar & Grill Logo" className="w-32 h-32 object-contain" />
              </motion.div>

              <div className="mb-6 flex justify-center">
                <img
                  src="/jerry-mascot.png"
                  alt="Jerry - Tennis Sports Bar Mascot"
                  className="w-48 h-48 object-contain drop-shadow-2xl"
                />
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-gray-800 hover:bg-gray-100 font-bold"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  🔍 {showSearch ? 'Chiudi Ricerca' : 'Cerca nel Menu'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-gray-800 font-bold bg-transparent"
                  onClick={() => scrollToSection("hamburger")}
                >
                  🍔 Scopri i Burger
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Risultati Ricerca */}
        {showSearch && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            {filteredItems.length > 0 ? (
              <>
                <SectionHeader title={`Risultati Ricerca (${filteredItems.length})`} emoji="🔍" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((item) => (
                    <MenuCard key={item._id} item={item} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-2xl mb-4">🔍</p>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Nessun risultato trovato
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Prova a modificare i filtri o il termine di ricerca
                </p>
              </div>
            )}
          </motion.section>
        )}

        {/* Sezioni Menu Normali (nascoste durante ricerca attiva) */}
        {!showSearch && (
          <>
        {/* Sezione Hamburger */}
        {menuData.hamburger && (
          <motion.section
            id="hamburger"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12"
          >
            <SectionHeader title={menuData.hamburger.name} emoji={menuData.hamburger.emoji} />
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6 text-lg">Serviti sempre con rustic fries</p>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {menuData.hamburger.items.map((item) => (
                <MenuCard key={item._id} item={item} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Sezione Food */}
        {menuData.food && (
          <motion.section
            id="food"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12"
          >
            <SectionHeader title={menuData.food.name} emoji={menuData.food.emoji} />
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {menuData.food.items.map((item) => (
                <MenuCard key={item._id} item={item} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Sezione Drinks */}
        {menuData.drinks && (
          <motion.section
            id="drinks"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12"
          >
            <SectionHeader title={menuData.drinks.name} emoji={menuData.drinks.emoji} />
            
            {/* Birre alla spina (items diretti) */}
            {menuData.drinks.items.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Birre alla Spina
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {menuData.drinks.items.map((item) => (
                    <MenuCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Sottocategorie (Bevande, Vini, etc.) */}
            {menuData.drinks.subcategories.map((subcategory) => (
              <SubcategorySection key={subcategory._id} subcategory={subcategory} />
            ))}
          </motion.section>
        )}

        {/* Sezione Dolci */}
        {menuData.desserts && (
          <motion.section
            id="desserts"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12"
          >
            <SectionHeader title={menuData.desserts.name} emoji={menuData.desserts.emoji} />
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {menuData.desserts.items.map((item) => (
                <MenuCard key={item._id} item={item} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Sezione Info */}
        <motion.section
          id="info"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Informazioni" emoji="📍" />
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Dove Siamo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Via Tennis Court, 123<br />
                  00100 Roma, Italia
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aperto tutti i giorni<br />
                  12:00 - 02:00
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  WiFi Gratuito
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Rete: TennisBar_Free
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Password: tennis2024
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>
          </>
        )}
      </main>

      {/* Navigazione mobile sticky */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {menuSections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "ghost"}
              size="sm"
              onClick={() => scrollToSection(section.id)}
              className="flex flex-col items-center gap-1 min-w-0 flex-1 h-auto py-2"
            >
              <span className="text-lg">{section.emoji}</span>
              <span className="text-xs">{section.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  )
} 