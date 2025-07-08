"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Lock, User, Smartphone, Eye, EyeOff } from "lucide-react"
import { AdminAuth } from "@/lib/admin-auth"

export default function AdminLoginPage() {
  const [pin, setPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // PIN admin fisso per ora (in futuro da env)
  const ADMIN_PIN = "2024"

  const handleLogin = async () => {
    setLoading(true)
    setError("")

    // Simula autenticazione
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (pin === ADMIN_PIN) {
      // Usa la utility per il login
      AdminAuth.login()
      
      // Redirect a dashboard
      router.push("/admin/dashboard")
    } else {
      setError("PIN non corretto")
      setPin("")
    }

    setLoading(false)
  }

  const handlePinInput = (value: string) => {
    // Solo numeri, max 4 cifre
    const numericValue = value.replace(/\D/g, "").slice(0, 4)
    setPin(numericValue)
    setError("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pin.length >= 4) {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            {/* Logo Area */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Admin Tennis Bar
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Inserisci il PIN per accedere al pannello di controllo
              </CardDescription>
            </div>

            {/* Status Badges */}
            <div className="flex gap-2 justify-center">
              <Badge variant="outline" className="text-xs">
                <Smartphone className="w-3 h-3 mr-1" />
                Mobile Ready
              </Badge>
              <Badge variant="outline" className="text-xs">
                <User className="w-3 h-3 mr-1" />
                Staff Access
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* PIN Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                PIN Admin (4 cifre)
              </label>
              <div className="relative">
                <Input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => handlePinInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="• • • •"
                  className="text-center text-2xl tracking-widest h-14 pr-12"
                  maxLength={4}
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <p className="text-red-600 text-sm text-center font-medium">
                  {error}
                </p>
              </motion.div>
            )}

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={pin.length < 4 || loading}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifica...
                </div>
              ) : (
                "Accedi al Pannello"
              )}
            </Button>

            {/* Quick Numbers Grid (for mobile) */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "←"].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  className="h-12 text-lg font-semibold"
                  onClick={() => {
                    if (num === "C") {
                      setPin("")
                      setError("")
                    } else if (num === "←") {
                      setPin(prev => prev.slice(0, -1))
                      setError("")
                    } else if (typeof num === "number" && pin.length < 4) {
                      setPin(prev => prev + num.toString())
                      setError("")
                    }
                  }}
                >
                  {num}
                </Button>
              ))}
            </div>

            {/* Help Text */}
            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">
                💡 Suggerimento: Usa la tastiera numerica o i pulsanti qui sopra
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Info (rimuovere in produzione) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 text-center"
        >
          <Badge variant="secondary" className="text-xs">
            🚧 Demo: PIN = 2024
          </Badge>
        </motion.div>
      </motion.div>
    </div>
  )
}
