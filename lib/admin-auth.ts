// Utility per gestire l'autenticazione admin in modo consistente

export const AdminAuth = {
  // Controlla se l'utente è autenticato (sia cookie che localStorage)
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    }

    const cookieAuth = getCookie("admin_session")
    const localAuth = localStorage.getItem("admin_session")
    
    return cookieAuth === "authenticated" || localAuth === "authenticated"
  },

  // Effettua il login salvando sia nei cookie che nel localStorage
  login(): void {
    if (typeof window === 'undefined') return
    
    const maxAge = 60 * 60 * 24 // 24 ore
    
    // Salva nei cookie (per middleware)
    document.cookie = `admin_session=authenticated; path=/; max-age=${maxAge}`
    document.cookie = `admin_login_time=${new Date().toISOString()}; path=/; max-age=${maxAge}`
    
    // Salva nel localStorage (per compatibilità)
    localStorage.setItem("admin_session", "authenticated")
    localStorage.setItem("admin_login_time", new Date().toISOString())
  },

  // Effettua il logout rimuovendo tutto
  logout(): void {
    if (typeof window === 'undefined') return
    
    // Rimuovi cookie
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "admin_login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    // Rimuovi localStorage
    localStorage.removeItem("admin_session")
    localStorage.removeItem("admin_login_time")
    localStorage.removeItem("adminAuth") // Vecchio formato
    localStorage.removeItem("adminUser") // Vecchio formato
  },

  // Ottiene il tempo di login
  getLoginTime(): string | null {
    if (typeof window === 'undefined') return null
    
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    }

    return getCookie("admin_login_time") || localStorage.getItem("admin_login_time")
  }
} 