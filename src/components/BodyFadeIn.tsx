'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef } from 'react'

export default function BodyFadeIn() {
  const pathname = usePathname()
  const isInitialMount = useRef(true)

  // Fade out on route change and ensure new route starts at opacity 0 (useLayoutEffect runs synchronously before paint)
  useLayoutEffect(() => {
    if (typeof document !== 'undefined') {
      if (!isInitialMount.current) {
        // Route change - immediately set opacity to 0 without transition to hide new content
        // This prevents flash of new content
        document.body.style.transition = 'none'
        document.body.style.opacity = '0'
      } else {
        // Initial mount - ensure body starts at opacity 0
        document.body.style.opacity = '0'
        document.body.style.transition = 'none'
      }
    }
  }, [pathname])

  // Fade in after route change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const fadeIn = () => {
        // Set transition with delay for fade-in
        document.body.style.transition = 'opacity 300ms cubic-bezier(0.25,0.1,0.25,1)'
        // Use requestAnimationFrame to ensure transition is applied before changing opacity
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            document.body.style.opacity = '1'
          })
        })
      }

      if (isInitialMount.current) {
        // Initial load - fade in after a brief delay
        const timeoutId = setTimeout(fadeIn, 50)
        isInitialMount.current = false
        return () => clearTimeout(timeoutId)
      } else {
        // Route change - wait a brief moment for DOM to update, then fade in
        // The 500ms delay in the transition handles the main timing
        const timeoutId = setTimeout(fadeIn, 50)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [pathname])

  return null
}

