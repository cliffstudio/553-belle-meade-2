'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { usePathname } from 'next/navigation'
import mediaLazyloading from '../utils/lazyLoad'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isIOSDevice } from '../utils/deviceUtils'

const SCROLL_SMOOTHER_DESKTOP_MIN_WIDTH = 768

export default function LazyLoadInitializer() {
  const pathname = usePathname()
  const scrollSmootherRef = useRef<{ kill: () => void } | null>(null)

  useEffect(() => {
    // Initialize lazy loading on mount
    mediaLazyloading()
    
    // Configure ScrollTrigger globally
    if (typeof window !== 'undefined' && ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger)
      ScrollTrigger.config({ ignoreMobileResize: true })
      // Normalize wheel/touch input across devices (helps mobile smoothness)
      ScrollTrigger.normalizeScroll(true)
      
      // ScrollSmoother: only create on non-iOS desktop (same breakpoint as ScrollTrigger)
      const initOrKillScrollSmoother = async () => {
        const shouldUseScrollSmoother =
          window.innerWidth > SCROLL_SMOOTHER_DESKTOP_MIN_WIDTH && !isIOSDevice()
        
        if (scrollSmootherRef.current) {
          scrollSmootherRef.current.kill()
          scrollSmootherRef.current = null
        }
        
        if (!shouldUseScrollSmoother) return
        
        try {
          // Check if ScrollSmoother is available on window (loaded via script tag)
          type WindowWithScrollSmoother = Window & { ScrollSmoother?: unknown }
          let ScrollSmoother: unknown = (window as WindowWithScrollSmoother).ScrollSmoother
          
          // If not on window, try dynamic import using Function to prevent webpack static analysis
          if (!ScrollSmoother) {
            // Use Function constructor to create a dynamic import that webpack won't analyze
            const dynamicImport = new Function('specifier', 'return import(specifier)')
            const scrollSmootherModule = await dynamicImport('gsap/ScrollSmoother')
            ScrollSmoother = scrollSmootherModule.ScrollSmoother || scrollSmootherModule.default
          }
          
          if (ScrollSmoother) {
            gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
            const wrapper = document.querySelector('#smooth-wrapper')
            const content = document.querySelector('#smooth-content')
            if (wrapper && content) {
              const create = (ScrollSmoother as { create: (config: { wrapper: string; content: string; smooth: number; effects: boolean }) => { kill: () => void } }).create
              scrollSmootherRef.current = create({
                wrapper: '#smooth-wrapper',
                content: '#smooth-content',
                smooth: 1,
                effects: true,
              })
            }
          }
        } catch {
          // ScrollSmoother is a GSAP Club plugin; skip if not installed
        }
      }
      initOrKillScrollSmoother()
      
      // Global function to fix video positions that might be affected by ScrollTrigger
      const fixAllVideoPositions = () => {
        const videoWraps = document.querySelectorAll('.fill-space-video-wrap')
        videoWraps.forEach((wrap: Element) => {
          const element = wrap as HTMLElement
          const computedStyle = window.getComputedStyle(element)
          const transform = computedStyle.transform
          
          // Reset transforms that might be causing issues
          if (transform && transform !== 'none' && transform.includes('matrix')) {
            const matrixMatch = transform.match(/matrix\([^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*([^,]+),\s*([^)]+)\)/)
            if (matrixMatch) {
              const translateY = parseFloat(matrixMatch[2])
              // If translateY is greater than 1000px, it's likely an unwanted GSAP transform
              if (Math.abs(translateY) > 1000) {
                element.style.transform = 'none'
              }
            }
          }
          
          // Ensure visibility is not hidden
          if (computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
            element.style.visibility = 'visible'
            element.style.opacity = '1'
          }
        })
      }
      
      // Fix video positions on resize with debounce; also init/kill ScrollSmoother when crossing breakpoint or iOS
      let resizeTimeout: NodeJS.Timeout | null = null
      const handleResize = () => {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout)
        }
        resizeTimeout = setTimeout(() => {
          initOrKillScrollSmoother()
          // Refresh ScrollTrigger first, then fix video positions
          ScrollTrigger.refresh()
          setTimeout(fixAllVideoPositions, 100)
        }, 150)
      }
      window.addEventListener('resize', handleResize)
      
      // Initial fix
      setTimeout(fixAllVideoPositions, 200)
      
      // Cleanup
      return () => {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout)
        }
        window.removeEventListener('resize', handleResize)
        if (scrollSmootherRef.current) {
          scrollSmootherRef.current.kill()
          scrollSmootherRef.current = null
        }
      }
    }
  }, [])

  useEffect(() => {
    // Re-initialize lazy loading when route changes
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      mediaLazyloading()
      
      // Refresh ScrollTrigger after route change to recalculate positions
      // This ensures scroll effects work correctly when navigating from other pages
      if (typeof window !== 'undefined' && ScrollTrigger) {
        // Ensure plugin stays registered and normalization remains active after route changes
        gsap.registerPlugin(ScrollTrigger)
        ScrollTrigger.normalizeScroll(true)
        ScrollTrigger.refresh()
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
