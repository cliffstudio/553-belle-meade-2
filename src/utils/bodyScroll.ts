/**
 * Utility functions to control body scroll
 * These functions work with the existing CSS scroll control system
 * and preserve scroll position when disabling/enabling scroll
 */

let scrollPosition = 0
let isScrollDisabled = false
let hasRestored = false
let restoreAnimationFrame: number | null = null
let scrollProtectionTimeout: ReturnType<typeof setTimeout> | null = null
let protectedScrollPosition: number | null = null
let scrollProtectionListener: (() => void) | null = null
let lastScrollPosition = 0

export function DisableBodyScroll(): void {
  // Cancel any pending restore or protection
  if (restoreAnimationFrame !== null) {
    cancelAnimationFrame(restoreAnimationFrame)
    restoreAnimationFrame = null
  }
  if (scrollProtectionTimeout !== null) {
    clearTimeout(scrollProtectionTimeout)
    scrollProtectionTimeout = null
  }
  
  // Remove scroll protection listener
  if (scrollProtectionListener) {
    window.removeEventListener('scroll', scrollProtectionListener)
    scrollProtectionListener = null
  }
  
  // Remove scroll protection
  protectedScrollPosition = null
  
  // Only save scroll position if scroll is currently enabled
  // This prevents overwriting the position if DisableBodyScroll is called multiple times
  if (!isScrollDisabled) {
    scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
    hasRestored = false // Reset restore flag when disabling
  }
  
  // Remove scroll-enabled class to trigger CSS
  document.documentElement.classList.remove('scroll-enabled')
  
  // Apply position: fixed to body to maintain visual position
  // Calculate scrollbar width to prevent layout shift
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollPosition}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }
  
  isScrollDisabled = true
}

/**
 * Clear the saved scroll position
 * This should be called when navigating to a new page via mobile menu
 * to prevent restoring the scroll position from the previous page
 */
export function ClearScrollPosition(): void {
  scrollPosition = 0
}

export function EnableBodyScroll(): void {
  // Only restore if scroll was actually disabled and we haven't already restored
  if (!isScrollDisabled || hasRestored) {
    return
  }
  
  // Mark as restored immediately to prevent multiple restorations
  hasRestored = true
  
  // Save the position we want to restore to
  const positionToRestore = scrollPosition
  
  // Add scroll-enabled class (always need to re-enable scrolling)
  document.documentElement.classList.add('scroll-enabled')
  
  // Remove fixed positioning and padding (always need to restore normal flow)
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.paddingRight = ''
  
  // If position is 0 or invalid, just reset scroll to top and return early
  if (!positionToRestore || positionToRestore === 0) {
    scrollPosition = 0
    isScrollDisabled = false
    // Reset scroll to top immediately
    restoreAnimationFrame = requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      })
      restoreAnimationFrame = null
    })
    return
  }
  
  // Restore scroll position immediately
  // Use a single RAF to ensure browser has processed style changes
  restoreAnimationFrame = requestAnimationFrame(() => {
    // Restore the scroll position
    window.scrollTo({
      top: positionToRestore,
      left: 0,
      behavior: 'auto'
    })
    
    // Protect scroll position from being reset
    protectedScrollPosition = positionToRestore
    lastScrollPosition = positionToRestore
    
    // Set up scroll event listener to prevent unexpected resets
    scrollProtectionListener = () => {
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      
      // If scroll was unexpectedly reset to 0 (not user scrolling)
      if (protectedScrollPosition !== null && currentScroll <= 10 && protectedScrollPosition > 10) {
        // Check if this is a sudden jump (not gradual scrolling)
        const scrollDelta = Math.abs(currentScroll - lastScrollPosition)
        
        // If scroll jumped from a high position to 0, restore it
        if (scrollDelta > 100 || (lastScrollPosition > 10 && currentScroll <= 10)) {
          window.scrollTo({
            top: protectedScrollPosition,
            left: 0,
            behavior: 'auto'
          })
        }
      } else if (currentScroll > 10) {
        // User is scrolling normally, update last known position
        lastScrollPosition = currentScroll
        
        // If user has scrolled significantly away from protected position, clear protection
        if (protectedScrollPosition !== null && Math.abs(currentScroll - protectedScrollPosition) > 50) {
          protectedScrollPosition = null
          if (scrollProtectionListener) {
            window.removeEventListener('scroll', scrollProtectionListener)
            scrollProtectionListener = null
          }
          if (scrollProtectionTimeout !== null) {
            clearTimeout(scrollProtectionTimeout)
            scrollProtectionTimeout = null
          }
        }
      }
      
      lastScrollPosition = currentScroll
    }
    
    window.addEventListener('scroll', scrollProtectionListener, { passive: true })
    
    // Keep protection active until user scrolls away
    // Don't clear on timeout - only clear when user actively scrolls away
    // This prevents ScrollTrigger.refresh() or other delayed operations from resetting scroll
    scrollProtectionTimeout = setTimeout(() => {
      // Check if user has scrolled away
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      if (Math.abs(currentScroll - positionToRestore) > 50) {
        // User has scrolled away, safe to clear
        protectedScrollPosition = null
        if (scrollProtectionListener) {
          window.removeEventListener('scroll', scrollProtectionListener)
          scrollProtectionListener = null
        }
        scrollProtectionTimeout = null
      } else {
        // Still at protected position - extend protection
        // Keep checking every 2 seconds until user scrolls away
        scrollProtectionTimeout = setTimeout(() => {
          const checkScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
          if (Math.abs(checkScroll - positionToRestore) > 50) {
            protectedScrollPosition = null
            if (scrollProtectionListener) {
              window.removeEventListener('scroll', scrollProtectionListener)
              scrollProtectionListener = null
            }
            scrollProtectionTimeout = null
          }
        }, 2000)
      }
    }, 5000) // Initial check after 5 seconds
    
    // Clear the saved position and flags after restoring
    scrollPosition = 0
    isScrollDisabled = false
    restoreAnimationFrame = null
  })
}
