/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { PortableText } from '@portabletext/react'
import { PortableTextBlock, SanityImage } from '../types/sanity'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { fileUrlFor, SanityFile } from '../sanity/utils/fileUrlBuilder'
import { portableTextComponents } from '../utils/portableTextComponents'
import Link from 'next/link'

interface ClickableSpot {
  id: string
  title: string
  description?: PortableTextBlock[]
  position: {
    top: string // percentage or pixel value
    left: string // percentage or pixel value
  }
  hoverImage?: string // optional image to show on hover
  // mobileHoverImage?: string
  // mobilePosition?: {
  //   top: string
  //   left: string
  // }
  popupContent: {
    title: string
    description?: PortableTextBlock[]
    image?: string
    imageAlt?: string
    // mobileImage?: string
    details?: string[]
  }
}

interface Position {
  top: string
  left: string
}

interface CMSSpot {
  id: string
  title: string
  description?: PortableTextBlock[]
  image?: SanityImage
  desktopMarkerImage?: SanityImage
  // mobileMarkerImage?: SanityImage
  desktopPosition: Position
  // mobilePosition?: Position
}

interface Floor {
  label: string
  mobileLabel: string
  desktopImage: SanityImage
  // mobileImage?: SanityImage
  desktopSpacesOverlayImage?: SanityFile
  // mobileSpacesOverlayImage?: SanityFile
  spots?: CMSSpot[]
  imageAlt?: string
}

type FloorView = {
  id: string
  label: string
  mobileLabel: string
  image: string
  desktopSpacesOverlayImage?: SanityFile
  spots?: ClickableSpot[]
  imageAlt?: string
}

interface LeasingMapProps {
  heading?: string
  body?: PortableTextBlock[]
  floors?: Floor[]
  cta?: {
    linkType?: 'internal' | 'external'
    label?: string
    href?: string
    pageLink?: { _ref: string; _type: 'reference'; slug?: string; title?: string }
  }
}

export default function LeasingMap({ 
  floors: cmsFloors
}: LeasingMapProps) {
  const [activeTab, setActiveTab] = useState<string>('floor-1')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const justDraggedRef = useRef(false)
  const hasDraggedRef = useRef(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Constrain pan values to keep content within bounds
  const constrainPan = React.useCallback((x: number, y: number, zoom: number): { x: number; y: number } => {
    if (zoom <= 1) return { x: 0, y: 0 }
    
    if (!panelRef.current) return { x, y }
    
    const container = panelRef.current
    const containerWidth = container.offsetWidth
    const containerHeight = container.offsetHeight
    
    // Get the image dimensions (assuming images fill the container)
    const imageWidth = containerWidth
    const imageHeight = containerHeight
    
    // Calculate scaled dimensions
    const scaledWidth = imageWidth * zoom
    const scaledHeight = imageHeight * zoom
    
    // Calculate maximum pan distance
    // When zoomed, we can pan up to half the difference between scaled and container size
    const maxPanX = (scaledWidth - containerWidth) / 2
    const maxPanY = (scaledHeight - containerHeight) / 2
    
    // Constrain the pan values
    const constrainedX = Math.max(-maxPanX, Math.min(maxPanX, x))
    const constrainedY = Math.max(-maxPanY, Math.min(maxPanY, y))
    
    return { x: constrainedX, y: constrainedY }
  }, [])
  const [selectedSpot, setSelectedSpot] = useState<ClickableSpot | null>(null)
  const [displaySpot, setDisplaySpot] = useState<ClickableSpot | null>(null)
  const [, setCurrentBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const mediaWrapRef = useRef<HTMLDivElement>(null)

  // Detect current breakpoint
  React.useEffect(() => {
    const updateBreakpoint = () => {
      const isLandscape = window.innerWidth > window.innerHeight
      
      if (window.innerWidth <= 767) {
        setCurrentBreakpoint('mobile')
      } else if (window.innerWidth <= 1366 || isLandscape) {
        setCurrentBreakpoint('tablet')
      } else {
        setCurrentBreakpoint('desktop')
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    window.addEventListener('orientationchange', updateBreakpoint)
    return () => {
      window.removeEventListener('resize', updateBreakpoint)
      window.removeEventListener('orientationchange', updateBreakpoint)
    }
  }, [])

  // Update displaySpot with delay to keep content visible during fade-out
  React.useEffect(() => {
    if (selectedSpot) {
      // Immediately show new content
      setDisplaySpot(selectedSpot)
    } else {
      // Delay clearing content to allow fade-out animation (400ms in CSS)
      const timeout = setTimeout(() => {
        setDisplaySpot(null)
      }, 400)
      return () => clearTimeout(timeout)
    }
  }, [selectedSpot])

  // Default floors if no CMS data is provided
  const defaultFloors: FloorView[] = [
    { 
      id: 'floor-1', 
      label: 'First Floor', 
      mobileLabel: 'Floor 1',
      image: '/images/map-floor-1.jpg',
      // mobileImage: '/images/map-floor-1.jpg',
      spots: []
    },
    { 
      id: 'floor-2', 
      label: 'Second Floor', 
      mobileLabel: 'Floor 2',
      image: '/images/map-floor-2.jpg',
      // mobileImage: '/images/map-floor-2.jpg',
      spots: []
    },
    { 
      id: 'floor-3', 
      label: 'Third Floor', 
      mobileLabel: 'Floor 3',
      image: '/images/map-floor-3.jpg',
      // mobileImage: '/images/map-floor-3.jpg',
      spots: []
    }
  ]

  // Helper function to normalize IDs (convert spaces to underscores, handle special chars)
  const normalizeId = (id: string): string => {
    return id
      .trim()
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9_]/g, '') // Remove special characters except underscores
  }

  // Transform CMS floors to component format
  const floors: FloorView[] = cmsFloors && cmsFloors.length > 0
    ? cmsFloors.map((floor, index) => {
        // Generate image URLs with fallbacks
        if (!floor.desktopImage) {
          // If no desktop image, return default floor if available
          return defaultFloors[index] || defaultFloors[0]
        }

        const desktopImageUrl = urlFor(floor.desktopImage).width(2000).url() || ''
        // const mobileImageUrl = floor.mobileImage 
        //   ? urlFor(floor.mobileImage).width(800).url() || desktopImageUrl
        //   : desktopImageUrl

        // Transform CMS spots into component format
        const transformedSpots = floor.spots?.map((spot, spotIndex) => {
          const desktopMarkerUrl = spot.desktopMarkerImage 
            ? urlFor(spot.desktopMarkerImage).width(2000).url() || ''
            : ''
          // const mobileMarkerUrl = spot.mobileMarkerImage 
          //   ? urlFor(spot.mobileMarkerImage).width(800).url() || desktopMarkerUrl
          //   : desktopMarkerUrl

          // Use the spot image field for popup, with fallback to marker images
          const popupImageUrl = spot.image
            ? urlFor(spot.image).width(2000).url() || ''
            : desktopMarkerUrl
          // const popupMobileImageUrl = spot.image
          //   ? urlFor(spot.image).width(800).url() || popupImageUrl
          //   : mobileMarkerUrl

          const normalizedId = spot.id ? normalizeId(spot.id) : `floor-${index + 1}-spot-${spotIndex + 1}`
          const floorId = `floor-${index + 1}`
          const compositeId = `${floorId}|${normalizedId}`

          return {
            id: compositeId,
            title: spot.title,
            description: spot.description,
            position: spot.desktopPosition,
            // mobilePosition: spot.mobilePosition || spot.desktopPosition,
            hoverImage: desktopMarkerUrl,
            // mobileHoverImage: mobileMarkerUrl,
            popupContent: {
              title: spot.title,
              description: spot.description,
              image: popupImageUrl,
              imageAlt: spot.image?.alt ?? spot.title ?? '',
              // mobileImage: popupMobileImageUrl,
            }
          }
        }) || []

        return {
          id: `floor-${index + 1}`,
          label: floor.label,
          mobileLabel: floor.mobileLabel,
          image: desktopImageUrl,
          imageAlt: floor.desktopImage?.alt ?? '',
          // mobileImage: mobileImageUrl,
          desktopSpacesOverlayImage: floor.desktopSpacesOverlayImage,
          // mobileSpacesOverlayImage: floor.mobileSpacesOverlayImage,
          spots: transformedSpots
        }
      })
    : defaultFloors

  // Create a lookup map for spots by floor|spot ID (spot.id is already composite so same space name on different floors shows correct content)
  const spotsById = React.useMemo(() => {
    const lookup: { [key: string]: ClickableSpot } = {}
    floors.forEach((floor) => {
      if (floor.spots) {
        floor.spots.forEach((spot) => {
          lookup[spot.id] = spot
        })
      }
    })
    return lookup
  }, [floors])

  // Preload all floor images to prevent flashing when switching tabs
  React.useEffect(() => {
    const imagesToPreload: string[] = []
    
    floors.forEach((floor) => {
      if (floor.image) imagesToPreload.push(floor.image)
      // if (floor.mobileImage) imagesToPreload.push(floor.mobileImage)
    })

    imagesToPreload.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [floors])

  const handleImageLoad = (floorId: string) => {
      setLoadedImages(prev => {
        const newSet = new Set(prev)
        newSet.add(floorId)
        return newSet
      })
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2))
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.25, 1)
    setZoomLevel(newZoom)
    // Reset pan when zooming back to 1
    if (newZoom === 1) {
      setPanX(0)
      setPanY(0)
    }
  }

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return
    // Don't start dragging if clicking directly on a clickable spot (use activeTab so we match spot on current floor)
    const target = e.target as Element
    let current: Element | null = target
    while (current && current !== e.currentTarget) {
      const id = current.getAttribute('id')
      if (id && (spotsById[`${activeTab}|${id}`] || spotsById[`${activeTab}|${normalizeId(id)}`])) {
        return
      }
      current = current.parentElement
    }
    e.preventDefault()
    setIsDragging(true)
    hasDraggedRef.current = false
    dragStartRef.current = {
      x: e.clientX - panX,
      y: e.clientY - panY
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return
    e.preventDefault()
    const deltaX = e.clientX - dragStartRef.current.x
    const deltaY = e.clientY - dragStartRef.current.y
    // Only consider it a drag if moved more than 5px
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasDraggedRef.current = true
    }
    const constrained = constrainPan(deltaX, deltaY, zoomLevel)
    setPanX(constrained.x)
    setPanY(constrained.y)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging && hasDraggedRef.current) {
      // Prevent click events if we dragged
      e.preventDefault()
      e.stopPropagation()
      justDraggedRef.current = true
      // Clear the flag after a short delay to allow normal clicks again
      setTimeout(() => {
        justDraggedRef.current = false
      }, 100)
    }
    setIsDragging(false)
    hasDraggedRef.current = false
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel <= 1) return
    if (e.touches.length === 1) {
      // Don't start dragging if touching directly on a clickable spot
      const target = e.target as Element
      let current: Element | null = target
      while (current && current !== e.currentTarget) {
        const id = current.getAttribute('id')
        if (id && (spotsById[`${activeTab}|${id}`] || spotsById[`${activeTab}|${normalizeId(id)}`])) {
          return
        }
        current = current.parentElement
      }
      e.preventDefault()
      setIsDragging(true)
      hasDraggedRef.current = false
      dragStartRef.current = {
        x: e.touches[0].clientX - panX,
        y: e.touches[0].clientY - panY
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoomLevel <= 1 || e.touches.length !== 1) return
    e.preventDefault()
    const deltaX = e.touches[0].clientX - dragStartRef.current.x
    const deltaY = e.touches[0].clientY - dragStartRef.current.y
    // Only consider it a drag if moved more than 5px
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasDraggedRef.current = true
    }
    const constrained = constrainPan(deltaX, deltaY, zoomLevel)
    setPanX(constrained.x)
    setPanY(constrained.y)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDragging && hasDraggedRef.current) {
      // Prevent click events if we dragged
      e.preventDefault()
      e.stopPropagation()
      justDraggedRef.current = true
      // Clear the flag after a short delay to allow normal clicks again
      setTimeout(() => {
        justDraggedRef.current = false
      }, 100)
    }
    setIsDragging(false)
    hasDraggedRef.current = false
  }

  // Reset pan when zoom resets to 1, and constrain pan when zoom changes
  React.useEffect(() => {
    if (zoomLevel === 1) {
      setPanX(0)
      setPanY(0)
    } else {
      // Constrain existing pan values when zoom changes using functional updates
      setPanX(prevX => {
        let constrainedX = prevX
        setPanY(prevY => {
          const constrained = constrainPan(prevX, prevY, zoomLevel)
          constrainedX = constrained.x
          return constrained.y
        })
        return constrainedX
      })
    }
  }, [zoomLevel, constrainPan])

  // Add global mouse/touch event listeners for dragging
  React.useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (zoomLevel <= 1) return
      const deltaX = e.clientX - dragStartRef.current.x
      const deltaY = e.clientY - dragStartRef.current.y
      // Only consider it a drag if moved more than 5px
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasDraggedRef.current = true
      }
      const constrained = constrainPan(deltaX, deltaY, zoomLevel)
      setPanX(constrained.x)
      setPanY(constrained.y)
    }

    const handleGlobalMouseUp = () => {
      if (hasDraggedRef.current) {
        justDraggedRef.current = true
        setTimeout(() => {
          justDraggedRef.current = false
        }, 100)
      }
      setIsDragging(false)
      hasDraggedRef.current = false
    }

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (zoomLevel <= 1 || e.touches.length !== 1) return
      e.preventDefault()
      const deltaX = e.touches[0].clientX - dragStartRef.current.x
      const deltaY = e.touches[0].clientY - dragStartRef.current.y
      // Only consider it a drag if moved more than 5px
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasDraggedRef.current = true
      }
      const constrained = constrainPan(deltaX, deltaY, zoomLevel)
      setPanX(constrained.x)
      setPanY(constrained.y)
    }

    const handleGlobalTouchEnd = () => {
      if (hasDraggedRef.current) {
        justDraggedRef.current = true
        setTimeout(() => {
          justDraggedRef.current = false
        }, 100)
      }
      setIsDragging(false)
      hasDraggedRef.current = false
    }

    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
    window.addEventListener('touchend', handleGlobalTouchEnd)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('touchmove', handleGlobalTouchMove)
      window.removeEventListener('touchend', handleGlobalTouchEnd)
    }
  }, [isDragging, zoomLevel, constrainPan])

  const handleSpotClick = React.useCallback((spot: ClickableSpot) => {
    setSelectedSpot(spot)
  }, [])

  const closePopup = () => {
    setSelectedSpot(null)
  }

  // Component to render inline SVG overlay (floorId used to look up spot so same space name on different floors shows correct content)
  const SvgOverlay = ({ svgFile, className, activeSpotId, floorId }: { svgFile?: SanityFile; className?: string; activeSpotId?: string | null; floorId?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [svgContent, setSvgContent] = useState<string | null>(null)
    const activeSpotIdRef = useRef<string | null>(null)

    // Fetch SVG when component mounts and svgFile is available
    useEffect(() => {
      if (!svgFile) {
        return
      }

      const svgUrl = fileUrlFor(svgFile)
      
      if (!svgUrl) {
        console.warn('No SVG URL generated for overlay file', svgFile)
        return
      }


      // Fetch the SVG file and inject it inline
      fetch(svgUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch SVG: ${response.statusText}`)
          }
          return response.text()
        })
        .then((text) => {
          setSvgContent(text)
        })
        .catch((err) => {
          console.error('Error loading SVG overlay:', err)
        })
    }, [svgFile])

    // Inject SVG into DOM when content is loaded and add click handlers
    useEffect(() => {
      if (!svgContent || !containerRef.current) {
        return
      }

      // Parse and inject the SVG inline
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
      const svgElement = svgDoc.documentElement

      // Check for parsing errors
      const parserError = svgDoc.querySelector('parsererror')
      if (parserError) {
        console.error('SVG parsing error:', parserError.textContent)
        return
      }

      // Set SVG attributes to scale like the image (cover behavior)
      svgElement.setAttribute('width', '100%')
      svgElement.setAttribute('height', '100%')
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid slice')

      // Clear container and inject the SVG
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(svgElement)

      // Helper function to find a matching spot ID and element by traversing up the DOM tree (uses floorId so correct floor's content is shown)
      const findSpotIdAndElement = (element: Element | null): { spotId: string | null; element: Element | null } => {
        if (!floorId) return { spotId: null, element: null }
        let current: Element | null = element
        while (current && current !== svgElement) {
          const id = current.getAttribute('id')
          if (id) {
            const normalizedId = normalizeId(id)
            const compositeByRaw = `${floorId}|${id}`
            const compositeByNormalized = `${floorId}|${normalizedId}`
            if (spotsById[compositeByRaw]) {
              return { spotId: compositeByRaw, element: current }
            }
            if (spotsById[compositeByNormalized]) {
              return { spotId: compositeByNormalized, element: current }
            }
          }
          current = current.parentElement
        }
        return { spotId: null, element: null }
      }

      // Add a single click handler to the SVG root (event delegation)
      const svgClickHandler = (e: Event) => {
        // Prevent clicks immediately after dragging
        if (justDraggedRef.current) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
        
        const target = e.target as Element
        if (!target) return
        
        const { spotId, element: clickedElement } = findSpotIdAndElement(target)
        
        if (spotId && clickedElement) {
          e.stopPropagation()
          const spot = spotsById[spotId]
          if (spot) {
            // Query from the actual DOM container, not the parsed SVG element
            // This ensures we're working with the actual DOM elements
            const container = containerRef.current
            if (!container) {
              handleSpotClick(spot)
              return
            }
            
            // Remove 'active' class from all elements first
            const allElements = container.querySelectorAll('[id]')
            allElements.forEach((element) => {
              element.classList.remove('active')
              // Also remove from children
              element.querySelectorAll('*').forEach((child) => {
                child.classList.remove('active')
              })
            })
            
            // Use clickedElement directly - it should already be the element with the matching ID
            // But also try to find it by ID from the actual DOM to ensure we have the correct element
            const clickedElementId = clickedElement.getAttribute('id')
            let targetElement: Element | null = clickedElement // Start with clickedElement
            
            // Try to find the element by ID from the actual DOM (spotId may be composite "floorId|spotId", SVG ids are just the spot part)
            const spotIdForDom = spotId.includes('|') ? spotId.split('|')[1] : spotId
            if (clickedElementId) {
              const foundById = container.querySelector(`#${CSS.escape(clickedElementId)}`)
              if (foundById) {
                targetElement = foundById
              } else {
                const foundBySpotId = container.querySelector(`#${CSS.escape(spotIdForDom)}`)
                if (foundBySpotId) {
                  targetElement = foundBySpotId
                }
              }
            } else {
              const foundBySpotId = container.querySelector(`#${CSS.escape(spotIdForDom)}`)
              if (foundBySpotId) {
                targetElement = foundBySpotId
              }
            }
            
            // Add 'active' class to the element
            if (targetElement) {
              // Store the active spot ID
              activeSpotIdRef.current = spotId
              
              // Use both classList and setAttribute to ensure the class is added
              targetElement.classList.add('active')
              const currentClass = targetElement.getAttribute('class') || ''
              if (!currentClass.includes('active')) {
                targetElement.setAttribute('class', currentClass ? `${currentClass} active` : 'active')
              }
              
              // Also add to all children
              targetElement.querySelectorAll('*').forEach((child) => {
                child.classList.add('active')
                const childClass = child.getAttribute('class') || ''
                if (!childClass.includes('active')) {
                  child.setAttribute('class', childClass ? `${childClass} active` : 'active')
                }
              })
            }
            
            handleSpotClick(spot)
          }
        }
      }
      
      svgElement.addEventListener('click', svgClickHandler)
      
      // Make all elements with matching IDs show pointer cursor and ensure they're clickable
      const makeClickable = (element: Element) => {
        const elementId = element.getAttribute('id')
        if (elementId && floorId) {
          const normalizedId = normalizeId(elementId)
          const isClickable = spotsById[`${floorId}|${elementId}`] || spotsById[`${floorId}|${normalizedId}`]
          
          if (isClickable) {
            const currentStyle = element.getAttribute('style') || ''
            let newStyle = currentStyle
            if (!currentStyle.includes('cursor')) {
              newStyle = `${newStyle} cursor: pointer;`.trim()
            }
            // Always set pointer-events: auto for clickable elements
            if (!currentStyle.includes('pointer-events')) {
              newStyle = `${newStyle} pointer-events: auto;`.trim()
            } else if (!currentStyle.includes('pointer-events: auto')) {
              // Replace any existing pointer-events with auto
              newStyle = newStyle.replace(/pointer-events:\s*[^;]+;?/g, 'pointer-events: auto;')
            }
            element.setAttribute('style', newStyle)
          }
        }
        
        // Recursively process children
        Array.from(element.children).forEach((child) => {
          makeClickable(child)
        })
      }
      
      makeClickable(svgElement)
      
      // Also ensure child elements (like paths) inherit pointer-events from parent groups
      const ensureChildrenClickable = (element: Element) => {
        const elementId = element.getAttribute('id')
        if (elementId && floorId) {
          const normalizedId = normalizeId(elementId)
          const isClickable = spotsById[`${floorId}|${elementId}`] || spotsById[`${floorId}|${normalizedId}`]
          
          if (isClickable) {
            // Make all children clickable too
            Array.from(element.children).forEach((child) => {
              const currentStyle = child.getAttribute('style') || ''
              let newStyle = currentStyle
              if (!currentStyle.includes('pointer-events')) {
                newStyle = `${newStyle} pointer-events: auto;`.trim()
              } else if (!currentStyle.includes('pointer-events: auto')) {
                // Replace any existing pointer-events with auto
                newStyle = newStyle.replace(/pointer-events:\s*[^;]+;?/g, 'pointer-events: auto;')
              }
              if (!currentStyle.includes('cursor')) {
                newStyle = `${newStyle} cursor: pointer;`.trim()
              }
              child.setAttribute('style', newStyle)
              ensureChildrenClickable(child)
            })
          }
        }
      }
      
      ensureChildrenClickable(svgElement)

      // Cleanup function to remove event listeners
      return () => {
        svgElement.removeEventListener('click', svgClickHandler)
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [svgContent, spotsById, handleSpotClick, floorId])

    // Effect to apply/remove active class based on activeSpotId prop
    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      // Function to apply active class to an element by spotId (spotId may be composite "floorId|spotId")
      const applyActiveClass = (spotId: string) => {
        const allElements = container.querySelectorAll('[id]')
        allElements.forEach((element) => {
          element.classList.remove('active')
          element.querySelectorAll('*').forEach((child) => {
            child.classList.remove('active')
          })
        })

        const spotIdForDom = spotId.includes('|') ? spotId.split('|')[1] : spotId
        let targetElement: Element | null = null

        targetElement = container.querySelector(`#${CSS.escape(spotIdForDom)}`)
        if (!targetElement) {
          const normalizedId = normalizeId(spotIdForDom)
          targetElement = container.querySelector(`#${CSS.escape(normalizedId)}`)
        }
        if (!targetElement) {
          allElements.forEach((element) => {
            const elementId = element.getAttribute('id')
            if (elementId && (elementId === spotIdForDom || normalizeId(elementId) === spotIdForDom || normalizeId(spotIdForDom) === elementId)) {
              targetElement = element
            }
          })
        }
        
        if (targetElement) {
          targetElement.classList.add('active')
          const currentClass = targetElement.getAttribute('class') || ''
          if (!currentClass.includes('active')) {
            targetElement.setAttribute('class', currentClass ? `${currentClass} active` : 'active')
          }
          targetElement.querySelectorAll('*').forEach((child) => {
            child.classList.add('active')
            const childClass = child.getAttribute('class') || ''
            if (!childClass.includes('active')) {
              child.setAttribute('class', childClass ? `${childClass} active` : 'active')
            }
          })
        }
      }

      // Function to remove active class from all elements
      const removeActiveClass = () => {
        const allElements = container.querySelectorAll('[id]')
        allElements.forEach((element) => {
          element.classList.remove('active')
          element.querySelectorAll('*').forEach((child) => {
            child.classList.remove('active')
          })
        })
        activeSpotIdRef.current = null
      }

      // Apply or remove active class based on activeSpotId
      if (activeSpotId) {
        activeSpotIdRef.current = activeSpotId
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          applyActiveClass(activeSpotId)
        })
      } else {
        removeActiveClass()
      }
    }, [activeSpotId, svgContent])

    if (!svgFile) {
      return null
    }

    return <div ref={containerRef} className={className} />
  }

  return (
    <section className="leasing-map">
      {/* Tab Navigation */}
      <div className="leasing-map__tabs">
        {floors.map((floor) => (
          <button
            key={floor.id}
            className={`leasing-map__tab ${activeTab === floor.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedSpot(null)
              setActiveTab(floor.id)
            }}
          >
            <span className="leasing-map__tab-label-desktop">{floor.label}</span>
            <span className="leasing-map__tab-label-mobile">{floor.mobileLabel}</span>
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="leasing-map__content">
        <div className="leasing-map__content-inner relative">
          {floors.map((floor) => (
            <div
              key={floor.id}
              ref={activeTab === floor.id ? panelRef : null}
              className={`leasing-map__panel ${activeTab === floor.id ? 'active' : ''}`}
            >
              <div 
                ref={activeTab === floor.id ? mediaWrapRef : null}
                className="media-wrap"
                style={activeTab === floor.id ? { 
                  transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                  cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                } : undefined}
                onMouseDown={activeTab === floor.id && zoomLevel > 1 ? handleMouseDown : undefined}
                onMouseMove={activeTab === floor.id && zoomLevel > 1 ? handleMouseMove : undefined}
                onMouseUp={activeTab === floor.id ? handleMouseUp : undefined}
                onMouseLeave={activeTab === floor.id ? handleMouseUp : undefined}
                onTouchStart={activeTab === floor.id && zoomLevel > 1 ? handleTouchStart : undefined}
                onTouchMove={activeTab === floor.id && zoomLevel > 1 ? handleTouchMove : undefined}
                onTouchEnd={activeTab === floor.id ? handleTouchEnd : undefined}
              >
                {/* Base floor plan images */}
                {/* Desktop Image */}
                {floor.image && (
                  <img 
                    src={floor.image} 
                    alt={floor.imageAlt ?? floor.label ?? ''} 
                    className="regular leasing-map__base-image"
                    onLoad={() => handleImageLoad(floor.id)}
                    ref={(img) => {
                      // Handle images that are already cached - only update if not already loaded
                      if (img?.complete && !loadedImages.has(floor.id)) {
                        handleImageLoad(floor.id)
                      }
                    }}
                  />
                )}

                {/* Mobile Image */}
                {/* {floor.mobileImage && (
                  <img 
                    src={floor.mobileImage} 
                    alt={floor.imageAlt ?? floor.label ?? ''} 
                    className="regular mobile leasing-map__base-image"
                    onLoad={() => handleImageLoad(floor.id)}
                    ref={(img) => {
                      // Handle images that are already cached - only update if not already loaded
                      if (img?.complete && !loadedImages.has(floor.id)) {
                        handleImageLoad(floor.id)
                      }
                    }}
                  />
                )} */}

                {/* Only show loading overlay on the first floor */}
                {floor.id === 'floor-1' && (
                  <div className={`loading-overlay ${loadedImages.has(floor.id) ? 'hidden' : ''}`} />
                )}

                {/* SVG Overlay Images - Inline SVG based on breakpoint */}
                {/* {(() => {
                  // Render appropriate overlay based on breakpoint
                  if (currentBreakpoint === 'desktop' && floor.desktopSpacesOverlayImage) {
                    return (
                      <SvgOverlay 
                        svgFile={floor.desktopSpacesOverlayImage} 
                        className="regular desktop leasing-map__svg-overlay"
                        key={`${floor.id}-desktop-overlay`}
                      />
                    )
                  }
                  if (currentBreakpoint === 'tablet' && floor.desktopSpacesOverlayImage) {
                    return (
                      <SvgOverlay 
                        svgFile={floor.desktopSpacesOverlayImage} 
                        className="regular tablet leasing-map__svg-overlay"
                        key={`${floor.id}-tablet-overlay`}
                      />
                    )
                  }
                  if (currentBreakpoint === 'mobile' && floor.desktopSpacesOverlayImage) {
                    return (
                      <SvgOverlay 
                        svgFile={floor.desktopSpacesOverlayImage} 
                        className="regular mobile leasing-map__svg-overlay"
                        key={`${floor.id}-mobile-overlay`}
                      />
                    )
                  }
                  if (currentBreakpoint === 'mobile' && (floor.mobileSpacesOverlayImage || floor.desktopSpacesOverlayImage)) {
                    return (
                      <SvgOverlay 
                        svgFile={floor.mobileSpacesOverlayImage || floor.desktopSpacesOverlayImage} 
                        className="regular mobile leasing-map__svg-overlay"
                        key={`${floor.id}-mobile-overlay`}
                      />
                    )
                  }
                  return null
                })()} */}

                {floor.desktopSpacesOverlayImage && (
                  <SvgOverlay 
                    svgFile={floor.desktopSpacesOverlayImage} 
                    className="regular leasing-map__svg-overlay"
                    activeSpotId={selectedSpot?.id || null}
                    floorId={floor.id}
                    key={`${floor.id}-desktop-overlay`}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Zoom Controls */}
          <div className="leasing-map__zoom-controls">
            <button 
              className="leasing-map__zoom-btn" 
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2}
              title="Zoom In"
            >
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 25 25">
                <line className="st0" x1="12.5" x2="12.5" y2="25"/>
                <line className="st0" x1="25" y1="12.5" y2="12.5"/>
              </svg>
            </button>

            <button 
              className="leasing-map__zoom-btn" 
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              title="Zoom Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 25 25">
                <line className="st0" x1="25" y1="12.5" y2="12.5"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Popup */}
        <div className={`leasing-map__popup ${selectedSpot ? 'visible' : ''}`}>
          <div className="leasing-map__popup-content">
            <div className="leasing-map__popup-inner">
              <div className="leasing-map__popup-text">
                <div className="leasing-map__popup-title-wrap">
                  <h2 className="leasing-map__popup-title">{displaySpot?.popupContent.title}</h2>

                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="32" 
                    height="32" 
                    viewBox="0 0 32 32" 
                    fill="none"
                    onClick={closePopup}
                    style={{ cursor: 'pointer' }}
                  >
                    <line y1="-0.6" x2="42.23" y2="-0.6" transform="matrix(0.703601 -0.710596 0.703601 0.710596 1.29761 31.0078)"/>
                    <line y1="-0.6" x2="42.23" y2="-0.6" transform="matrix(-0.703601 -0.710596 -0.703601 0.710596 30.7131 31.0059)"/>
                  </svg>
                </div>
                
                {displaySpot?.popupContent.description && (
                  <div className="leasing-map__popup-description">
                    <PortableText value={displaySpot.popupContent.description} components={portableTextComponents} />
                  </div>
                )}
                <div className="cta-font underline-link link">
                  <Link href="#contact-form">Inquire</Link>

                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                    <path d="M1 1L13.5 13.5L0.999999 26"/>
                  </svg>
                </div>
              </div>

              <div className="leasing-map__popup-media relative">
                {displaySpot?.popupContent.image && (
                  <>
                    <img
                      src={displaySpot.popupContent.image}
                      alt={displaySpot.popupContent.imageAlt ?? displaySpot.popupContent.title ?? ''}
                      className="full-bleed-image"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
