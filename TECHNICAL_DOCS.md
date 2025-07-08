# 🛠️ Documentazione Tecnica - Tennis Sports Bar

> **Guida tecnica completa per sviluppatori con architettura, implementazioni e best practices**

---

## 📚 Indice Tecnico

1. [Architettura Applicazione](#architettura-applicazione)
2. [Implementazioni Chiave](#implementazioni-chiave)
3. [Database Design](#database-design)
4. [API Design Patterns](#api-design-patterns)
5. [Performance Optimization](#performance-optimization)
6. [Security Implementation](#security-implementation)
7. [Testing Strategy](#testing-strategy)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architettura Applicazione

### Next.js App Router Architecture

```typescript
// app/layout.tsx - Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Middleware Implementation

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  
  if (isAdminRoute && request.nextUrl.pathname !== '/admin') {
    const session = request.cookies.get('admin_session')
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
```

### State Management Pattern

```typescript
// hooks/use-menu-data.ts
import { useState, useEffect } from 'react'

interface UseMenuDataReturn {
  menuData: MenuData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useMenuData(): UseMenuDataReturn {
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenuData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/menu')
      const data = await response.json()
      
      if (data.success) {
        setMenuData(data.data)
        setError(null)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuData()
  }, [])

  return { menuData, loading, error, refetch: fetchMenuData }
}
```

---

## 🔧 Implementazioni Chiave

### Authentication System

```typescript
// lib/admin-auth.ts
export const AdminAuth = {
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

  login(): void {
    if (typeof window === 'undefined') return
    
    // Set cookie (for server-side middleware)
    const maxAge = 60 * 60 * 24 // 24 hours
    document.cookie = `admin_session=authenticated; path=/; max-age=${maxAge}`
    document.cookie = `admin_login_time=${new Date().toISOString()}; path=/; max-age=${maxAge}`
    
    // Set localStorage (for client-side persistence)
    localStorage.setItem("admin_session", "authenticated")
    localStorage.setItem("admin_login_time", new Date().toISOString())
  },

  logout(): void {
    if (typeof window === 'undefined') return
    
    // Clear cookies
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "admin_login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    // Clear localStorage
    localStorage.removeItem("admin_session")
    localStorage.removeItem("admin_login_time")
  }
}
```

### Menu Data Parser

```typescript
// lib/menu-data-parser.ts
interface RawMenuData {
  _id: string
  name: string
  section: string
  items?: any[]
  subcategories?: any[]
}

export function parseMenuData(rawData: RawMenuData[]): MenuItem[] {
  const items: MenuItem[] = []
  
  rawData.forEach((category) => {
    let categoryType = mapCategoryType(category)
    
    // Add direct category items
    if (category.items && Array.isArray(category.items)) {
      items.push(...category.items.map((item: any) => ({
        ...item,
        category: categoryType,
        tags: item.tags || []
      })))
    }

    // Add items from subcategories
    if (category.subcategories && Array.isArray(category.subcategories)) {
      category.subcategories.forEach((subcategory: any) => {
        if (subcategory.items && Array.isArray(subcategory.items)) {
          items.push(...subcategory.items.map((item: any) => ({
            ...item,
            category: categoryType,
            subcategory: subcategory.name,
            tags: item.tags || []
          })))
        }
      })
    }
  })
  
  return items
}

function mapCategoryType(category: any): string {
  if (category.section === "hamburger" || category.name?.toLowerCase().includes("hamburger")) {
    return "hamburger"
  } else if (category.section === "drinks" || category.name?.toLowerCase().includes("drink")) {
    return "drinks"
  } else if (category.section === "desserts" || category.name?.toLowerCase().includes("dolc")) {
    return "desserts"
  } else {
    return "food"
  }
}
```

### Price Display Logic

```typescript
// utils/price-formatter.ts
export interface PriceConfig {
  price?: number
  beer_price_30cl?: number
  beer_price_50cl?: number
  pricing?: {
    regular?: number
    small?: number
    large?: number
  }
}

export function formatPrice(config: PriceConfig): string {
  // Check for beer pricing structure
  if (config.beer_price_30cl && config.beer_price_50cl) {
    return `€${config.beer_price_30cl}/${config.beer_price_50cl}`
  }
  
  // Check for pricing object structure
  if (config.pricing) {
    if (config.pricing.small && config.pricing.large) {
      return `€${config.pricing.small}/${config.pricing.large}`
    }
    if (config.pricing.regular) {
      return `€${config.pricing.regular.toFixed(2)}`
    }
  }
  
  // Fallback to simple price
  return `€${config.price?.toFixed(2) || "N/A"}`
}

export function getPriceRange(items: PriceConfig[]): { min: number, max: number } {
  const prices = items.flatMap(item => {
    const allPrices = []
    if (item.price) allPrices.push(item.price)
    if (item.beer_price_30cl) allPrices.push(item.beer_price_30cl)
    if (item.beer_price_50cl) allPrices.push(item.beer_price_50cl)
    if (item.pricing?.regular) allPrices.push(item.pricing.regular)
    if (item.pricing?.small) allPrices.push(item.pricing.small)
    if (item.pricing?.large) allPrices.push(item.pricing.large)
    return allPrices
  })
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  }
}
```

---

## 🗄️ Database Design

### MongoDB Connection

```typescript
// lib/mongodb.ts
import mongoose from 'mongoose'

declare global {
  var mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI
  
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectToDatabase
```

### Mongoose Models

```typescript
// lib/models/MenuItem.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IMenuItem extends Document {
  name: string
  description?: string
  price?: number
  beer_price_30cl?: number
  beer_price_50cl?: number
  pricing?: {
    regular?: number
    small?: number
    large?: number
  }
  category: string
  subcategory?: string
  tags: string[]
  available: boolean
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const MenuItemSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, min: 0 },
  beer_price_30cl: { type: Number, min: 0 },
  beer_price_50cl: { type: Number, min: 0 },
  pricing: {
    regular: { type: Number, min: 0 },
    small: { type: Number, min: 0 },
    large: { type: Number, min: 0 }
  },
  category: { type: String, required: true },
  subcategory: { type: String },
  tags: [{ type: String }],
  available: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
})

// Indexes for performance
MenuItemSchema.index({ category: 1, order: 1 })
MenuItemSchema.index({ name: 'text', description: 'text' })
MenuItemSchema.index({ tags: 1 })
MenuItemSchema.index({ available: 1, isActive: 1 })

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema)
```

### Aggregation Pipelines

```typescript
// lib/aggregations/menu-aggregation.ts
export const getMenuAggregation = () => [
  {
    $match: { isActive: true }
  },
  {
    $sort: { order: 1 }
  },
  {
    $lookup: {
      from: 'subcategories',
      let: { categoryId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$categoryId', '$$categoryId'] },
                { $eq: ['$isActive', true] }
              ]
            }
          }
        },
        { $sort: { order: 1 } },
        {
          $lookup: {
            from: 'menuitems',
            let: { subcategoryId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$subcategoryId', '$$subcategoryId'] },
                      { $eq: ['$isActive', true] }
                    ]
                  }
                }
              },
              { $sort: { order: 1 } }
            ],
            as: 'items'
          }
        }
      ],
      as: 'subcategories'
    }
  },
  {
    $lookup: {
      from: 'menuitems',
      let: { categoryId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$categoryId', '$$categoryId'] },
                { $eq: ['$isActive', true] },
                { $not: { $gt: ['$subcategoryId', null] } }
              ]
            }
          }
        },
        { $sort: { order: 1 } }
      ],
      as: 'items'
    }
  },
  {
    $project: {
      _id: 1,
      name: 1,
      emoji: 1,
      section: 1,
      order: 1,
      subcategories: 1,
      items: 1
    }
  }
]
```

---

## 🔌 API Design Patterns

### Error Handling Pattern

```typescript
// lib/api-helpers.ts
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): ApiResponse<T> {
  return {
    success,
    ...(data && { data }),
    ...(error && { error }),
    ...(message && { message })
  }
}

export function handleApiError(error: unknown): ApiResponse {
  console.error('API Error:', error)
  
  if (error instanceof Error) {
    return createApiResponse(false, undefined, error.message)
  }
  
  return createApiResponse(false, undefined, 'Internal server error')
}

// Usage in API routes
export async function GET() {
  try {
    await connectToDatabase()
    const data = await MenuItem.find({ isActive: true })
    
    return NextResponse.json(createApiResponse(true, data))
  } catch (error) {
    return NextResponse.json(
      handleApiError(error),
      { status: 500 }
    )
  }
}
```

### Request Validation

```typescript
// lib/validators.ts
import { z } from 'zod'

export const MenuItemSchema = z.object({
  name: z.string().min(1, 'Nome richiesto').max(100, 'Nome troppo lungo'),
  description: z.string().max(500, 'Descrizione troppo lunga').optional(),
  price: z.number().min(0, 'Prezzo deve essere positivo').optional(),
  beer_price_30cl: z.number().min(0, 'Prezzo deve essere positivo').optional(),
  beer_price_50cl: z.number().min(0, 'Prezzo deve essere positivo').optional(),
  category: z.enum(['hamburger', 'food', 'drinks', 'desserts']),
  subcategory: z.string().max(50, 'Sottocategoria troppo lunga').optional(),
  tags: z.array(z.string()).max(10, 'Troppi tags'),
  available: z.boolean()
})

export const BulkOperationSchema = z.object({
  action: z.enum(['make_available', 'make_unavailable', 'add_tag', 'remove_tag', 'update_prices', 'delete']),
  itemIds: z.array(z.string()).min(1, 'Almeno un item richiesto'),
  updates: z.object({
    tag: z.string().optional(),
    priceChange: z.object({
      type: z.enum(['percentage', 'fixed']),
      value: z.number()
    }).optional()
  }).optional()
})

// Usage in API route
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = MenuItemSchema.parse(body)
    
    // Process validated data...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Validation failed', error.issues),
        { status: 400 }
      )
    }
    
    return NextResponse.json(handleApiError(error), { status: 500 })
  }
}
```

### Caching Strategy

```typescript
// lib/cache.ts
const CACHE_DURATIONS = {
  MENU: 60, // 1 minute
  CATEGORIES: 300, // 5 minutes
  STATS: 30 // 30 seconds
} as const

export function getCacheHeaders(duration: number) {
  return {
    'Cache-Control': `s-maxage=${duration}, stale-while-revalidate=${duration * 5}`,
    'CDN-Cache-Control': `max-age=${duration * 2}`,
    'Vary': 'Accept-Encoding'
  }
}

// In API route
export async function GET() {
  try {
    const data = await getMenuData()
    
    return NextResponse.json(
      createApiResponse(true, data),
      { 
        headers: getCacheHeaders(CACHE_DURATIONS.MENU)
      }
    )
  } catch (error) {
    return NextResponse.json(handleApiError(error), { status: 500 })
  }
}
```

---

## ⚡ Performance Optimization

### Component Optimization

```typescript
// components/optimized-menu-item.tsx
import { memo } from 'react'
import { motion } from 'framer-motion'

interface OptimizedMenuItemProps {
  item: MenuItem
  index: number
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
}

const OptimizedMenuItem = memo(({ item, index, onEdit, onDelete }: OptimizedMenuItemProps) => {
  const handleEdit = useCallback(() => onEdit(item), [item, onEdit])
  const handleDelete = useCallback(() => onDelete(item), [item, onDelete])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="menu-item-card"
    >
      {/* Item content */}
    </motion.div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.item._id === nextProps.item._id &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.available === nextProps.item.available &&
    prevProps.index === nextProps.index
  )
})

OptimizedMenuItem.displayName = 'OptimizedMenuItem'
export default OptimizedMenuItem
```

### Virtual Scrolling for Large Lists

```typescript
// hooks/use-virtual-scroll.ts
import { useState, useEffect, useMemo } from 'react'

interface UseVirtualScrollProps {
  items: any[]
  itemHeight: number
  containerHeight: number
}

export function useVirtualScroll({ items, itemHeight, containerHeight }: UseVirtualScrollProps) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    }
  }, [items, itemHeight, containerHeight, scrollTop])
  
  return {
    visibleItems,
    setScrollTop
  }
}
```

### Image Optimization

```typescript
// components/optimized-image.tsx
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
}

export function OptimizedImage({ src, alt, width, height, priority = false }: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  return (
    <div className="relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {hasError ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <span className="text-gray-500">Immagine non disponibile</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
    </div>
  )
}
```

---

## 🔒 Security Implementation

### Input Sanitization

```typescript
// lib/sanitization.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeInput(input: string): string {
  // Remove HTML tags and potentially dangerous content
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}

export function sanitizeMenuItem(item: Partial<MenuItem>): Partial<MenuItem> {
  return {
    ...item,
    name: item.name ? sanitizeInput(item.name) : undefined,
    description: item.description ? sanitizeInput(item.description) : undefined,
    category: item.category ? sanitizeInput(item.category) : undefined,
    subcategory: item.subcategory ? sanitizeInput(item.subcategory) : undefined,
    tags: item.tags ? item.tags.map(tag => sanitizeInput(tag)) : undefined
  }
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
const rateLimitMap = new Map()

export function rateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  
  const requests = rateLimitMap.get(identifier) || []
  const validRequests = requests.filter((time: number) => time > windowStart)
  
  if (validRequests.length >= limit) {
    return false
  }
  
  validRequests.push(now)
  rateLimitMap.set(identifier, validRequests)
  
  return true
}

// Usage in API route
export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  
  if (!rateLimit(ip, 100, 60000)) { // 100 requests per minute
    return NextResponse.json(
      createApiResponse(false, undefined, 'Rate limit exceeded'),
      { status: 429 }
    )
  }
  
  // Process request...
}
```

### Environment Variable Validation

```typescript
// lib/env-validation.ts
import { z } from 'zod'

const envSchema = z.object({
  MONGODB_URI: z.string().url('Invalid MongoDB URI'),
  NEXTAUTH_SECRET: z.string().min(32, 'Secret must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL'),
  ADMIN_PIN: z.string().regex(/^\d{4}$/, 'Admin PIN must be 4 digits'),
  NODE_ENV: z.enum(['development', 'production', 'test'])
})

export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('Environment validation failed:', error)
    throw new Error('Invalid environment configuration')
  }
}

// Call during app initialization
validateEnv()
```

---

## 🧪 Testing Strategy

### Unit Testing

```typescript
// __tests__/utils/price-formatter.test.ts
import { formatPrice, getPriceRange } from '@/utils/price-formatter'

describe('formatPrice', () => {
  it('should format beer prices correctly', () => {
    const config = {
      beer_price_30cl: 3.50,
      beer_price_50cl: 5.00
    }
    
    expect(formatPrice(config)).toBe('€3.5/€5')
  })
  
  it('should format regular price correctly', () => {
    const config = { price: 12.50 }
    
    expect(formatPrice(config)).toBe('€12.50')
  })
  
  it('should handle missing prices', () => {
    const config = {}
    
    expect(formatPrice(config)).toBe('€N/A')
  })
})

describe('getPriceRange', () => {
  it('should calculate correct price range', () => {
    const items = [
      { price: 10 },
      { beer_price_30cl: 3.50, beer_price_50cl: 5.00 },
      { price: 15 }
    ]
    
    const range = getPriceRange(items)
    
    expect(range.min).toBe(3.50)
    expect(range.max).toBe(15)
  })
})
```

### Component Testing

```typescript
// __tests__/components/menu-item-editor.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MenuItemEditor from '@/components/admin/menu-item-editor'

const mockItem = {
  _id: '1',
  name: 'Pizza Margherita',
  description: 'Pizza classica',
  price: 12.50,
  category: 'food',
  tags: ['popular'],
  available: true
}

describe('MenuItemEditor', () => {
  it('should render item in view mode by default', () => {
    render(
      <MenuItemEditor 
        item={mockItem} 
        onSave={jest.fn()} 
        onCancel={jest.fn()} 
      />
    )
    
    expect(screen.getByText('Pizza Margherita')).toBeInTheDocument()
    expect(screen.getByText('Pizza classica')).toBeInTheDocument()
    expect(screen.getByText('€12.50')).toBeInTheDocument()
  })
  
  it('should enter edit mode when edit button is clicked', () => {
    render(
      <MenuItemEditor 
        item={mockItem} 
        onSave={jest.fn()} 
        onCancel={jest.fn()} 
      />
    )
    
    fireEvent.click(screen.getByText('Modifica'))
    
    expect(screen.getByDisplayValue('Pizza Margherita')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Pizza classica')).toBeInTheDocument()
  })
  
  it('should validate form before submitting', async () => {
    const onSave = jest.fn()
    
    render(
      <MenuItemEditor 
        item={mockItem} 
        onSave={onSave} 
        onCancel={jest.fn()} 
        isEditing={true}
      />
    )
    
    // Clear name field
    fireEvent.change(screen.getByDisplayValue('Pizza Margherita'), {
      target: { value: '' }
    })
    
    fireEvent.click(screen.getByText('Salva'))
    
    await waitFor(() => {
      expect(screen.getByText('Nome richiesto')).toBeInTheDocument()
    })
    
    expect(onSave).not.toHaveBeenCalled()
  })
})
```

### API Testing

```typescript
// __tests__/api/menu.test.ts
import { GET, POST } from '@/app/api/menu/route'
import { NextRequest } from 'next/server'

// Mock MongoDB connection
jest.mock('@/lib/mongodb')
jest.mock('@/lib/models/MenuItem')

describe('/api/menu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  describe('GET', () => {
    it('should return menu data successfully', async () => {
      const mockMenuData = [
        {
          _id: '1',
          name: 'Hamburger',
          section: 'hamburger',
          items: []
        }
      ]
      
      // Mock successful database call
      require('@/lib/models/Category').aggregate.mockResolvedValue(mockMenuData)
      
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockMenuData)
    })
    
    it('should handle database errors', async () => {
      // Mock database error
      require('@/lib/models/Category').aggregate.mockRejectedValue(
        new Error('Database connection failed')
      )
      
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })
  })
})
```

### E2E Testing

```typescript
// e2e/admin-workflow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admin Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
  })
  
  test('should complete full admin workflow', async ({ page }) => {
    // Login
    await page.fill('input[type="password"]', '2024')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/admin/dashboard')
    
    // Navigate to menu management
    await page.click('text=Menu')
    await expect(page).toHaveURL('/admin/menu')
    
    // Add new item
    await page.click('text=Aggiungi Item')
    await page.fill('input[name="name"]', 'Test Pizza')
    await page.fill('textarea[name="description"]', 'Test description')
    await page.fill('input[name="price"]', '15.50')
    await page.selectOption('select[name="category"]', 'food')
    
    await page.click('button[type="submit"]')
    
    // Verify item was added
    await expect(page.locator('text=Test Pizza')).toBeVisible()
    
    // Edit item
    await page.click('button:has-text("Modifica")').first()
    await page.fill('input[name="name"]', 'Updated Test Pizza')
    await page.click('button:has-text("Salva")')
    
    // Verify item was updated
    await expect(page.locator('text=Updated Test Pizza')).toBeVisible()
    
    // Delete item
    await page.click('button:has-text("Elimina")').first()
    await page.click('button:has-text("Conferma")')
    
    // Verify item was deleted
    await expect(page.locator('text=Updated Test Pizza')).not.toBeVisible()
  })
  
  test('should handle bulk operations', async ({ page }) => {
    // Login and navigate to bulk operations
    await page.fill('input[type="password"]', '2024')
    await page.click('button[type="submit"]')
    await page.click('text=Menu')
    await page.click('text=Operazioni Bulk')
    
    // Select multiple items
    await page.check('input[type="checkbox"]').first()
    await page.check('input[type="checkbox"]').nth(1)
    
    // Execute bulk action
    await page.click('button:has-text("Azioni")')
    await page.click('text=Rendi Disponibili')
    await page.click('button:has-text("Conferma")')
    
    // Verify success message
    await expect(page.locator('text=Operazione completata')).toBeVisible()
  })
})
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Issues

```bash
# Error: MongooseServerSelectionError
# Solution: Check connection string and network access

# Debug steps:
1. Verify MONGODB_URI in .env.local
2. Check MongoDB Atlas network access list
3. Verify database user permissions
4. Test connection with MongoDB Compass
```

#### 2. Authentication Issues

```typescript
// Error: Redirect loop in admin panel
// Cause: Cookie/localStorage mismatch

// Debug:
console.log('Cookie auth:', getCookie('admin_session'))
console.log('Local auth:', localStorage.getItem('admin_session'))

// Solution: Clear all auth data
AdminAuth.logout()
```

#### 3. Build Errors

```bash
# Error: Module not found
# Solution: Check import paths

# Common fixes:
npm install --legacy-peer-deps
rm -rf .next node_modules package-lock.json
npm install
```

#### 4. Performance Issues

```typescript
// Issue: Slow menu loading
// Debug: Add performance monitoring

const start = performance.now()
const data = await fetch('/api/menu')
const end = performance.now()
console.log(`API call took ${end - start}ms`)

// Solutions:
// 1. Add caching headers
// 2. Optimize MongoDB queries
// 3. Implement pagination
// 4. Use virtual scrolling
```

### Debugging Tools

```typescript
// lib/debug.ts
export const DEBUG = {
  api: (endpoint: string, data: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔌 API Call: ${endpoint}`)
      console.log('Data:', data)
      console.log('Timestamp:', new Date().toISOString())
      console.groupEnd()
    }
  },
  
  auth: (action: string, details: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔐 Auth: ${action}`)
      console.log('Details:', details)
      console.groupEnd()
    }
  },
  
  performance: (label: string, fn: () => any) => {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${label}: ${(end - start).toFixed(2)}ms`)
    }
    
    return result
  }
}
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import MenuItem from '@/lib/models/MenuItem'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: 'unknown',
      api: 'healthy',
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  }
  
  try {
    await connectToDatabase()
    await MenuItem.countDocuments()
    checks.checks.database = 'healthy'
  } catch (error) {
    checks.checks.database = 'unhealthy'
    checks.status = 'unhealthy'
  }
  
  const statusCode = checks.status === 'healthy' ? 200 : 503
  
  return NextResponse.json(checks, { status: statusCode })
}
```

---

## 📦 Development Tools

### VSCode Configuration

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### Git Hooks

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run type-check
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Bundle Analyzer

```javascript
// next.config.mjs
import withBundleAnalyzer from '@next/bundle-analyzer'

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

export default bundleAnalyzer({
  // Next.js config
})

// Usage: ANALYZE=true npm run build
```

---

Questa documentazione tecnica fornisce una guida completa per sviluppatori che lavorano sul progetto Tennis Sports Bar, coprendo implementazioni, pattern architetturali, strategie di testing e troubleshooting avanzato. 