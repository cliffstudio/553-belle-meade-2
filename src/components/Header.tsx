/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { groq } from 'next-sanity'
import Symbol from './Symbol'
import { DisableBodyScroll, EnableBodyScroll, ClearScrollPosition } from '../utils/bodyScroll'
import { client } from '../../sanity.client'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import type { SanityImage } from '../types/sanity'
import { getExternalLinkProps } from '@/utils/getExternalLinkProps'

// Type for menu items from menuType schema
type MenuItem = {
  itemType: 'pageLink' | 'titleWithSubItems'
  pageLink?: {
    _id: string
    title?: string
    slug?: string
  }
  heading?: string
  subItems?: {
    pageLink: {
      _id: string
      title?: string
      slug?: string
    }
  }[]
}

// Type for menu from menuType schema
type Menu = {
  _id: string
  title: string
  items: MenuItem[]
}

interface HeaderProps {
  leftMenu?: Menu
  rightMenu?: Menu
}

type SearchResult = {
  _id: string
  _type: 'page' | 'brands' | 'events' | 'press'
  title?: string
  slug?: string
}

type SearchRecommendation = {
  _key: string
  caption?: string
  pageLink?: {
    _id: string
    title?: string
    slug?: string
  }
  image?: Partial<Pick<SanityImage, 'asset' | 'alt' | 'hotspot'>>
}

export default function Header({ leftMenu, rightMenu }: HeaderProps) {
  const leftNavRef = useRef<HTMLElement>(null)
  const rightNavRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const menuToggleRef = useRef<HTMLDivElement>(null)
  const menuOverlayRef = useRef<HTMLDivElement>(null)
  const menuOverlayInnerRef = useRef<HTMLDivElement>(null)
  const searchOverlayRef = useRef<HTMLDivElement>(null)
  const searchOverlayInnerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchInnerTimeoutRef = useRef<number | null>(null)
  const pathname = usePathname()
  
  // Menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchRecommendations, setSearchRecommendations] = useState<SearchRecommendation[]>([])
  const [hoveredRecommendationKey, setHoveredRecommendationKey] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [headerExtraHeight, setHeaderExtraHeight] = useState(0)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  
  // Check if we're on homepage for initial state
  const isHomepage = pathname === '/' || pathname === ''
  
  // Menu toggle functions
  const openMenu = () => {
    if (!isMenuOpen) {
      // Disable body scroll
      DisableBodyScroll()
      
      // Change menu toggle to active
      if (menuToggleRef.current) {
        menuToggleRef.current.classList.add('active')
      }
      
      // Fade in menu overlay
      if (menuOverlayRef.current) {
        menuOverlayRef.current.classList.add('visible')
      }

      // Fade in menu overlay inner
      setTimeout(() => {
        if (menuOverlayInnerRef.current) {
          menuOverlayInnerRef.current.classList.add('visible')
        }
      }, 400)
      
      setIsMenuOpen(true)
    }
  }
  
  const closeMenu = () => {
    if (isMenuOpen) {
      // Fade out menu overlay inner
      if (menuOverlayInnerRef.current) {
        menuOverlayInnerRef.current.classList.remove('visible')
      }

      // Change menu toggle to inactive
      if (menuToggleRef.current) {
        menuToggleRef.current.classList.remove('active')
      }

      // Fade out menu overlay
      if (menuOverlayRef.current) {
        menuOverlayRef.current.classList.remove('visible')
      }
      
      // Re-enable body scroll
      setTimeout(() => {
        EnableBodyScroll()
      }, 400)
      
      setIsMenuOpen(false)
    }
  }
  
  const toggleMenu = () => {
    if (isMenuOpen) {
      if (isSearchOpen) {
        closeSearch()
      }
      closeMenu()
    } else {
      openMenu()
    }
  }

  const openSearch = () => {
    if (isSearchOpen) return
    DisableBodyScroll()
    setIsSearchOpen(true)
    if (searchInnerTimeoutRef.current) {
      window.clearTimeout(searchInnerTimeoutRef.current)
    }
    searchInnerTimeoutRef.current = window.setTimeout(() => {
      if (searchOverlayInnerRef.current) {
        searchOverlayInnerRef.current.classList.add('visible')
      }
      searchInputRef.current?.focus()
    }, 400)
  }

  const closeSearch = () => {
    if (!isSearchOpen) return
    if (searchInnerTimeoutRef.current) {
      window.clearTimeout(searchInnerTimeoutRef.current)
      searchInnerTimeoutRef.current = null
    }
    if (searchOverlayInnerRef.current) {
      searchOverlayInnerRef.current.classList.remove('visible')
    }
    EnableBodyScroll()
    setIsSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
    setHoveredRecommendationKey(null)
  }

  const toggleSearch = () => {
    if (isSearchOpen) {
      closeSearch()
    } else {
      openSearch()
    }
  }

  const clearSearchQuery = () => {
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
    searchInputRef.current?.focus()
  }
  

  // Helper function to check if a menu item is active
  const isActive = (href: string): boolean => {
    if (href === '#') return false
    // Remove leading slash for comparison
    const cleanHref = href.startsWith('/') ? href.slice(1) : href
    const cleanPathname = pathname.startsWith('/') ? pathname.slice(1) : pathname
    
    // Check for exact match or if pathname starts with the href
    return cleanPathname === cleanHref || cleanPathname.startsWith(cleanHref + '/')
  }

  // Helper function to check if any sub-item is active
  const hasActiveSubItem = (item: MenuItem): boolean => {
    if (item.itemType === 'titleWithSubItems' && item.subItems) {
      return item.subItems.some(subItem => {
        const href = `/${subItem.pageLink?.slug || ''}`
        return isActive(href)
      })
    }
    return false
  }

  // Environment helpers
  const isHoverCapable = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches
  }

  // Decide whether dropdowns should use click (mobile/tablet/touch) behavior
  const shouldUseClickDropdowns = () => {
    // Use click dropdowns on small screens OR devices without hover capability (e.g., iPad)
    return window.innerWidth <= 950 || !isHoverCapable()
  }

  // Handle dropdown interaction (hover on desktop, click on mobile/tablet)
  const handleDropdownEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    // Only handle hover when hover is actually supported
    if (shouldUseClickDropdowns()) return
    
    const dropdownContent = event.currentTarget.querySelector('.dropdown-content') as HTMLElement
    if (dropdownContent) {
      // Get all dropdown contents to find the tallest one
      const allDropdowns = document.querySelectorAll('.dropdown-content')
      let maxHeight = 0
      
      allDropdowns.forEach(dropdown => {
        const height = (dropdown as HTMLElement).scrollHeight
        if (height > maxHeight) {
          maxHeight = height
        }
      })
      
      setHeaderExtraHeight(maxHeight)
    }
  }

  const handleDropdownLeave = () => {
    // Only handle hover when hover is actually supported
    if (shouldUseClickDropdowns()) return
    setHeaderExtraHeight(0)
  }

  const handleDropdownClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Handle click when using click-style dropdowns (mobile/tablet/touch)
    if (!shouldUseClickDropdowns()) return
    
    event.preventDefault()
    const dropdownIndex = parseInt(event.currentTarget.dataset.dropdownIndex || '0')
    
    if (activeDropdown === dropdownIndex) {
      // Close the dropdown if it's already open
      setActiveDropdown(null)
      setHeaderExtraHeight(0)
    } else {
      // Open this dropdown and close others
      setActiveDropdown(dropdownIndex)
      
      // Get all dropdown contents to find the tallest one (same as desktop behavior)
      const allDropdowns = document.querySelectorAll('.dropdown-content')
      let maxHeight = 0
      
      allDropdowns.forEach(dropdown => {
        const height = (dropdown as HTMLElement).scrollHeight
        if (height > maxHeight) {
          maxHeight = height
        }
      })
      
      setHeaderExtraHeight(maxHeight)
    }
  }

  // Render a menu item (handles both regular links and dropdowns)
  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.itemType === 'pageLink' && item.pageLink) {
      const href = `/${item.pageLink.slug || ''}`
      return (
        <div className="menu-item" key={index}>
          <Link
            href={href}
            className={isActive(href) ? 'active' : ''}
            onClick={() => {
              // Ensure any open dropdown state is cleared on navigation (desktop/tablet)
              setActiveDropdown(null)
              setHeaderExtraHeight(0)
            }}
          >
            {item.pageLink.title || 'Untitled'}
          </Link>

          <div className="active-indicator"></div>
        </div>
      )
    } else if (item.itemType === 'titleWithSubItems' && item.heading) {
      const hasActive = hasActiveSubItem(item)
      const isDropdownActive = activeDropdown === index
      return (
        <div 
          key={index} 
          className={`dropdown-menu ${hasActive ? 'has-active' : ''} ${isDropdownActive ? 'active' : ''}`}
          data-dropdown-index={index}
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleDropdownLeave}
          onClick={handleDropdownClick}
        >
          <div className="dropdown-title">
            <div className="dropdown-title-text">
              {item.heading}
            </div>
            
            <div className="active-indicator"></div>
          </div>

          <div className="dropdown-content">
            {item.subItems?.map((subItem, subIndex) => {
              const href = `/${subItem.pageLink?.slug || ''}`
              return (
                <Link
                  key={subIndex}
                  href={href}
                  className={isActive(href) ? 'active' : ''}
                  onClick={() => {
                    // Close dropdown on link tap/click for iPad/desktop
                    setActiveDropdown(null)
                    setHeaderExtraHeight(0)
                  }}
                >
                  {subItem.pageLink?.title || 'Untitled'}
                </Link>
              )
            })}
          </div>
        </div>
      )
    }
    return null
  }

  const getSearchResultHref = (result: SearchResult) => {
    const slug = result.slug || ''
    if (result._type === 'page') return `/${slug}`
    if (result._type === 'brands') return `/brands/${slug}`
    if (result._type === 'events') return `/events/${slug}`
    return `/press/${slug}`
  }

  const getSearchGroupLabel = (type: SearchResult['_type']) => {
    if (type === 'page') return 'Pages'
    if (type === 'brands') return 'Brands'
    if (type === 'events') return 'Events'
    return 'Press'
  }

  const hasSearchQuery = searchQuery.trim().length > 0
  const searchResultsHref = `/search?q=${encodeURIComponent(searchQuery.trim())}`
  const displayRecommendations = searchRecommendations.filter((recommendation) => recommendation.pageLink?.slug)
  const defaultFeaturedRecommendation = displayRecommendations.find(
    (recommendation) => recommendation.pageLink?.slug && recommendation.image?.asset?._ref
  )
  const hoveredRecommendation = displayRecommendations.find(
    (recommendation) => recommendation._key === hoveredRecommendationKey
  )
  const featuredRecommendation =
    (hoveredRecommendation?.image?.asset?._ref ? hoveredRecommendation : null) || defaultFeaturedRecommendation

  useEffect(() => {
    let isCancelled = false

    const fetchSearchRecommendations = async () => {
      try {
        const recommendations = await client.fetch<SearchRecommendation[]>(
          groq`
            *[
              _type == "search" &&
              !(_id in path("drafts.**"))
            ][0].recommendations[]{
              _key,
              caption,
              pageLink->{
                _id,
                title,
                "slug": slug.current
              },
              image{
                asset,
                alt
              }
            }
          `
        )

        if (!isCancelled) {
          setSearchRecommendations(recommendations || [])
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load search recommendations:', error)
          setSearchRecommendations([])
        }
      }
    }

    fetchSearchRecommendations()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    const setNavItemWidths = () => {
      const navContainers = [leftNavRef.current, rightNavRef.current]
      
      navContainers.forEach(container => {
        if (!container) return
        
        // Handle menu items (regular links) and dropdown titles
        const menuItems = container.querySelectorAll('.menu-item')
        const dropdownTitles = container.querySelectorAll('.dropdown-title')
        
        // Process menu items (regular links wrapped in .menu-item)
        menuItems.forEach(menuItem => {
          if (!(menuItem instanceof HTMLElement)) return
          
          const link = menuItem.querySelector('a, button')
          if (!link || !(link instanceof HTMLElement)) return
          
          // Clear any existing fixed widths and heights to allow natural resizing
          menuItem.style.width = ''
          menuItem.style.minWidth = ''
          menuItem.style.height = ''
          menuItem.style.minHeight = ''
          link.style.width = ''
          link.style.minWidth = ''
          link.style.height = ''
          link.style.minHeight = ''
          
          // Force a reflow to get the natural dimensions with current font size
          link.offsetHeight
          
          const computedStyle = getComputedStyle(link)
          const fontSize = parseFloat(computedStyle.fontSize)
          
          // Get the original font width and height (Millionaire-Roman)
          const originalWidth = link.offsetWidth
          const originalHeight = link.offsetHeight
          
          // Temporarily switch to Millionaire-Script to measure dimensions
          const originalFont = link.style.fontFamily
          link.style.fontFamily = 'Millionaire-Script'
          const scriptWidth = link.offsetWidth
          const scriptHeight = link.offsetHeight
          
          // Restore original font
          link.style.fontFamily = originalFont
          
          // Store the original width as a CSS custom property for the active-indicator
          menuItem.style.setProperty('--original-width', `${originalWidth}px`)
          
          // Use the wider width to prevent cutoff, plus some extra padding
          const currentWidth = link.offsetWidth
          const maxWidth = Math.max(currentWidth, scriptWidth)
          const paddedWidth = maxWidth + (0.4 * fontSize) // 0.4em padding
          
          // Apply width to the parent .menu-item container
          menuItem.style.width = `${paddedWidth}px`
          menuItem.style.minWidth = `${paddedWidth}px`
          
          // Use the smaller height to keep the container tight
          // The transform just repositions the text, it doesn't change the element's height
          const minHeight = Math.min(originalHeight, scriptHeight)
          
          // Apply height to the parent .menu-item container
          menuItem.style.height = `${minHeight}px`
          menuItem.style.minHeight = `${minHeight}px`
        })
        
        // Process dropdown titles (now with .dropdown-title-text inside)
        dropdownTitles.forEach(dropdownTitle => {
          if (!(dropdownTitle instanceof HTMLElement)) return
          
          const titleText = dropdownTitle.querySelector('.dropdown-title-text')
          if (!titleText || !(titleText instanceof HTMLElement)) return
          
          // Clear any existing fixed widths and heights to allow natural resizing
          dropdownTitle.style.width = ''
          dropdownTitle.style.minWidth = ''
          dropdownTitle.style.height = ''
          dropdownTitle.style.minHeight = ''
          titleText.style.width = ''
          titleText.style.minWidth = ''
          titleText.style.height = ''
          titleText.style.minHeight = ''
          
          // Force a reflow to get the natural dimensions with current font size
          titleText.offsetHeight
          
          const computedStyle = getComputedStyle(titleText)
          const fontSize = parseFloat(computedStyle.fontSize)
          
          // Get the original font width and height (Millionaire-Roman)
          const originalWidth = titleText.offsetWidth
          const originalHeight = titleText.offsetHeight
          
          // Temporarily switch to Millionaire-Script to measure dimensions
          const originalFont = titleText.style.fontFamily
          titleText.style.fontFamily = 'Millionaire-Script'
          const scriptWidth = titleText.offsetWidth
          const scriptHeight = titleText.offsetHeight
          
          // Restore original font
          titleText.style.fontFamily = originalFont
          
          // Store the original width as a CSS custom property for the active-indicator
          dropdownTitle.style.setProperty('--original-width', `${originalWidth}px`)
          
          // Use the wider width to prevent cutoff, plus some extra padding
          const currentWidth = titleText.offsetWidth
          const maxWidth = Math.max(currentWidth, scriptWidth)
          const paddedWidth = maxWidth + (0.4 * fontSize) // 0.4em padding
          
          // Apply width to the parent .dropdown-title container
          dropdownTitle.style.width = `${paddedWidth}px`
          dropdownTitle.style.minWidth = `${paddedWidth}px`
          
          // Use the smaller height to keep the container tight
          // The transform just repositions the text, it doesn't change the element's height
          const minHeight = Math.min(originalHeight, scriptHeight)
          
          // Apply height to the parent .dropdown-title container
          dropdownTitle.style.height = `${minHeight}px`
          dropdownTitle.style.minHeight = `${minHeight}px`
        })
      })
    }

    const setDropdownItemHeights = () => {
      const dropdownContents = document.querySelectorAll('.dropdown-content')
      
      dropdownContents.forEach(dropdown => {
        const links = dropdown.querySelectorAll('a')
        links.forEach(link => {
          if (link instanceof HTMLElement) {
            // Clear any existing fixed heights to allow natural resizing
            link.style.height = ''
            link.style.minHeight = ''
            
            // Force a reflow to get the natural height with current font size
            link.offsetHeight
            
            // Set the height to accommodate both Millionaire-Roman and Millionaire-Script
            // We'll use the taller of the two fonts to prevent jumping
            const currentHeight = link.offsetHeight
            
            // Temporarily switch to Millionaire-Script to measure height
            const originalFont = link.style.fontFamily
            link.style.fontFamily = 'Millionaire-Script'
            const scriptHeight = link.offsetHeight
            
            // Restore original font
            link.style.fontFamily = originalFont
            
            // Use the taller height to prevent jumping, plus some extra padding
            const maxHeight = Math.max(currentHeight, scriptHeight)
            const paddedHeight = maxHeight + (0.1 * parseFloat(getComputedStyle(link).fontSize)) // Small extra padding
            
            link.style.height = `${paddedHeight}px`
            link.style.minHeight = `${paddedHeight}px`
          }
        })
      })
    }

    const handleResize = () => {
      // Recalculate on resize (no need to hide/show, just recalculate)
      setNavItemWidths()
      setDropdownItemHeights()
      
      // Close any open dropdowns when screen size changes
      setActiveDropdown(null)
      setHeaderExtraHeight(0)
    }

    // Nav containers start hidden via CSS, we'll show them after calculations
    const navContainers = [leftNavRef.current, rightNavRef.current]
    
    // Set widths and heights after component mounts
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Perform all measurements while elements are hidden
      setNavItemWidths()
      setDropdownItemHeights()
      
      // Force a synchronous layout recalculation after all styles are applied
      // This ensures browser has processed all the style changes
      navContainers.forEach(container => {
        if (container) {
          // Force layout recalculation to ensure measurements are applied
          void container.offsetHeight
        }
      })
      
      // Use double requestAnimationFrame to ensure all paint operations complete
      requestAnimationFrame(() => {
        // Show nav items after calculations are complete
        navContainers.forEach(container => {
          if (container) {
            container.classList.add('ready')
          }
        })
        // nav ready
      })
    })
    
    // Recalculate on window resize
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [leftMenu, rightMenu])

  useEffect(() => {
    if (!isSearchOpen) return

    const setSearchResultItemHeights = () => {
      const searchResultItems = document.querySelectorAll('.search-result-item')

      searchResultItems.forEach((item) => {
        if (!(item instanceof HTMLElement)) return

        // Clear any existing fixed heights before measuring.
        item.style.height = ''
        item.style.minHeight = ''

        // Force reflow before measurements.
        void item.offsetHeight

        const originalHeight = item.offsetHeight

        // Temporarily switch to script font to capture hover-state height.
        const originalFont = item.style.fontFamily
        item.style.fontFamily = 'Millionaire-Script'
        const scriptHeight = item.offsetHeight
        item.style.fontFamily = originalFont

        // Match menu-item approach: lock to the measured minimum height.
        const minHeight = Math.min(originalHeight, scriptHeight)
        item.style.height = `${minHeight}px`
        item.style.minHeight = `${minHeight}px`
      })
    }

    const frameId = requestAnimationFrame(setSearchResultItemHeights)

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [isSearchOpen, searchResults, searchRecommendations])

  // Apply extra height and background to header when dropdown is hovered
  useEffect(() => {
    if (headerRef.current) {
      if (headerExtraHeight > 0) {
        // Temporarily clear padding-bottom to measure natural header height
        headerRef.current.style.paddingBottom = ''
        
        // Force a reflow to get accurate measurement
        void headerRef.current.offsetHeight
        
        // Calculate the natural header height (without any extra padding)
        const naturalHeaderHeight = headerRef.current.offsetHeight
        
        // Determine extra padding based on screen size: Desktop (> 1440px): 64px, Tablet (≤ 1440px): 54px
        const isTablet = typeof window !== 'undefined' && window.innerWidth <= 1440
        const extraPadding = isTablet ? 54 : 64
        
        // Set padding-bottom so that total header height equals dropdown height + extra padding
        // padding-bottom = (dropdown height + extra padding) - natural header height
        const paddingBottom = (headerExtraHeight + extraPadding) - naturalHeaderHeight
        
        headerRef.current.style.paddingBottom = `${Math.max(0, paddingBottom)}px`
        headerRef.current.classList.add('dropdown-hovered')
      } else {
        headerRef.current.style.paddingBottom = ''
        headerRef.current.classList.remove('dropdown-hovered')
      }
    }
  }, [headerExtraHeight])

  // Handle scroll-based class addition
  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return
      
      const headerHeight = headerRef.current.offsetHeight
      let scrollThreshold = window.innerHeight - headerHeight // Default: 100dvh - header height
      
      // Special handling for heritage and carousel pages - keep header transparent until past all text-with-artefacts blocks
      const isHeritagePage = document.body.classList.contains('page-heritage')
      const isCarouselPage = document.body.classList.contains('page-carousel')
      
      if (isHeritagePage || isCarouselPage) {
        const textWithArtefactsBlocks = document.querySelectorAll('.text-with-artefacts')
        if (textWithArtefactsBlocks.length > 0) {
          // Find the last text-with-artefacts block
          const lastTextWithArtefactsBlock = textWithArtefactsBlocks[textWithArtefactsBlocks.length - 1]
          const lastBlockRect = lastTextWithArtefactsBlock.getBoundingClientRect()
          const lastBlockBottom = window.scrollY + lastBlockRect.bottom
          
          // Set threshold to the bottom of the last text-with-artefacts block
          scrollThreshold = lastBlockBottom - headerHeight
        }
      } else {
        // Check for hero media block layout and adjust threshold accordingly
        const heroMediaBlock = document.querySelector('.hero-media-block')
        if (heroMediaBlock) {
          if (heroMediaBlock.classList.contains('layout-2') || heroMediaBlock.classList.contains('layout-3')) {
            scrollThreshold = 50 // 50px from top for layout-2 and layout-3
          }
          // layout-1 keeps the default threshold (window.innerHeight - headerHeight)
        }
      }
      
      const scrollY = window.scrollY
      
      if (scrollY >= scrollThreshold) {
        headerRef.current.classList.add('header-scrolled')
      } else {
        headerRef.current.classList.remove('header-scrolled')
      }
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll)
    
    // Check initial scroll position
    handleScroll()
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Handle landscape mobile scroll - transform header off top on scroll
  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const handleScroll = () => {
      if (!headerRef.current || ticking) return
      
      ticking = true
      requestAnimationFrame(() => {
        if (!headerRef.current) {
          ticking = false
          return
        }

        // Check if we're in landscape mobile (max-width: 950px and orientation: landscape)
        const isLandscapeMobile = window.innerWidth <= 950 && window.matchMedia('(orientation: landscape)').matches
        
        if (isLandscapeMobile) {
          const currentScrollY = window.scrollY
          const scrollDelta = currentScrollY - lastScrollY
          
          // Only hide on scroll down, show on scroll up or at top
          if (currentScrollY > 10 && scrollDelta > 0) {
            // Scrolling down (with small threshold to avoid flickering at top)
            headerRef.current.classList.add('header-scrolled-down')
          } else if (scrollDelta < 0 || currentScrollY <= 10) {
            // Scrolling up or near top
            headerRef.current.classList.remove('header-scrolled-down')
          }
          
          lastScrollY = currentScrollY
        } else {
          // Not in landscape mobile, ensure class is removed
          headerRef.current.classList.remove('header-scrolled-down')
          lastScrollY = window.scrollY
        }
        
        ticking = false
      })
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Check initial state
    handleScroll()
    
    // Also handle resize/orientation change
    const handleResize = () => {
      if (headerRef.current) {
        const isLandscapeMobile = window.innerWidth <= 950 && window.matchMedia('(orientation: landscape)').matches
        if (!isLandscapeMobile) {
          headerRef.current.classList.remove('header-scrolled-down')
        }
      }
      handleScroll()
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  // Ensure header is visible when not on homepage (e.g. after navigation)
  useEffect(() => {
    if (!headerRef.current || isHomepage) return
    headerRef.current.classList.remove('header-hidden')
    headerRef.current.style.opacity = '1'
  }, [pathname, isHomepage])

  useEffect(() => {
    return () => {
      if (searchInnerTimeoutRef.current) {
        window.clearTimeout(searchInnerTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (isSearchOpen) {
        closeSearch()
      }
      if (isMenuOpen) {
        closeMenu()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen, isSearchOpen])

  // Close any open menus/dropdowns on route change (covers iPad/desktop dropdowns)
  useEffect(() => {
    // Clear saved scroll position on route change to ensure new page starts at top
    ClearScrollPosition()
    // Clear dropdown and extra header height when navigation occurs
    setActiveDropdown(null)
    setHeaderExtraHeight(0)
    // Also ensure the mobile overlay is closed if it was open
    if (isMenuOpen) {
      closeMenu()
    }
    if (isSearchOpen) {
      closeSearch()
    }
    
    // Force close any hover-based dropdowns on desktop by temporarily disabling hover
    // This prevents the dropdown from staying visible when mouse is still over it after navigation
    const dropdownMenus = document.querySelectorAll('.dropdown-menu')
    dropdownMenus.forEach(dropdown => {
      if (dropdown instanceof HTMLElement) {
        dropdown.classList.add('force-close')
        // Remove the force-close class after a brief delay to allow hover to work again
        setTimeout(() => {
          dropdown.classList.remove('force-close')
        }, 100)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (!isSearchOpen) return

    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    let isCancelled = false
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true)

      const escapedQuery = trimmedQuery.toLowerCase().replace(/[*?[\]]/g, '')
      const searchPattern = `*${escapedQuery}*`

      try {
        const results = await client.fetch<SearchResult[]>(
          groq`
            *[
              (
                _type == "page" &&
                defined(slug.current) &&
                !(_id in path("drafts.**")) &&
                (
                  string::lower(coalesce(title, "")) match $pattern ||
                  string::lower(coalesce(seo.metaTitle, "")) match $pattern ||
                  string::lower(coalesce(seo.metaDescription, "")) match $pattern ||
                  string::lower(coalesce(planYourVisitHeading, "")) match $pattern ||
                  string::lower(coalesce(pt::text(planYourVisitBody), "")) match $pattern ||
                  string::lower(coalesce(array::join(planYourVisitBody[].children[].text, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(textBlocks[].title, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(textBlocks[].text, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(planYourVisitDetails[].heading, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(planYourVisitDetails[].items[].subtitle, " "), "")) match $pattern ||
                  string::lower(coalesce(pt::text(planYourVisitDetails[].items[].body), "")) match $pattern ||
                  string::lower(coalesce(array::join(planYourVisitDetails[].items[].body[].children[].text, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(contentBlocks[].heading, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(contentBlocks[].subheading, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(contentBlocks[].title, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(contentBlocks[].introduction, " "), "")) match $pattern ||
                  string::lower(coalesce(pt::text(contentBlocks[].body), "")) match $pattern ||
                  string::lower(coalesce(array::join(contentBlocks[].body[].children[].text, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(contentBlocks[].architects[].name, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(contentBlocks[].architects[].bio, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(contentBlocks[].floors[].label, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(contentBlocks[].floors[].mobileLabel, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(contentBlocks[].floors[].spots[].title, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(contentBlocks[].floors[].spots[].description, " "), "")) match $pattern
                )
              ) ||
              (
                _type == "brands" &&
                defined(slug.current) &&
                !(_id in path("drafts.**")) &&
                (
                  string::lower(coalesce(title, "")) match $pattern ||
                  string::lower(coalesce(shortDescription, "")) match $pattern ||
                  string::lower(coalesce(seo.metaTitle, "")) match $pattern ||
                  string::lower(coalesce(seo.metaDescription, "")) match $pattern ||
                  string::lower(coalesce(pt::text(content), "")) match $pattern ||
                  string::lower(coalesce(array::join(content[].children[].text, " "), "")) match $pattern ||
                  string::lower(coalesce(pt::text(openingHours), "")) match $pattern ||
                  string::lower(coalesce(array::join(openingHours[].children[].text, " "), "")) match $pattern ||
                  string::lower(coalesce(pt::text(address), "")) match $pattern ||
                  string::lower(coalesce(array::join(address[].children[].text, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(details[].detailHeading, " "), "")) match $pattern ||
                  string::lower(coalesce(pt::text(details[].detailBody), "")) match $pattern ||
                  string::lower(coalesce(array::join(details[].detailBody[].children[].text, " "), "")) match $pattern
                )
              ) ||
              (
                _type == "events" &&
                defined(slug.current) &&
                !(_id in path("drafts.**")) &&
                (
                  string::lower(coalesce(title, "")) match $pattern ||
                  string::lower(coalesce(eventLocation, "")) match $pattern ||
                  string::lower(coalesce(seo.metaTitle, "")) match $pattern ||
                  string::lower(coalesce(seo.metaDescription, "")) match $pattern ||
                  string::lower(coalesce(pt::text(content), "")) match $pattern ||
                  string::lower(coalesce(array::join(content[].children[].text, " "), "")) match $pattern ||
                  string::lower(coalesce(array::join(details[].detailHeading, " "), "")) match $pattern ||
                  string::lower(coalesce(pt::text(details[].detailBody), "")) match $pattern ||
                  string::lower(coalesce(array::join(details[].detailBody[].children[].text, " "), "")) match $pattern
                )
              ) ||
              (
                _type == "press" &&
                defined(slug.current) &&
                !(_id in path("drafts.**")) &&
                (
                  string::lower(coalesce(title, "")) match $pattern ||
                  string::lower(coalesce(excerpt, "")) match $pattern ||
                  string::lower(coalesce(source, "")) match $pattern ||
                  string::lower(coalesce(seo.metaTitle, "")) match $pattern ||
                  string::lower(coalesce(seo.metaDescription, "")) match $pattern ||
                  string::lower(coalesce(pt::text(content), "")) match $pattern ||
                  string::lower(coalesce(array::join(content[].children[].text, " "), "")) match $pattern
                )
              )
            ] {
              _id,
              _type,
              title,
              "slug": slug.current,
              "searchPriority": select(
                _type == "page" => select(
                  string::lower(coalesce(title, "")) match $pattern => 3,
                  string::lower(coalesce(seo.metaTitle, "")) match $pattern => 2,
                  1
                ),
                _type == "brands" => select(
                  string::lower(coalesce(title, "")) match $pattern => 3,
                  string::lower(coalesce(shortDescription, "")) match $pattern => 2,
                  1
                ),
                _type == "events" => select(
                  string::lower(coalesce(title, "")) match $pattern => 3,
                  string::lower(coalesce(eventLocation, "")) match $pattern => 2,
                  1
                ),
                _type == "press" => select(
                  string::lower(coalesce(title, "")) match $pattern => 3,
                  string::lower(coalesce(excerpt, "")) match $pattern => 2,
                  1
                ),
                1
              )
            } | order(searchPriority desc, _updatedAt desc) [0...10] {
              _id,
              _type,
              title,
              slug
            }
          `,
          { pattern: searchPattern }
        )

        if (!isCancelled) {
          setSearchResults(results || [])
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Search failed:', error)
          setSearchResults([])
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false)
        }
      }
    }, 250)

    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [isSearchOpen, searchQuery])

  // Enable wheel and touch scrolling on menu overlay inner-wrap
  useEffect(() => {
    const menuInnerElement = menuOverlayInnerRef.current
    if (!menuInnerElement || !isMenuOpen) return

    // Handle wheel events (mouse)
    const handleWheel = (e: WheelEvent) => {
      const element = e.currentTarget as HTMLElement
      const { scrollTop, scrollHeight, clientHeight } = element
      const isAtTop = scrollTop <= 0
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1
      const isScrollingDown = e.deltaY > 0
      const isScrollingUp = e.deltaY < 0

      // If we can scroll within the element, stop propagation to prevent global handlers from interfering
      if ((isScrollingDown && !isAtBottom) || (isScrollingUp && !isAtTop)) {
        e.stopPropagation()
      }
    }

    // Handle touch events to allow scrolling on mobile
    // Listen on document in capture phase to run before global handlers
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as Node
      if (!menuInnerElement.contains(target)) return
      
      const { scrollHeight, clientHeight } = menuInnerElement
      const canScroll = scrollHeight > clientHeight
      
      // If element can scroll and touch is on this element or its children, stop propagation
      // This prevents global handlers from blocking touch scrolling
      if (canScroll) {
        e.stopImmediatePropagation()
        // Don't prevent default - allow native scrolling behavior
      }
    }

    // Use capture phase to catch events before any global handlers
    // passive: false allows us to stop propagation
    menuInnerElement.addEventListener('wheel', handleWheel, { passive: false, capture: true })
    // Listen on document for touchmove to run before document-level handlers
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true })

    return () => {
      menuInnerElement.removeEventListener('wheel', handleWheel, { capture: true } as EventListenerOptions)
      document.removeEventListener('touchmove', handleTouchMove, { capture: true } as EventListenerOptions)
    }
  }, [isMenuOpen])

  // Enable wheel and touch scrolling on search overlay inner container
  useEffect(() => {
    const searchInnerElement = searchOverlayInnerRef.current
    if (!searchInnerElement || !isSearchOpen) return

    const handleWheel = (e: WheelEvent) => {
      const element = e.currentTarget as HTMLElement
      const { scrollTop, scrollHeight, clientHeight } = element
      const isAtTop = scrollTop <= 0
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1
      const isScrollingDown = e.deltaY > 0
      const isScrollingUp = e.deltaY < 0

      if ((isScrollingDown && !isAtBottom) || (isScrollingUp && !isAtTop)) {
        e.stopPropagation()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as Node
      if (!searchInnerElement.contains(target)) return

      const { scrollHeight, clientHeight } = searchInnerElement
      const canScroll = scrollHeight > clientHeight

      if (canScroll) {
        e.stopImmediatePropagation()
      }
    }

    searchInnerElement.addEventListener('wheel', handleWheel, { passive: false, capture: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true })

    return () => {
      searchInnerElement.removeEventListener('wheel', handleWheel, { capture: true } as EventListenerOptions)
      document.removeEventListener('touchmove', handleTouchMove, { capture: true } as EventListenerOptions)
    }
  }, [isSearchOpen])

  // Render mobile menu items (accordion dropdowns for mobile overlay)
  const renderMobileMenuItem = (item: MenuItem, index: number) => {
    if (item.itemType === 'pageLink' && item.pageLink) {
      const href = `/${item.pageLink.slug || ''}`
      return (
        <Link
          key={index}
          href={href}
          className={`header-menu-item ${isActive(href) ? 'active' : ''}`}
          onClick={() => {
            // Clear saved scroll position before navigation
            // This ensures the new page starts at the top
            ClearScrollPosition()
            // Don't close menu immediately - let it stay visible during navigation
            // The pathname change effect will close it once navigation completes
          }}
        >
          {item.pageLink.title || 'Untitled'}
        </Link>
      )
    } else if (item.itemType === 'titleWithSubItems' && item.heading) {
      const isExpanded = activeDropdown === index
      return (
        <div key={index} className="mobile-dropdown-section">
          <div 
            className={`mobile-dropdown-title ${isExpanded ? 'expanded' : ''}`}
            onClick={() => {
              if (activeDropdown === index) {
                setActiveDropdown(null)
              } else {
                setActiveDropdown(index)
              }
            }}
          >
            <span className="dropdown-title-text">{item.heading}</span>

            <span className="dropdown-title-text-script">{item.heading}</span>

            <div className="dropdown-caret">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 12 7" fill="none">
                <path d="M1 6L6.00013 1L11 6" stroke="#FFF9F2"/>
              </svg>
            </div>
          </div>

          <div className={`mobile-dropdown-content ${isExpanded ? 'expanded' : ''}`}>
            {item.subItems?.map((subItem, subIndex) => {
              const href = `/${subItem.pageLink?.slug || ''}`
              return (
                <Link
                  key={subIndex}
                  href={href}
                  className={`header-menu-item sub-item ${isActive(href) ? 'active' : ''}`}
                  onClick={() => {
                    // Clear saved scroll position before navigation
                    // This ensures the new page starts at the top
                    ClearScrollPosition()
                    // Don't close menu immediately - let it stay visible during navigation
                    // The pathname change effect will close it once navigation completes
                  }}
                >
                  {subItem.pageLink?.title || 'Untitled'}
                </Link>
              )
            })}
          </div>
        </div>
      )
    }
    return null
  }

  // Handle case where both menus are undefined
  if (!leftMenu && !rightMenu) {
    return (
      <header ref={headerRef} className={`site-header z-500 h-pad ${isSearchOpen ? 'search-open' : ''}`}>
        <div className="inner-wrap row-lg">
          <nav className="left-nav col-5-12_lg">
            {/* Empty left nav */}
          </nav>

          <div className="col-2-12_lg">
            <div className="symbol">
              <Symbol />
              <Link href="/" />
            </div>
          </div>
          
          <nav className="right-nav col-5-12_lg">
            {/* Empty right nav */}
          </nav>
        </div>
      </header>
    )
  }

  return (
    <>
      <header ref={headerRef} className={`site-header z-500 h-pad ${isSearchOpen ? 'search-open' : ''}`}>
        <div className="inner-wrap row-lg row-sm">

          <div className="col-5-12_lg col-1-5_sm">
            <div className="desktop">
              <nav ref={leftNavRef} className="left-nav">
                {leftMenu?.items?.map((item, index) => renderMenuItem(item, index))}
              </nav>
            </div>

            <div className="mobile">
              <div className="menu-toggle" ref={menuToggleRef} onClick={toggleMenu}>
                <div className="menu-bar" data-position="top"></div>
                <div className="menu-bar" data-position="middle"></div>
                <div className="menu-bar" data-position="bottom"></div>
              </div>
            </div>
          </div>

          <div className="col-2-12_lg col-3-5_sm">
            <div className="symbol">
              <Symbol />
              <Link href="/" />
            </div>
          </div>

          <div className="col-5-12_lg col-1-5_sm">
            <div className="desktop">
              <nav ref={rightNavRef} className="right-nav">
                {rightMenu?.items?.map((item, index) => renderMenuItem(item, index))}

                <div className="menu-item">
                  <button
                    type="button"
                    className="menu-item-button"
                    onClick={toggleSearch}
                    aria-expanded={isSearchOpen}
                    aria-controls="header-search-overlay"
                  >
                    {isSearchOpen ? 'Close' : 'Search'}
                  </button>
                </div>
              </nav>
            </div>
          </div>

        </div>
      </header>

      <div className="menu-overlay z-400" ref={menuOverlayRef}>
        <div className="inner-wrap h-pad" ref={menuOverlayInnerRef}>
          {leftMenu?.items?.map((item, index) => renderMobileMenuItem(item, index))}
          {rightMenu?.items?.map((item, index) => renderMobileMenuItem(item, index))}
          <button
            type="button"
            className="menu-item-button"
            onClick={toggleSearch}
            aria-expanded={isSearchOpen}
            aria-controls="header-search-overlay"
          >Search</button>
        </div>
      </div>

      <div
        id="header-search-overlay"
        className={`search-overlay z-400 ${isSearchOpen ? 'visible' : ''}`}
        ref={searchOverlayRef}
        aria-hidden={!isSearchOpen}
      >
        <div className="search-overlay-inner row-lg h-pad" ref={searchOverlayInnerRef}>
          <div className="col-2-12_lg"></div>

          <div className="col-8-12_lg inner-wrap">
            <div className="search-overlay-content">
              <div className="search-input-wrap">
                <input
                  id="header-search-input"
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search"
                  className="search-input h2"
                  aria-label="Search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                    }
                  }}
                  autoComplete="off"
                />
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    className="search-clear-button"
                    aria-label="Clear search"
                    onClick={clearSearchQuery}
                  >
                    ×
                  </button>
                )}
              </div>

              {isSearching && <div className="search-status">Searching...</div>}

              {!isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                <div className="search-status">No results found.</div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="search-results">
                  {(['page', 'brands', 'events', 'press'] as const).map((groupType) => {
                    const groupedResults = searchResults.filter((result) => result._type === groupType)
                    if (groupedResults.length === 0) return null

                    return (
                      <div key={groupType} className="search-results-group">
                        <div className="search-results-group-title uppercase cta-font">{getSearchGroupLabel(groupType)}</div>
                        <div className="search-results-group-items">
                          {groupedResults.map((result) => (
                            <Link
                              key={result._id}
                              href={getSearchResultHref(result)}
                              className="search-result-item"
                              onClick={() => {
                                closeSearch()
                                ClearScrollPosition()
                              }}
                            >
                              <span className="search-result-title">{result.title || 'Untitled'}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  })}

                  {searchResultsHref && <div className="search-view-all-results cta-font underline-link link cream">
                    <a href={searchResultsHref} {...getExternalLinkProps()}>View all results</a>

                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                      <path d="M1 1L13.5 13.5L0.999999 26"/>
                    </svg>
                  </div>}
                </div>
              )}

              {displayRecommendations.length > 0 && !hasSearchQuery && (
                <div className="search-recommendations">
                  <div>
                    <div className="search-results-group-title uppercase cta-font">Recommendations</div>

                    <div
                      className="search-recommendations-list"
                      onMouseLeave={() => setHoveredRecommendationKey(null)}
                    >
                      {displayRecommendations.map((recommendation) => (
                        <Link
                          key={recommendation._key}
                          href={`/${recommendation.pageLink?.slug || ''}`}
                          className="search-result-item"
                          onMouseOver={() => setHoveredRecommendationKey(recommendation._key)}
                          onFocus={() => setHoveredRecommendationKey(recommendation._key)}
                          onClick={() => {
                            closeSearch()
                            ClearScrollPosition()
                          }}
                        >
                          <span className="search-result-title">{recommendation.pageLink?.title || 'Untitled'}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {featuredRecommendation && (
                    <Link
                      href={`/${featuredRecommendation.pageLink?.slug || ''}`}
                      className="search-recommendation-feature"
                      onClick={() => {
                        closeSearch()
                        ClearScrollPosition()
                      }}
                    >
                      <div className="media-wrap">
                        <img 
                          src={urlFor(featuredRecommendation.image!).width(600).height(380).fit('crop').url() ?? ''}
                          alt={featuredRecommendation.image?.alt ?? ''}
                          className="full-bleed-image"
                          style={{
                            objectPosition: featuredRecommendation.image?.hotspot
                              ? `${featuredRecommendation.image.hotspot.x * 100}% ${featuredRecommendation.image.hotspot.y * 100}%`
                              : "center",
                          }}
                        />
                      </div>
                      {featuredRecommendation.caption && (
                        <div className="media-caption caption-font">{featuredRecommendation.caption}</div>
                      )}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="col-2-12_lg"></div>
        </div>
      </div>
    </>
  )
}
