"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { 
  ArrowLeft,
  Settings,
  Shield,
  Download,
  Upload,
  Key,
  User,
  Bell,
  Palette,
  Database,
  LogOut,
  Save,
  RotateCcw,
  Home,
  Menu,
  Tag,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react"

interface AdminSettings {
  general: {
    restaurantName: string
    adminEmail: string
    timezone: string
    currency: string
  }
  security: {
    sessionTimeout: number
    requirePinChange: boolean
    enableLogging: boolean
    allowBulkOperations: boolean
  }
  notifications: {
    emailAlerts: boolean
    priceChangeAlerts: boolean
    newItemAlerts: boolean
  }
  appearance: {
    darkMode: boolean
    compactView: boolean
    showPreview: boolean
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    general: {
      restaurantName: "Tennis Sports Bar",
      adminEmail: "admin@tennisbar.com", 
      timezone: "Europe/Rome",
      currency: "EUR"
    },
    security: {
      sessionTimeout: 60,
      requirePinChange: false,
      enableLogging: true,
      allowBulkOperations: true
    },
    notifications: {
      emailAlerts: true,
      priceChangeAlerts: true,
      newItemAlerts: false
    },
    appearance: {
      darkMode: false,
      compactView: false,
      showPreview: true
    }
  })
  
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exportingData, setExportingData] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("admin_session")
    if (!isAuthenticated) {
      router.push("/admin")
      return
    }
  }, [router])

  const updateSettings = (section: keyof AdminSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Save to localStorage for demo
      localStorage.setItem("admin_settings", JSON.stringify(settings))
      setHasChanges(false)
      
      console.log("Settings saved:", settings)
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = () => {
    if (confirm("Ripristinare tutte le impostazioni ai valori predefiniti?")) {
      // Reset to defaults would go here
      setHasChanges(true)
    }
  }

  const exportData = async () => {
    setExportingData(true)
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const exportData = {
        settings,
        exportDate: new Date().toISOString(),
        version: "2.0"
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tennisbar-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setExportingData(false)
    }
  }

  const handleLogout = () => {
    if (hasChanges) {
      const confirmed = confirm("Hai modifiche non salvate. Continuare con il logout?")
      if (!confirmed) return
    }
    
    localStorage.removeItem("admin_session")
    localStorage.removeItem("admin_login_time")
    router.push("/admin")
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
              <h1 className="text-xl font-bold text-gray-900">Impostazioni</h1>
              <p className="text-sm text-gray-500">Configurazione sistema</p>
            </div>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salva
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Esci
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Changes Alert */}
        {hasChanges && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              Hai modifiche non salvate. Ricorda di salvare prima di uscire.
            </AlertDescription>
          </Alert>
        )}

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Impostazioni Generali
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Nome Ristorante
              </label>
              <Input
                value={settings.general.restaurantName}
                onChange={(e) => updateSettings("general", "restaurantName", e.target.value)}
                placeholder="Nome del ristorante"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email Admin
              </label>
              <Input
                type="email"
                value={settings.general.adminEmail}
                onChange={(e) => updateSettings("general", "adminEmail", e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Fuso Orario
                </label>
                <Input
                  value={settings.general.timezone}
                  onChange={(e) => updateSettings("general", "timezone", e.target.value)}
                  placeholder="Europe/Rome"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Valuta
                </label>
                <Input
                  value={settings.general.currency}
                  onChange={(e) => updateSettings("general", "currency", e.target.value)}
                  placeholder="EUR"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sicurezza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Timeout Sessione (minuti)
              </label>
              <Input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSettings("security", "sessionTimeout", parseInt(e.target.value) || 60)}
                min="15"
                max="480"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Richiedi Cambio PIN</p>
                  <p className="text-sm text-gray-500">Forza cambio PIN ogni 30 giorni</p>
                </div>
                <Switch
                  checked={settings.security.requirePinChange}
                  onCheckedChange={(checked) => updateSettings("security", "requirePinChange", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Log delle Attività</p>
                  <p className="text-sm text-gray-500">Registra tutte le azioni admin</p>
                </div>
                <Switch
                  checked={settings.security.enableLogging}
                  onCheckedChange={(checked) => updateSettings("security", "enableLogging", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Operazioni Bulk</p>
                  <p className="text-sm text-gray-500">Consenti modifiche multiple</p>
                </div>
                <Switch
                  checked={settings.security.allowBulkOperations}
                  onCheckedChange={(checked) => updateSettings("security", "allowBulkOperations", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifiche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Alert Email</p>
                <p className="text-sm text-gray-500">Notifiche via email</p>
              </div>
              <Switch
                checked={settings.notifications.emailAlerts}
                onCheckedChange={(checked) => updateSettings("notifications", "emailAlerts", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Modifiche Prezzi</p>
                <p className="text-sm text-gray-500">Notifica cambi prezzo</p>
              </div>
              <Switch
                checked={settings.notifications.priceChangeAlerts}
                onCheckedChange={(checked) => updateSettings("notifications", "priceChangeAlerts", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Nuovi Items</p>
                <p className="text-sm text-gray-500">Notifica aggiunta items</p>
              </div>
              <Switch
                checked={settings.notifications.newItemAlerts}
                onCheckedChange={(checked) => updateSettings("notifications", "newItemAlerts", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Aspetto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Modalità Scura</p>
                <p className="text-sm text-gray-500">Tema scuro per l'interfaccia</p>
              </div>
              <Switch
                checked={settings.appearance.darkMode}
                onCheckedChange={(checked) => updateSettings("appearance", "darkMode", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Vista Compatta</p>
                <p className="text-sm text-gray-500">Interfaccia più densa</p>
              </div>
              <Switch
                checked={settings.appearance.compactView}
                onCheckedChange={(checked) => updateSettings("appearance", "compactView", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Anteprima Items</p>
                <p className="text-sm text-gray-500">Mostra preview durante editing</p>
              </div>
              <Switch
                checked={settings.appearance.showPreview}
                onCheckedChange={(checked) => updateSettings("appearance", "showPreview", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5" />
              Gestione Dati
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Funzioni di backup e ripristino per proteggere i tuoi dati.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={exportData}
                disabled={exportingData}
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    {exportingData ? (
                      <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Download className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Esporta Dati</p>
                    <p className="text-sm text-gray-500">Scarica backup completo</p>
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => document.getElementById('import-file')?.click()}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Importa Dati</p>
                    <p className="text-sm text-gray-500">Ripristina da backup</p>
                  </div>
                </div>
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    console.log("Importing:", file.name)
                  }
                }}
              />
              
              <Button
                onClick={resetSettings}
                variant="outline"
                className="justify-start h-auto p-4 text-orange-600 hover:text-orange-700"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <RotateCcw className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Ripristina Default</p>
                    <p className="text-sm text-gray-500">Reset tutte le impostazioni</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informazioni Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Versione Admin Panel</span>
                <Badge variant="secondary">v2.0.0</Badge>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Ultimo Backup</span>
                <span className="text-sm">Mai effettuato</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Items nel Menu</span>
                <span className="font-medium">82</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Spazio Utilizzato</span>
                <span className="text-sm">2.4 MB</span>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <button className="p-4 text-center bg-slate-700 text-white">
            <Settings className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Impostazioni</span>
          </button>
        </div>
      </div>
    </div>
  )
} 