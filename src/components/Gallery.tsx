'use client'

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from 'react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImage } from '../types/sanity'
import { DisableBodyScroll, EnableBodyScroll } from '../utils/bodyScroll'
import 'flickity/css/flickity.css'

type GalleryProps = {
  images?: {
    image?: SanityImage
    caption?: string
    imageSize?: '16:9' | '1:1' | '4:3' | '2:3' | 'no-defined-size'
  }[]
}

export default function Gallery({ images }: GalleryProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const masonryRef = useRef<{ destroy?: () => void; layout?: () => void } | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const flickityRef = useRef<{ destroy: () => void; select: (index: number) => void; previous: () => void; next: () => void; resize: () => void; reloadCells: () => void; reposition: () => void } | null>(null)
  const carouselCloseWrapRef = useRef<HTMLDivElement>(null)
  const isInitializingRef = useRef(false)
  const [isCarouselOpen, setIsCarouselOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [displayedSlideIndex, setDisplayedSlideIndex] = useState(0)

  const getAspectRatioClass = (imageSize?: string) => {
    switch (imageSize) {
      case '16:9':
        return 'aspect-16-9'
      case '1:1':
        return 'aspect-1-1'
      case '4:3':
        return 'aspect-4-3'
      case '2:3':
        return 'aspect-2-3'
      case 'no-defined-size':
        return 'natural-aspect-ratio'
      default:
        return 'aspect-16-9'
    }
  }

  const openCarousel = (index: number) => {
    setSelectedIndex(index)
    setCurrentSlideIndex(index)
    setDisplayedSlideIndex(index)
    setIsClosing(false)
    setIsCarouselOpen(true)
    DisableBodyScroll()
  }

  const closeCarousel = () => {
    setIsClosing(true)
    EnableBodyScroll()
    // Wait for closing animation to complete before removing from DOM
    // Inner-wrap: 0.4s, then overlay: 0.3s starting at 0.4s = 0.7s total
    setTimeout(() => {
      setIsCarouselOpen(false)
      setIsClosing(false)
      if (flickityRef.current) {
        flickityRef.current.destroy()
        flickityRef.current = null
      }
    }, 700) // Match total animation duration (0.4s inner-wrap + 0.3s overlay = 700ms)
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (flickityRef.current) {
      flickityRef.current.previous()
    }
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (flickityRef.current) {
      flickityRef.current.next()
    }
  }

  const initCarousel = useCallback(async (preserveIndex = true) => {
    if (!carouselRef.current || isInitializingRef.current) return
    
    isInitializingRef.current = true

    // Destroy existing Flickity instance if it exists
    if (flickityRef.current) {
      flickityRef.current.destroy()
      flickityRef.current = null
    }

    // Dynamically import Flickity to avoid SSR issues
    const Flickity = (await import('flickity')).default

    const indexToUse = preserveIndex ? selectedIndex : currentSlideIndex

    // Verify all cells exist before initializing
    const cells = carouselRef.current.querySelectorAll('.carousel-cell')
    
    if (cells.length === 0) {
      return
    }

    // Simple Flickity initialization - let it handle everything
    flickityRef.current = new Flickity(carouselRef.current, {
      initialIndex: indexToUse,
      wrapAround: true,
      pageDots: false,
      prevNextButtons: false,
      autoPlay: false,
      cellAlign: 'center',
      contain: false, // Changed to false - might be causing issues
      adaptiveHeight: true,
      draggable: true,
      imagesLoaded: true, // Wait for images to load
      on: {
        ready: () => {
          isInitializingRef.current = false
          // Reload cells to ensure all are detected after images load
          if (flickityRef.current) {
            // Small delay to ensure all images are loaded
            setTimeout(() => {
              if (flickityRef.current) {
                flickityRef.current.reloadCells()
              }
            }, 100)
          }
        },
        change: (index: number) => {
          setCurrentSlideIndex(index)
          setDisplayedSlideIndex(index)
        }
      }
    })

    // Handle escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCarousel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally omit currentSlideIndex to avoid re-init on every slide change
  }, [selectedIndex])

  useEffect(() => {
    if (!images || images.length === 0) return

    // Only run on client side
    if (typeof window === 'undefined') return

    // Dynamically import masonry to avoid SSR issues
    const initMasonry = async () => {
      const Masonry = (await import('masonry-layout')).default
      
      if (gridRef.current && !masonryRef.current) {
        // Get responsive gutter size
        const getGutterSize = () => {
          if (window.innerWidth > 1440) return 150
          if (window.innerWidth > 768) return 100
          // For mobile devices, check if it's landscape orientation
          // Landscape mobile devices should use tablet layout (100px gutter)
          if (window.innerWidth <= 768 && window.innerHeight < window.innerWidth) {
            return 100
          }
          return 75
        }

        // Initialize masonry
        masonryRef.current = new Masonry(gridRef.current, {
          itemSelector: '.gallery-item',
          columnWidth: '.gallery-item',
          percentPosition: true,
          gutter: getGutterSize()
        })

        // Handle window resize
        const handleResize = () => {
          if (masonryRef.current) {
            // Recreate masonry with new gutter size
            masonryRef.current.destroy?.()
            masonryRef.current = null
            masonryRef.current = new Masonry(gridRef.current!, {
              itemSelector: '.gallery-item',
              columnWidth: '.gallery-item',
              percentPosition: true,
              gutter: getGutterSize()
            })
          }
        }

        window.addEventListener('resize', handleResize)

        // Cleanup function
        return () => {
          window.removeEventListener('resize', handleResize)
          if (masonryRef.current) {
            masonryRef.current.destroy?.()
            masonryRef.current = null
          }
        }
      }
    }

    initMasonry()
  }, [images])

  // Re-layout masonry when images load
  useEffect(() => {
    if (!images || images.length === 0) return
    if (typeof window === 'undefined') return

    const handleImageLoad = () => {
      if (masonryRef.current) {
        masonryRef.current.layout?.()
      }
    }

    // Listen for image load events
    const imageElements = gridRef.current?.querySelectorAll('img')
    imageElements?.forEach(img => {
      img.addEventListener('load', handleImageLoad)
    })

    return () => {
      imageElements?.forEach(img => {
        img.removeEventListener('load', handleImageLoad)
      })
    }
  }, [images])

  // Set carousel-close-wrap height to match site-header
  useEffect(() => {
    if (!isCarouselOpen || typeof window === 'undefined') return

    const updateCarouselCloseWrapHeight = () => {
      const siteHeader = document.querySelector('.site-header') as HTMLElement
      const carouselCloseWrap = carouselCloseWrapRef.current

      if (siteHeader && carouselCloseWrap) {
        const headerHeight = siteHeader.offsetHeight
        carouselCloseWrap.style.height = `${headerHeight}px`
      }
    }

    // Set initial height
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      updateCarouselCloseWrapHeight()
    })

    // Update on resize
    window.addEventListener('resize', updateCarouselCloseWrapHeight)

    return () => {
      window.removeEventListener('resize', updateCarouselCloseWrapHeight)
    }
  }, [isCarouselOpen])

  // Initialize carousel when opened - only once
  useEffect(() => {
    if (isCarouselOpen && !flickityRef.current && !isInitializingRef.current) {
      // Wait for DOM to be ready and all cells to be rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (carouselRef.current && !flickityRef.current) {
            initCarousel()
          }
        })
      })
    }
    
    // Reset initialization flag when carousel closes
    if (!isCarouselOpen) {
      isInitializingRef.current = false
    }
  }, [isCarouselOpen, initCarousel])

  // Handle window resize to recalculate carousel layout
  useEffect(() => {
    if (!isCarouselOpen || typeof window === 'undefined') return

    let resizeTimeout: NodeJS.Timeout | null = null
    let resizeObserver: ResizeObserver | null = null

    const recalculateCarousel = () => {
      if (!flickityRef.current || !carouselRef.current) return

      const container = carouselRef.current
      const viewport = container.querySelector<HTMLElement>('.flickity-viewport')
      
      // Clear Flickity's inline height style to force recalculation
      if (viewport) {
        viewport.style.removeProperty('height')
      }

      // Force container reflow
      void container.offsetHeight

      // Use requestAnimationFrame to ensure layout has settled
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (flickityRef.current && container) {
            // Reload cells first - this recalculates cell dimensions
            flickityRef.current.reloadCells()
            
            // Force a reflow
            void container.offsetHeight
            
            // Clear viewport height again to ensure it's not set
            if (viewport) {
              viewport.style.removeProperty('height')
            }
            
            // Resize the carousel - this should recalculate viewport height
            // But we need to ensure it uses the container height, not a fixed value
            flickityRef.current.resize()
            
            // After resize, check if viewport height is still wrong and fix it
            requestAnimationFrame(() => {
              if (viewport && container) {
                const containerHeight = container.offsetHeight
                const viewportHeight = parseInt(viewport.style.height || '0', 10)
                
                // If viewport height doesn't match container, force it
                if (viewportHeight > 0 && Math.abs(viewportHeight - containerHeight) > 10) {
                  viewport.style.height = `${containerHeight}px`
                  // Trigger another resize to ensure everything is aligned
                  if (flickityRef.current) {
                    flickityRef.current.resize()
                    flickityRef.current.reposition()
                  }
                }
              }
            })
          }
        })
      })
    }

    const handleResize = () => {
      // Debounce resize calls to avoid excessive recalculations
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }

      resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth
        const newHeight = window.innerHeight
        
        // Check if this is a significant size change
        const widthChange = Math.abs(newWidth - previousWidth) / previousWidth
        const heightChange = Math.abs(newHeight - previousHeight) / previousHeight
        
        if (widthChange > 0.3 || heightChange > 0.3) {
          // Major size change - recreate Flickity
          initCarousel(true).then(() => {
            previousWidth = newWidth
            previousHeight = newHeight
          })
        } else {
          // Minor change - just recalculate
          recalculateCarousel()
          previousWidth = newWidth
          previousHeight = newHeight
        }
      }, 150) // Small delay to batch rapid resize events
    }

    // Track previous dimensions to detect major changes
    let previousWidth = window.innerWidth
    let previousHeight = window.innerHeight

    // Handle orientation change with proper timing
    const handleOrientationChange = () => {
      // Longer delay to let browser finish orientation change and CSS recalculation
      setTimeout(() => {
        const newWidth = window.innerWidth
        const newHeight = window.innerHeight
        
        // If dimensions changed significantly, recreate Flickity
        const widthChange = Math.abs(newWidth - previousWidth) / previousWidth
        const heightChange = Math.abs(newHeight - previousHeight) / previousHeight
        
        if (widthChange > 0.2 || heightChange > 0.2) {
          // Major size change - recreate Flickity
          initCarousel(true).then(() => {
            previousWidth = newWidth
            previousHeight = newHeight
          })
        } else {
          // Minor change - just recalculate
          recalculateCarousel()
        }
      }, 500) // Longer delay for orientation changes to ensure CSS has recalculated
    }

    // Use ResizeObserver to watch multiple containers for size changes
    const setupResizeObserver = () => {
      if (typeof ResizeObserver === 'undefined') return
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ResizeObserver callback requires first param
      resizeObserver = new ResizeObserver((entries) => {
        // Debounce the resize observer callback
        if (resizeTimeout) {
          clearTimeout(resizeTimeout)
        }
        resizeTimeout = setTimeout(() => {
          recalculateCarousel()
        }, 50) // Shorter delay for ResizeObserver since it's more accurate
      })
      
      // Watch the overlay, inner-wrap, and carousel container
      const overlay = document.querySelector('.carousel-overlay')
      const innerWrap = document.querySelector('.inner-wrap')
      const container = document.querySelector('.carousel-container') || carouselRef.current
      
      if (overlay) resizeObserver.observe(overlay)
      if (innerWrap) resizeObserver.observe(innerWrap)
      if (container) resizeObserver.observe(container)
    }

    // Set up ResizeObserver after a short delay to ensure DOM is ready
    setTimeout(setupResizeObserver, 200)

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    
    // Also listen for visual viewport resize (for mobile browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    }

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
    }
  }, [isCarouselOpen, initCarousel])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flickityRef.current) {
        flickityRef.current.destroy()
      }
      EnableBodyScroll()
    }
  }, [])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <>
      <h1 className="sr-only">Gallery</h1>

      <section className="gallery-block">
        <div ref={gridRef} className="gallery-grid out-of-opacity">
          {images.map((item, index) => {
            if (!item.image?.asset) return null

            return (
              <div key={index} className="gallery-item">
                <div 
                  className={`gallery-image ${getAspectRatioClass(item.imageSize)}`}
                  onClick={() => openCarousel(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="fill-space-image-wrap">
                    <img
                      data-src={urlFor(item.image).url()}
                      alt={item.image?.alt ?? ''}
                      className="lazy full-bleed-image"
                      style={{
                        objectPosition: item.image?.hotspot
                          ? `${item.image.hotspot.x * 100}% ${item.image.hotspot.y * 100}%`
                          : "center",
                      }}
                    />
                    <div className="loading-overlay" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Carousel overlay */}
      {isCarouselOpen && (
        <div className={`carousel-overlay ${isClosing ? 'closing' : ''}`}>
          <div className="inner-wrap">
            <div className="carousel-container" onClick={(e) => e.stopPropagation()}>
              <div ref={carouselCloseWrapRef} className="carousel-close-wrap">
                <button 
                  className="carousel-close desktop" 
                  onClick={closeCarousel}
                  aria-label="Close carousel"
                >
                  Close
                </button>

                <button 
                  className="carousel-close mobile" 
                  onClick={closeCarousel}
                  aria-label="Close carousel"
                >
                  <div className="menu-bar" data-position="top"></div>
                  <div className="menu-bar" data-position="bottom"></div>
                </button>
              </div>

              <div ref={carouselRef} className="carousel">
                {images.map((item, index) => {
                  if (!item.image?.asset) return null

                  return (
                    <div key={index} className="carousel-cell">
                      <div className="carousel-image">
                        <img
                          src={urlFor(item.image).width(1200).url()}
                          alt={item.image?.alt ?? item.caption ?? ''}
                          className="carousel-img"
                          style={{
                            objectPosition: item.image?.hotspot
                              ? `${item.image.hotspot.x * 100}% ${item.image.hotspot.y * 100}%`
                              : "center",
                          }}
                          onLoad={() => {
                            // Force Flickity to recalculate after image loads
                            if (flickityRef.current) {
                              requestAnimationFrame(() => {
                                if (flickityRef.current) {
                                  flickityRef.current.resize()
                                  flickityRef.current.reposition()
                                }
                              })
                            }
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Custom navigation arrows - outside carousel-container to avoid overflow clipping */}
            {images.length > 1 && (
              <div className="carousel-arrows" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="left-arrow" 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handlePrevious(e)
                  }} 
                  type="button" 
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="27" height="52" viewBox="0 0 27 52" fill="none">
                    <path d="M26 51L1 26L26 0.999998" stroke="#581B25"/>
                  </svg>
                </button>

                <button 
                  className="right-arrow" 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleNext(e)
                  }} 
                  type="button" 
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="27" height="52" viewBox="0 0 27 52" fill="none">
                    <path d="M1 1L26 26L1 51" stroke="#581B25"/>
                  </svg>
                </button>
              </div>
            )}
            
            {/* Dynamic caption outside carousel container */}
            {images[displayedSlideIndex]?.caption && (
              <div className="carousel-caption">
                {images[displayedSlideIndex].caption}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
