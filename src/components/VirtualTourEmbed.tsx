'use client'

import React, { useEffect, useRef, useState } from 'react'

interface VirtualTourEmbedProps {
  className?: string
}

export default function VirtualTourEmbed({ className }: VirtualTourEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [isScrollEnabled, setIsScrollEnabled] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    const iframe = iframeRef.current

    if (!container || !iframe) return

    let lastScrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
    const SCROLL_THRESHOLD = 50 // pixels
    const POINTER_DISABLE_DURATION = 800 // ms - re-enable after scrolling stops

    const handleWheel = (e: WheelEvent) => {
      if (!container || !iframe) return

      const rect = container.getBoundingClientRect()
      const isNearIframe = 
        e.clientY >= rect.top - SCROLL_THRESHOLD && 
        e.clientY <= rect.bottom + SCROLL_THRESHOLD

      // If scrolling near the iframe area, temporarily disable pointer events
      if (isNearIframe && Math.abs(e.deltaY) > 5) {
        // Immediately disable pointer events to allow page scrolling
        iframe.style.pointerEvents = 'none'
        setIsScrollEnabled(false)

        // Clear any existing timeouts
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current)
        }

        // Check if page is actually scrolling
        const checkScroll = () => {
          const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
          const isScrolling = Math.abs(currentScroll - lastScrollPosition) > 2
          
          if (isScrolling) {
            lastScrollPosition = currentScroll
            // Page is scrolling, keep iframe disabled
            scrollTimerRef.current = setTimeout(checkScroll, 100)
          } else {
            // Scrolling stopped, re-enable iframe after a delay
            scrollTimeoutRef.current = setTimeout(() => {
              if (iframe) {
                iframe.style.pointerEvents = 'auto'
                setIsScrollEnabled(true)
              }
            }, POINTER_DISABLE_DURATION)
          }
        }

        // Start checking scroll position
        lastScrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
        scrollTimerRef.current = setTimeout(checkScroll, 100)
      }
    }

    // Handle touch events for mobile
    let touchStartY = 0

    const handleTouchStart = (e: TouchEvent) => {
      if (!container) return
      const rect = container.getBoundingClientRect()
      const touch = e.touches[0]
      
      if (touch.clientY >= rect.top - SCROLL_THRESHOLD && 
          touch.clientY <= rect.bottom + SCROLL_THRESHOLD) {
        touchStartY = touch.clientY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!container || !iframe || touchStartY === 0) return
      
      const touch = e.touches[0]
      const deltaY = Math.abs(touch.clientY - touchStartY)
      const rect = container.getBoundingClientRect()
      const isNearIframe = 
        touch.clientY >= rect.top - SCROLL_THRESHOLD && 
        touch.clientY <= rect.bottom + SCROLL_THRESHOLD

      if (isNearIframe && deltaY > 10) {
        // Temporarily disable pointer events
        iframe.style.pointerEvents = 'none'
        setIsScrollEnabled(false)

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
      }
    }

    const handleTouchEnd = () => {
      touchStartY = 0
      
      // Re-enable pointer events after touch ends
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        if (iframe) {
          iframe.style.pointerEvents = 'auto'
          setIsScrollEnabled(true)
        }
      }, POINTER_DISABLE_DURATION)
    }

    // Add event listeners
    window.addEventListener('wheel', handleWheel, { passive: true })
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Cleanup
    return () => {
      window.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current)
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      id="virtual-tour" 
      className={`${className}`}
    >
      <iframe 
        ref={iframeRef}
        src="//storage.net-fs.com/hosting/7298008/18/" 
        width="100%"
        height="100%"
        allow="fullscreen; accelerometer; gyroscope; magnetometer; vr; xr; xr-spatial-tracking; autoplay; camera; microphone" 
        allowFullScreen={true}
        style={{
          pointerEvents: isScrollEnabled ? 'auto' : 'none'
        }}
      />
    </div>
  )
}