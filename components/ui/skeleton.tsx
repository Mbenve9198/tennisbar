import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)}
      {...props}
    />
  )
}

// Skeleton specifico per menu card
function MenuCardSkeleton() {
  return (
    <div className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4">
      {/* Badge skeleton */}
      <Skeleton className="absolute top-2 right-2 h-6 w-16" />
      
      {/* Header */}
      <div className="pb-2">
        {/* Title */}
        <Skeleton className="h-6 w-3/4 mb-2" />
        {/* Type (for beers) */}
        <Skeleton className="h-4 w-1/2 mb-2" />
        {/* Price */}
        <Skeleton className="h-8 w-20" />
      </div>
      
      {/* Description */}
      <div className="pt-2">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

// Skeleton per sezione completa
function MenuSectionSkeleton({ itemCount = 6 }: { itemCount?: number }) {
  return (
    <div className="mb-12">
      {/* Section header */}
      <div className="bg-gray-200 dark:bg-gray-800 p-4 mb-6 rounded-lg">
        <Skeleton className="h-8 w-48" />
      </div>
      
      {/* Description */}
      <Skeleton className="h-5 w-64 mx-auto mb-6" />
      
      {/* Grid of cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: itemCount }).map((_, index) => (
          <MenuCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

// Skeleton per loading completo app
function MenuAppSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Hero Section Skeleton */}
        <div className="text-center py-12 mb-12">
          <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl p-8">
            <Skeleton className="w-32 h-32 rounded-full mx-auto mb-6" />
            <Skeleton className="w-48 h-48 rounded-lg mx-auto mb-6" />
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>

        {/* Menu Sections Skeletons */}
        <MenuSectionSkeleton itemCount={3} /> {/* Hamburger */}
        <MenuSectionSkeleton itemCount={9} /> {/* Food */}
        <MenuSectionSkeleton itemCount={7} /> {/* Drinks */}
        <MenuSectionSkeleton itemCount={4} /> {/* Desserts */}
      </main>

      {/* Bottom Navigation Skeleton */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1 py-2">
              <Skeleton className="w-6 h-6" />
              <Skeleton className="w-12 h-3" />
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}

export { Skeleton, MenuCardSkeleton, MenuSectionSkeleton, MenuAppSkeleton }
