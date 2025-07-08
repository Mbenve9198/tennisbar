"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, Plus, Loader2 } from "lucide-react"
import { 
  useMenuData, 
  formatPrice, 
  hasMultiplePrices, 
  filterItemsByTag,
  type MenuItem 
} from "@/hooks/use-menu-data"

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

  // Carica dati del menu dal database
  const { menuData, loading, error } = useMenuData()

  // Stato di caricamento e gestione errori
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600 dark:text-gray-300">Caricamento menu...</p>
        </div>
      </div>
    )
  }

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
        type: "spring",
        stiffness: 100,
      },
    },
  }

  const MenuCard = ({ item, index }: { item: any; index: number }) => (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 bg-gradient-to-br from-white via-gray-50 to-green-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        {item.popular && (
          <Badge className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-700 text-white">
            <Star className="w-3 h-3 mr-1" />
            Popolare
          </Badge>
        )}
        {item.special && (
          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white">
            <Star className="w-3 h-3 mr-1" />
            Special
          </Badge>
        )}
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{item.name}</CardTitle>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">{item.price}</span>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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

              {/* Jerry Mascot */}
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
                  onClick={() => scrollToSection("hamburger")}
                >
                  🍔 Scopri i Burger
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-gray-800 font-bold bg-transparent"
                  onClick={() => scrollToSection("drinks")}
                >
                  🍺 Vedi le Birre
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Hamburger Classici */}
        <motion.section
          id="hamburger"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Hamburger Classici" emoji="🍔" />
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6 text-lg">Serviti sempre con rustic fries</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hamburgerClassici.map((item, index) => (
              <MenuCard key={index} item={item} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Super Hamburger */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Super Hamburger - Gli Specials" emoji="🔥" />
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6 text-lg">
            I nostri hamburger gourmet con rustic fries
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {superHamburger.map((item, index) => (
              <MenuCard key={index} item={item} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Mini Piatti */}
        <motion.section
          id="food"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Mini Piatti & Contorni" emoji="🍢" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {miniPiatti.map((item, index) => (
              <MenuCard key={index} item={item} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Piatti Italiani */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Little Italy" emoji="🍝" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {piattiItaliani.map((item, index) => (
              <MenuCard key={index} item={item} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Pinse */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Pinse" emoji="🍕" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pinse.map((item, index) => (
              <MenuCard key={index} item={item} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Sandwich */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Sandwich" emoji="🥪" />
          <div className="grid gap-6 md:grid-cols-2">
            {sandwich.map((item, index) => (
              <MenuCard key={index} item={item} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Piatti alla Griglia */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Piatti alla Griglia" emoji="🥩" />
          <div className="grid gap-6 md:grid-cols-2">
            {piattiGriglia.map((item, index) => (
              <MenuCard key={index} item={item} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Insalate */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Insalate & Piatti Misti" emoji="🥗" />
          <div className="grid gap-6 md:grid-cols-2">
            {insalate.map((item, index) => (
              <MenuCard key={index} item={item} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Dolci */}
        <motion.section
          id="desserts"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Dolci" emoji="🍰" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dolci.map((item, index) => (
              <MenuCard key={index} item={item} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Birre */}
        <motion.section
          id="drinks"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-gradient-to-r from-green-600 via-emerald-700 to-green-800 text-white p-4 mb-6 rounded-lg shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">🍺</span>
                Birreria Internazionale alla Spina
              </h2>
            </div>
          </motion.div>

          {/* Beer Size Selector */}
          <div className="mb-6">
            <div className="flex justify-center gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBeerSize("small")}
                className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${
                  beerSize === "small"
                    ? "bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-400 shadow-lg"
                    : "bg-white border-2 border-gray-200 hover:border-amber-300"
                }`}
              >
                <div className="text-6xl mb-2 filter drop-shadow-lg">🍺</div>
                <span className={`font-bold text-lg ${beerSize === "small" ? "text-amber-700" : "text-gray-600"}`}>
                  Small
                </span>
                <span className={`text-sm ${beerSize === "small" ? "text-amber-600" : "text-gray-500"}`}>0.3L</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBeerSize("pinta")}
                className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${
                  beerSize === "pinta"
                    ? "bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-400 shadow-lg"
                    : "bg-white border-2 border-gray-200 hover:border-amber-300"
                }`}
              >
                <div className="text-7xl mb-2 filter drop-shadow-lg">🍻</div>
                <span className={`font-bold text-lg ${beerSize === "pinta" ? "text-amber-700" : "text-gray-600"}`}>
                  Pinta
                </span>
                <span className={`text-sm ${beerSize === "pinta" ? "text-amber-600" : "text-gray-500"}`}>0.5L</span>
              </motion.button>
            </div>

            {/* Beer Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {birreSpina.map((birra, index) => {
                const price = beerSize === "small" ? birra.small : birra.pinta
                const isAvailable = price !== "–"

                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={isAvailable ? { scale: 1.02, y: -5 } : {}}
                    className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                      isAvailable
                        ? "bg-gradient-to-br from-white via-amber-50 to-yellow-50 border-2 border-amber-200 hover:border-amber-400 shadow-lg hover:shadow-xl"
                        : "bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 opacity-60"
                    }`}
                  >
                    {!isAvailable && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge variant="secondary" className="bg-gray-500 text-white">
                          Non disponibile
                        </Badge>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className={`font-bold text-lg mb-1 ${isAvailable ? "text-gray-900" : "text-gray-500"}`}>
                            {birra.name}
                          </h3>
                          <p className={`text-sm ${isAvailable ? "text-amber-700" : "text-gray-400"}`}>{birra.type}</p>
                        </div>
                        <div className="text-4xl ml-4 filter drop-shadow-md">{beerSize === "small" ? "🍺" : "🍻"}</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className={`text-2xl font-bold ${isAvailable ? "text-green-600" : "text-gray-400"}`}>
                          {price}
                        </div>
                        {isAvailable && (
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                            }}
                            className="text-2xl"
                          >
                            ✨
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full blur-xl"></div>
                    <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-lg"></div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900">
              <CardHeader>
                <CardTitle className="text-xl text-green-700 dark:text-green-300">🍺 Speciali</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Caraffa 1L</span>
                    <span className="font-bold">Prezzo pinta + €10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annaffiatoio di birra (5L)</span>
                    <span className="font-bold text-green-600">€45,00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900">
              <CardHeader>
                <CardTitle className="text-xl text-green-700 dark:text-green-300">🍻 Birre in Bottiglia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold mb-2">A €3,50:</div>
                    <div className="text-sm">Peroni, Heineken, Corona, Ichnusa, Lacrima di Gobbo</div>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">A €4,50:</div>
                    <div className="text-sm">
                      Stella Artois, Tennent's, Birra senza glutine, 00 analcolica, IPA artigianale
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Bevande */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Bevande Analcoliche" emoji="🥤" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bevande.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700 dark:text-blue-300">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-center">
                        <span className="text-sm">{item.name}</span>
                        <span className="font-bold text-blue-600">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Vini e Cocktail */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Vini & Cocktail" emoji="🍷" />
          <div className="grid gap-6 md:grid-cols-2">
            {viniCocktail.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-700 dark:text-purple-300">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{item.name}</span>
                          <span className="font-bold text-purple-600">{item.price}</span>
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Caffetteria */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Caffetteria & Alcolici" emoji="☕" />
          <Card className="border-2 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {caffetteria.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg"
                  >
                    <span>{item.name}</span>
                    <span className="font-bold text-amber-600">{item.price}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Extra Ingredienti */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Extra Ingredienti" emoji="➕" />
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-lg text-green-700 dark:text-green-300">Aggiunte €1,00 cad.</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    "bacon",
                    "cheddar",
                    "cetriolini",
                    "jalapeños",
                    "crispy onion",
                    "jalapeños ripieni",
                    "cavolo cappuccio viola",
                    "friarielli",
                    "uovo",
                    "cipolla caramellata",
                  ].map((item, index) => (
                    <Badge key={index} variant="outline" className="border-green-300 text-green-700">
                      <Plus className="w-3 h-3 mr-1" />
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-lg text-green-700 dark:text-green-300">Aggiunte €2,00</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="border-green-300 text-green-700">
                  <Plus className="w-3 h-3 mr-1" />
                  avocado
                </Badge>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Info & Contatti */}
        <motion.section
          id="info"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <SectionHeader title="Info & Contatti" emoji="📍" />
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Dove Siamo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <strong>Tennis Sports Bar & Grill</strong>
                    <br />
                    Via di Scandicci Alto 22
                    <br />
                    50018 Scandicci (FI)
                  </div>
                  <div>
                    <strong>Orari:</strong>
                    <br />
                    Sabato e Domenica a pranzo
                    <br />
                    Menu completo con Hamburger e Sandwiches
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  WiFi & Social
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <strong>WiFi FREE</strong>
                    <br />
                    Rete: Tennis Sports Bar and Grill 2
                    <br />
                    Password: Tenniss00
                  </div>
                  <div>
                    <strong>Seguici sui social:</strong>
                    <br />
                    <div className="text-sm space-y-1">
                      <div>📱 Instagram: @tennis_sports_bar_grill</div>
                      <div>📘 Facebook: Tennis Sports Bar & Grill</div>
                      <div>🎵 TikTok: @tennissportbar</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <Card className="bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 text-white border-none relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
              <CardContent className="p-8 relative z-10">
                <h3 className="text-2xl font-bold mb-4">Ti sei trovato bene?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Ci farebbe davvero piacere sapere com'è andata la tua esperienza.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" className="bg-white text-gray-800 hover:bg-gray-100 font-bold">
                    <Star className="w-5 h-5 mr-2" />
                    Lascia una Recensione
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>
      </main>

      {/* Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-t-2 border-gray-200 dark:border-gray-700 shadow-2xl z-40"
      >
        <div className="flex justify-around items-center py-2">
          {menuSections.map((section) => (
            <Button
              key={section.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 p-2 h-auto ${
                activeSection === section.id ? "text-gray-700 dark:text-gray-300" : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => scrollToSection(section.id)}
            >
              <span className="text-xl">{section.emoji}</span>
              <span className="text-xs font-medium">{section.label}</span>
            </Button>
          ))}
        </div>
      </motion.nav>
    </div>
  )
}
