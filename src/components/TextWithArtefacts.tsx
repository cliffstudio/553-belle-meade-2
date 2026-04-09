'use client'

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef } from 'react'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/sanity/utils/imageUrlBuilder'
import { videoUrlFor } from '@/sanity/utils/videoUrlBuilder'
import { SanityImage, SanityVideo, PortableTextBlock } from '../types/sanity'
import VideoControls from './VideoControls'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { portableTextComponents } from '../utils/portableTextComponents'
import { usePathname } from 'next/navigation'
import { DisableBodyScroll, EnableBodyScroll } from '../utils/bodyScroll'
import { isIOSDevice } from '../utils/deviceUtils'

// Extended types for fullscreen API
interface ExtendedDocument extends Document {
  webkitFullscreenElement?: Element | null
  msFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
}

interface ExtendedVideoElement extends HTMLVideoElement {
  _originalParent?: HTMLElement | null
  _affectedTriggers?: ScrollTrigger[]
  _opacityTriggers?: ScrollTrigger[]
  _scrollY?: number
  _fullscreenHandler?: () => void
  _originalCallbacks?: {
    onEnter?: unknown
    onEnterBack?: unknown
    onLeaveBack?: unknown
  }
}

interface Artefact {
  image?: SanityImage
  hoverImage?: SanityImage
  caption?: string
  title?: string
  description?: string
}

interface TextWithArtefactsProps {
  layout?: 'layout-1' | 'layout-2'
  desktopTitle?: string
  mobileTitle?: string
  backgroundMediaType?: 'image' | 'video'
  desktopBackgroundImage?: SanityImage
  mobileBackgroundImage?: SanityImage
  desktopBackgroundVideo?: SanityVideo
  videoSource?: 'file' | 'url'
  desktopBackgroundVideoUrl?: string
  desktopBackgroundVideoPlaceholder?: SanityImage
  showControls?: boolean
  overlayDarkness?: number
  body?: PortableTextBlock[]
  body2?: PortableTextBlock[]
  artefact1?: Artefact
  artefact2?: Artefact
  artefact3?: Artefact
  artefact4?: Artefact
  carouselIcon?: SanityImage
}

export default function TextWithArtefacts({
  layout = 'layout-1',
  desktopTitle,
  mobileTitle,
  backgroundMediaType,
  desktopBackgroundImage,
  mobileBackgroundImage,
  desktopBackgroundVideo,
  videoSource = 'file',
  desktopBackgroundVideoUrl,
  desktopBackgroundVideoPlaceholder,
  showControls,
  overlayDarkness,
  body,
  body2,
  artefact1,
  artefact2,
  artefact3,
  artefact4,
  carouselIcon
}: TextWithArtefactsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const desktopVideoRef = useRef<HTMLVideoElement>(null)
  const mobileVideoRef = useRef<HTMLVideoElement>(null)
  const artefactContentRef = useRef<HTMLDivElement>(null)
  const overlayMediaWrapRef = useRef<HTMLDivElement>(null)
  const videoControlsRef = useRef<HTMLDivElement>(null)
  const artefactDescriptionRef = useRef<HTMLParagraphElement>(null)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  
  // Video control state
  const [isPlaying, setIsPlaying] = React.useState(true)
  const [isMuted, setIsMuted] = React.useState(true)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const fullscreenVideoRef = useRef<HTMLVideoElement | null>(null)
  
  // Artefact overlay state
  const [selectedArtefact, setSelectedArtefact] = React.useState<Artefact | null>(null)
  const [isClosing, setIsClosing] = React.useState(false)
  const [isWidthCalculated, setIsWidthCalculated] = React.useState(false)
  const [imageOrientation, setImageOrientation] = React.useState<'portrait' | 'landscape' | 'square' | null>(null)
  const [viewportHeight, setViewportHeight] = React.useState<number | null>(null)
  
  // Video control functions
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (desktopVideoRef.current) {
      if (isPlaying) {
        desktopVideoRef.current.pause()
      } else {
        desktopVideoRef.current.play()
      }
    }
    if (mobileVideoRef.current) {
      if (isPlaying) {
        mobileVideoRef.current.pause()
      } else {
        mobileVideoRef.current.play()
      }
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (desktopVideoRef.current) {
      desktopVideoRef.current.muted = !isMuted
    }
    if (mobileVideoRef.current) {
      mobileVideoRef.current.muted = !isMuted
    }
  }

  const toggleFullscreen = async () => {
    console.log('TextWithArtefacts: toggleFullscreen called!')
    const desktopVideo = desktopVideoRef.current
    const mobileVideo = mobileVideoRef.current
    
    console.log('Desktop video:', desktopVideo)
    console.log('Mobile video:', mobileVideo)
    console.log('Window width:', window.innerWidth)
    console.log('isFullscreen state:', isFullscreen)
    
    // Determine which video to use based on screen size or availability
    const sourceVideo = window.innerWidth >= 768 ? desktopVideo : mobileVideo
    
    console.log('Source video:', sourceVideo)
    
    if (!sourceVideo) {
      console.error('No source video found!')
      return
    }
    
    console.log('Proceeding with fullscreen logic...')

    try {
      if (!isFullscreen) {
        // Save current scroll position and video state before entering fullscreen
        const scrollY = window.scrollY
        const videoWrap = sourceVideo.closest('.fill-space-video-wrap') as HTMLElement
        
        // Store the original parent of the video element
        const originalParent = sourceVideo.parentElement
        
        // Temporarily disable ScrollTrigger instances that might affect the video
        let affectedTriggers: ScrollTrigger[] = []
        // Also find ScrollTrigger instances that affect opacity-overlay
        let opacityTriggers: ScrollTrigger[] = []
        if (typeof window !== 'undefined' && ScrollTrigger) {
          const allTriggers = ScrollTrigger.getAll()
          affectedTriggers = allTriggers.filter(trigger => {
            const triggerElement = trigger.vars?.trigger as Element
            if (!triggerElement) return false
            
            // Check if trigger affects the video or its wrapper
            const isVideoRelated = 
              videoWrap?.contains(triggerElement) || 
              triggerElement.contains(sourceVideo) ||
              triggerElement.contains(videoWrap) ||
              (videoWrap && triggerElement === videoWrap) ||
              triggerElement === sourceVideo
            
            // Also check if trigger is pinning a parent element that contains the video
            const isPinningParent = trigger.vars?.pin && (
              triggerElement.contains(sourceVideo) ||
              triggerElement.contains(videoWrap)
            )
            
            return isVideoRelated || isPinningParent
          })
          
          // Find triggers that affect opacity-overlay (they have onEnter callbacks that modify opacity)
          const opacityOverlay = sourceVideo.closest('.hero-media-block')?.querySelector('.opacity-overlay') as HTMLElement
          if (opacityOverlay) {
            opacityTriggers = allTriggers.filter(trigger => {
              // Check if this trigger has callbacks that might affect the opacity-overlay
              const hasOpacityCallback = trigger.vars?.onEnter || trigger.vars?.onEnterBack
              if (!hasOpacityCallback) return false
              
              // Check if the trigger's element is related to the hero-media-block
              const triggerElement = trigger.vars?.trigger as Element
              if (!triggerElement) return false
              
              const heroBlock = sourceVideo.closest('.hero-media-block')
              return heroBlock && (
                heroBlock.contains(triggerElement) ||
                triggerElement.contains(heroBlock) ||
                triggerElement === heroBlock
              )
            })
            
            // Store original callbacks and replace them with no-ops to prevent doubling
            opacityTriggers.forEach((trigger) => {
              const extendedTrigger = trigger as ScrollTrigger & { _originalCallbacks?: ExtendedVideoElement['_originalCallbacks'] }
              if (!extendedTrigger._originalCallbacks) {
                extendedTrigger._originalCallbacks = {
                  onEnter: trigger.vars?.onEnter as unknown,
                  onEnterBack: trigger.vars?.onEnterBack as unknown,
                  onLeaveBack: trigger.vars?.onLeaveBack as unknown
                }
                // Replace callbacks with no-ops
                if (trigger.vars) {
                  trigger.vars.onEnter = () => {}
                  trigger.vars.onEnterBack = () => {}
                  trigger.vars.onLeaveBack = () => {}
                }
              }
            })
          }
          
          // Disable these specific triggers
          affectedTriggers.forEach((trigger) => trigger.disable())
          opacityTriggers.forEach((trigger) => trigger.disable())
          // Prevent ScrollTrigger from refreshing
          ScrollTrigger.config({ autoRefreshEvents: 'none' })
        }
        
        // Create a clone of the video element for fullscreen to avoid ScrollTrigger interference
        // This ensures the original stays in place and ScrollTrigger doesn't affect the fullscreen video
        const fullscreenVideoClone = sourceVideo.cloneNode(true) as HTMLVideoElement
        
        // Copy all important properties
        fullscreenVideoClone.src = sourceVideo.src
        fullscreenVideoClone.currentTime = sourceVideo.currentTime
        fullscreenVideoClone.muted = false
        fullscreenVideoClone.autoplay = true
        fullscreenVideoClone.loop = sourceVideo.loop
        fullscreenVideoClone.playsInline = false
        fullscreenVideoClone.controls = true
        fullscreenVideoClone.setAttribute('controls', '')
        
        // Set styles for fullscreen
        fullscreenVideoClone.style.position = 'fixed'
        fullscreenVideoClone.style.top = '0'
        fullscreenVideoClone.style.left = '0'
        fullscreenVideoClone.style.width = '100%'
        fullscreenVideoClone.style.height = '100%'
        fullscreenVideoClone.style.zIndex = '999999'
        fullscreenVideoClone.style.transform = 'none'
        fullscreenVideoClone.style.visibility = 'visible'
        fullscreenVideoClone.style.opacity = '1'
        fullscreenVideoClone.style.pointerEvents = 'auto'
        fullscreenVideoClone.className = ''
        
        // Add clone to body (not the original)
        document.body.appendChild(fullscreenVideoClone)
        
        // Wait for clone to be ready
        await new Promise<void>((resolve) => {
          if (fullscreenVideoClone.readyState >= 2) {
            resolve()
          } else {
            fullscreenVideoClone.addEventListener('loadedmetadata', () => resolve(), { once: true })
            // Also try to load the video
            fullscreenVideoClone.load()
          }
        })
        
        // Wait a moment for DOM to update
        await new Promise(resolve => setTimeout(resolve, 50))
        
        // Enter fullscreen with the clone
        console.log('Requesting fullscreen for video clone:', fullscreenVideoClone)
        console.log('Clone parent:', fullscreenVideoClone.parentElement)
        console.log('Clone controls:', fullscreenVideoClone.controls)
        
        if (fullscreenVideoClone.requestFullscreen) {
          await fullscreenVideoClone.requestFullscreen()
        } else if ('webkitRequestFullscreen' in fullscreenVideoClone) {
          await (fullscreenVideoClone as HTMLVideoElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen()
        } else if ('msRequestFullscreen' in fullscreenVideoClone) {
          await (fullscreenVideoClone as HTMLVideoElement & { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen()
        }
        
        console.log('Fullscreen entered. Fullscreen element:', document.fullscreenElement)
        
        // Ensure controls are visible after entering fullscreen - do this multiple times
        const ensureControls = () => {
          const doc = document as ExtendedDocument
          const isFullscreen = document.fullscreenElement === fullscreenVideoClone || 
              doc.webkitFullscreenElement === fullscreenVideoClone ||
              doc.msFullscreenElement === fullscreenVideoClone
          
          if (isFullscreen) {
            console.log('Ensuring controls are visible on clone...')
            // Remove and re-add controls to force browser to show them
            fullscreenVideoClone.removeAttribute('controls')
            fullscreenVideoClone.controls = false
            // Force a reflow
            void fullscreenVideoClone.offsetWidth
            fullscreenVideoClone.controls = true
            fullscreenVideoClone.setAttribute('controls', '')
            
            // Ensure video styles don't hide controls
            fullscreenVideoClone.style.visibility = 'visible'
            fullscreenVideoClone.style.opacity = '1'
            fullscreenVideoClone.style.pointerEvents = 'auto'
            
            // Log current state
            console.log('Clone controls attribute:', fullscreenVideoClone.getAttribute('controls'))
            console.log('Clone controls property:', fullscreenVideoClone.controls)
            console.log('Clone video styles:', {
              visibility: fullscreenVideoClone.style.visibility,
              opacity: fullscreenVideoClone.style.opacity,
              pointerEvents: fullscreenVideoClone.style.pointerEvents
            })
          }
        }
        
        // Set up a listener for fullscreen change to ensure controls appear
        const handleFullscreenEnter = () => {
          const doc = document as ExtendedDocument
          if (document.fullscreenElement === fullscreenVideoClone || 
              doc.webkitFullscreenElement === fullscreenVideoClone ||
              doc.msFullscreenElement === fullscreenVideoClone) {
            // Multiple attempts to ensure controls show
            ensureControls()
            setTimeout(ensureControls, 10)
            setTimeout(ensureControls, 50)
            setTimeout(ensureControls, 100)
            setTimeout(ensureControls, 200)
            setTimeout(ensureControls, 300)
            setTimeout(ensureControls, 500)
          }
        }
        
        document.addEventListener('fullscreenchange', handleFullscreenEnter)
        document.addEventListener('webkitfullscreenchange', handleFullscreenEnter)
        document.addEventListener('msfullscreenchange', handleFullscreenEnter)
        
        // Store handler for cleanup
        ;(fullscreenVideoClone as ExtendedVideoElement)._fullscreenHandler = handleFullscreenEnter
        
        // Initial attempts
        ensureControls()
        setTimeout(ensureControls, 10)
        setTimeout(ensureControls, 50)
        setTimeout(ensureControls, 100)
        setTimeout(ensureControls, 200)
        
        // Store reference to clone for cleanup
        fullscreenVideoRef.current = fullscreenVideoClone
        
        // Store data for restoration (on original video, not clone)
        ;(sourceVideo as ExtendedVideoElement)._originalParent = originalParent
        ;(sourceVideo as ExtendedVideoElement)._affectedTriggers = affectedTriggers
        ;(sourceVideo as ExtendedVideoElement)._opacityTriggers = opacityTriggers
        ;(sourceVideo as ExtendedVideoElement)._scrollY = scrollY
        
        setIsFullscreen(true)
        setIsMuted(false)
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ('webkitExitFullscreen' in document) {
          await (document as Document & { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen()
        } else if ('msExitFullscreen' in document) {
          await (document as Document & { msExitFullscreen: () => Promise<void> }).msExitFullscreen()
        }
        
        // Clean up the fullscreen video clone
        const fullscreenVideo = fullscreenVideoRef.current
        if (fullscreenVideo) {
          // Remove fullscreen change listener
          const fullscreenHandler = (fullscreenVideo as ExtendedVideoElement)._fullscreenHandler
          if (fullscreenHandler) {
            document.removeEventListener('fullscreenchange', fullscreenHandler)
            document.removeEventListener('webkitfullscreenchange', fullscreenHandler)
            document.removeEventListener('msfullscreenchange', fullscreenHandler)
          }
          
          // Remove clone from body
          if (fullscreenVideo.parentElement === document.body) {
            document.body.removeChild(fullscreenVideo)
          }
          fullscreenVideoRef.current = null
        }
        
        // Restore ScrollTrigger instances and refresh
        const originalVideo = window.innerWidth >= 768 ? desktopVideoRef.current : mobileVideoRef.current
        const affectedTriggers = (originalVideo as ExtendedVideoElement)?._affectedTriggers || []
        const opacityTriggers = (originalVideo as ExtendedVideoElement)?._opacityTriggers || []
        const savedScrollY = (originalVideo as ExtendedVideoElement)?._scrollY
        
        if (typeof window !== 'undefined' && ScrollTrigger) {
          // Restore scroll position first
          if (savedScrollY !== undefined) {
            window.scrollTo(0, savedScrollY)
          }
          
          // Fix opacity-overlay BEFORE re-enabling triggers and refreshing
          const opacityOverlay = originalVideo?.closest('.hero-media-block')?.querySelector('.opacity-overlay') as HTMLElement
          if (opacityOverlay) {
            // Get the original overlayDarkness value
            const overlayDarknessAttr = opacityOverlay.getAttribute('data-overlay-darkness')
            const overlayDarknessValue = overlayDarknessAttr ? parseFloat(overlayDarknessAttr) : (overlayDarkness || 0.3)
            const targetOpacity = Math.min(overlayDarknessValue, 1)
            
            // Kill any GSAP animations on the overlay
            gsap.killTweensOf(opacityOverlay)
            // Set opacity directly to prevent ScrollTrigger from doubling it
            opacityOverlay.style.opacity = String(targetOpacity)
          }
          
          // Small delay before re-enabling and refreshing to ensure opacity is set
          setTimeout(() => {
            // Restore original callbacks for opacity triggers BEFORE re-enabling
            opacityTriggers.forEach((trigger) => {
              const extendedTrigger = trigger as ScrollTrigger & { _originalCallbacks?: ExtendedVideoElement['_originalCallbacks'] }
              const originalCallbacks = extendedTrigger._originalCallbacks
              if (originalCallbacks && trigger.vars) {
                trigger.vars.onEnter = originalCallbacks.onEnter as typeof trigger.vars.onEnter
                trigger.vars.onEnterBack = originalCallbacks.onEnterBack as typeof trigger.vars.onEnterBack
                trigger.vars.onLeaveBack = originalCallbacks.onLeaveBack as typeof trigger.vars.onLeaveBack
                delete extendedTrigger._originalCallbacks
              }
            })
            
            // Re-enable the affected triggers
            affectedTriggers.forEach((trigger) => trigger.enable())
            // Re-enable opacity triggers
            opacityTriggers.forEach((trigger) => trigger.enable())
            // Restore ScrollTrigger refresh events
            ScrollTrigger.config({ autoRefreshEvents: 'resize,visibilitychange,DOMContentLoaded,load' })
            
            // Refresh ScrollTrigger
            ScrollTrigger.refresh()
            
            // Immediately after refresh, reset opacity again to catch any callbacks
            if (opacityOverlay) {
              const overlayDarknessAttr = opacityOverlay.getAttribute('data-overlay-darkness')
            const overlayDarknessValue = overlayDarknessAttr ? parseFloat(overlayDarknessAttr) : (overlayDarkness || 0.3)
              const targetOpacity = Math.min(overlayDarknessValue, 1)
              gsap.killTweensOf(opacityOverlay)
              opacityOverlay.style.opacity = String(targetOpacity)
            }
            
            // Ensure original video is visible and playing after ScrollTrigger refresh
            if (originalVideo) {
              // Reset any transforms that might have been applied to video
              originalVideo.style.transform = ''
              originalVideo.style.visibility = 'visible'
              originalVideo.style.opacity = '1'
              
              // Also fix the video wrapper if it exists
              const videoWrap = originalVideo.closest('.fill-space-video-wrap') as HTMLElement
              if (videoWrap) {
                videoWrap.style.transform = ''
                videoWrap.style.visibility = 'visible'
                videoWrap.style.opacity = '1'
              }
              
              // Ensure video is playing
              if (originalVideo.paused) {
                originalVideo.play().catch(() => {})
              }
            }
            
            // Reset opacity one more time after a short delay to catch any delayed callbacks
            if (opacityOverlay) {
              setTimeout(() => {
                const overlayDarknessAttr = opacityOverlay.getAttribute('data-overlay-darkness')
            const overlayDarknessValue = overlayDarknessAttr ? parseFloat(overlayDarknessAttr) : (overlayDarkness || 0.3)
                const targetOpacity = Math.min(overlayDarknessValue, 1)
                gsap.killTweensOf(opacityOverlay)
                opacityOverlay.style.opacity = String(targetOpacity)
              }, 100)
            }
          }, 50)
        } else {
          // If ScrollTrigger not available, still restore video
          if (originalVideo) {
            originalVideo.style.transform = ''
            originalVideo.style.visibility = 'visible'
            originalVideo.style.opacity = '1'
            const videoWrap = originalVideo.closest('.fill-space-video-wrap') as HTMLElement
            if (videoWrap) {
              videoWrap.style.transform = ''
              videoWrap.style.visibility = 'visible'
              videoWrap.style.opacity = '1'
            }
            
            // Fix opacity-overlay if it exists (might be set to 2 by ScrollTrigger)
            const opacityOverlay = originalVideo.closest('.hero-media-block')?.querySelector('.opacity-overlay') as HTMLElement
            if (opacityOverlay) {
              // Get the original overlayDarkness value
              const overlayDarknessAttr = opacityOverlay.getAttribute('data-overlay-darkness')
            const overlayDarknessValue = overlayDarknessAttr ? parseFloat(overlayDarknessAttr) : (overlayDarkness || 0.3)
              const targetOpacity = Math.min(overlayDarknessValue, 1)
              
              // Kill any GSAP animations on the overlay
              gsap.killTweensOf(opacityOverlay)
              
              // Reset opacity multiple times to catch ScrollTrigger's callback
              const resetOpacity = () => {
                gsap.killTweensOf(opacityOverlay)
                opacityOverlay.style.opacity = String(targetOpacity)
              }
              
              // Reset immediately
              resetOpacity()
              
              // Reset after delays to catch ScrollTrigger callbacks
              setTimeout(resetOpacity, 100)
              setTimeout(resetOpacity, 200)
              setTimeout(resetOpacity, 300)
            }
            
            if (originalVideo.paused) {
              originalVideo.play().catch(() => {})
            }
          }
        }
        
        setIsFullscreen(false)
        setIsMuted(true)
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
      // Restore ScrollTrigger on error
      const originalVideo = window.innerWidth >= 768 ? desktopVideoRef.current : mobileVideoRef.current
      const affectedTriggers = (originalVideo as ExtendedVideoElement)?._affectedTriggers || []
      const opacityTriggers = (originalVideo as ExtendedVideoElement)?._opacityTriggers || []
      const savedScrollY = (originalVideo as ExtendedVideoElement)?._scrollY
      
      if (typeof window !== 'undefined' && ScrollTrigger) {
        // Restore scroll position if saved
        if (savedScrollY !== undefined) {
          window.scrollTo(0, savedScrollY)
        }
        
        // Fix opacity-overlay before re-enabling triggers
        const opacityOverlay = originalVideo?.closest('.hero-media-block')?.querySelector('.opacity-overlay') as HTMLElement
        if (opacityOverlay) {
          const overlayDarknessAttr = opacityOverlay.getAttribute('data-overlay-darkness')
          const overlayDarknessValue = overlayDarknessAttr ? parseFloat(overlayDarknessAttr) : (overlayDarkness || 0.3)
          const targetOpacity = Math.min(overlayDarknessValue, 1)
          gsap.killTweensOf(opacityOverlay)
          opacityOverlay.style.opacity = String(targetOpacity)
        }
        
        // Restore original callbacks for opacity triggers
        opacityTriggers.forEach((trigger) => {
          const extendedTrigger = trigger as ScrollTrigger & { _originalCallbacks?: ExtendedVideoElement['_originalCallbacks'] }
          const originalCallbacks = extendedTrigger._originalCallbacks
          if (originalCallbacks && trigger.vars) {
            trigger.vars.onEnter = originalCallbacks.onEnter as typeof trigger.vars.onEnter
            trigger.vars.onEnterBack = originalCallbacks.onEnterBack as typeof trigger.vars.onEnterBack
            trigger.vars.onLeaveBack = originalCallbacks.onLeaveBack as typeof trigger.vars.onLeaveBack
            delete extendedTrigger._originalCallbacks
          }
        })
        
        // Re-enable the affected triggers
        affectedTriggers.forEach((trigger) => trigger.enable())
        opacityTriggers.forEach((trigger) => trigger.enable())
        // Restore ScrollTrigger refresh events
        ScrollTrigger.config({ autoRefreshEvents: 'resize,visibilitychange,DOMContentLoaded,load' })
        // Refresh ScrollTrigger after moving element back
        ScrollTrigger.refresh(true)
      }
      
      setIsFullscreen(false)
      setIsMuted(true)
    }
  }

  // Artefact click handler
  const handleArtefactClick = (artefactData: Artefact | null, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (artefactData) {
      // If clicking the same artefact, close it; otherwise, open the new one
      if (selectedArtefact === artefactData) {
        handleCloseOverlay(e as React.MouseEvent)
      } else {
        setIsClosing(false)
        setIsWidthCalculated(false)
        setImageOrientation(null) // Reset orientation when opening new artefact
        setSelectedArtefact(artefactData)
      }
    }
  }
  
  // Close overlay handler
  const handleCloseOverlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsClosing(true)
    // Wait for closing animation to complete before removing from DOM
    // Inner-wrap: 0.4s, then overlay: 0.3s starting at 0.4s = 0.7s total
    setTimeout(() => {
      setSelectedArtefact(null)
      setIsClosing(false)
      setIsWidthCalculated(false)
      setImageOrientation(null)
    }, 700) // Match total animation duration (0.4s inner-wrap + 0.3s overlay = 700ms)
  }
  
  // Effect to detect image orientation
  useEffect(() => {
    if (!selectedArtefact?.image || !overlayMediaWrapRef.current) {
      setImageOrientation(null)
      return
    }

    // Capture ref value to avoid stale closure warning
    const mediaWrapElement = overlayMediaWrapRef.current

    const img = mediaWrapElement.querySelector('img') as HTMLImageElement
    if (!img) {
      setImageOrientation(null)
      return
    }

    const detectOrientation = () => {
      if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
        return
      }

      const width = img.naturalWidth
      const height = img.naturalHeight
      
      // Remove existing orientation classes
      mediaWrapElement.classList.remove('portrait', 'landscape', 'square')
      
      // Determine and apply orientation class
      let orientation: 'portrait' | 'landscape' | 'square'
      if (width === height) {
        mediaWrapElement.classList.add('square')
        orientation = 'square'
      } else if (width > height) {
        mediaWrapElement.classList.add('landscape')
        orientation = 'landscape'
      } else {
        mediaWrapElement.classList.add('portrait')
        orientation = 'portrait'
      }
      
      setImageOrientation(orientation)
    }

    // Check if image is already loaded
    if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      detectOrientation()
    } else {
      // Wait for image to load
      img.addEventListener('load', detectOrientation, { once: true })
    }

    return () => {
      // Cleanup: remove orientation classes
      if (mediaWrapElement) {
        mediaWrapElement.classList.remove('portrait', 'landscape', 'square')
      }
    }
  }, [selectedArtefact])

  // Lock background scroll when overlay is open
  useEffect(() => {
    if (selectedArtefact) {
      // Capture viewport height before opening modal to prevent iOS layout shifts
      // This fixes the issue where iOS viewport height changes when browser UI shows/hides
      const capturedHeight = window.innerHeight
      setViewportHeight(capturedHeight)
      
      // Disable ScrollTrigger instances to prevent them from recalculating when body becomes fixed
      // This prevents layout shifts when the body position changes
      const triggers = ScrollTrigger.getAll()
      triggers.forEach(trigger => {
        // Disable without resetting position - this preserves the pinned state
        trigger.disable(false)
      })
      DisableBodyScroll()
    } else {
      // Clear viewport height when closing
      setViewportHeight(null)
      EnableBodyScroll()
      // Re-enable ScrollTrigger after a short delay to allow body styles to settle
      setTimeout(() => {
        const triggers = ScrollTrigger.getAll()
        triggers.forEach(trigger => {
          trigger.enable()
        })
        // Update ScrollTrigger to sync with any layout changes
        ScrollTrigger.update()
      }, 100)
    }

    return () => {
      // Ensure scroll is enabled on unmount
      EnableBodyScroll()
      // Re-enable ScrollTrigger on cleanup
      const triggers = ScrollTrigger.getAll()
      triggers.forEach(trigger => {
        trigger.enable()
      })
      ScrollTrigger.update()
    }
  }, [selectedArtefact])

  // Enable wheel scrolling on artefact description
  useEffect(() => {
    const descriptionElement = artefactDescriptionRef.current
    if (!descriptionElement) return

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
      if (!descriptionElement.contains(target)) return
      
      const { scrollHeight, clientHeight } = descriptionElement
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
    descriptionElement.addEventListener('wheel', handleWheel, { passive: false, capture: true })
    // Listen on document for touchmove to run before document-level handlers
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true })

    return () => {
      descriptionElement.removeEventListener('wheel', handleWheel, { capture: true } as EventListenerOptions)
      document.removeEventListener('touchmove', handleTouchMove, { capture: true } as EventListenerOptions)
    }
  }, [selectedArtefact])

  // Effect to calculate and set width when overlay content is injected
  useEffect(() => {
    if (!selectedArtefact || !artefactContentRef.current) return

    const contentElement = artefactContentRef.current
    
    // Ensure content is hidden initially (in case it's not already)
    // Keep visibility hidden for layout, but let CSS animation handle opacity
    contentElement.style.opacity = ''
    contentElement.style.visibility = 'hidden'
    
    // Function to calculate and set width based on content
    const calculateWidth = () => {
      // Don't calculate width on mobile portrait - let CSS handle it
      if (window.innerWidth <= 768 && window.matchMedia('(orientation: portrait)').matches) {
        // On mobile portrait, use CSS fit-content and don't set explicit width
        contentElement.style.width = ''
        contentElement.style.opacity = '' // Remove inline opacity to let CSS animation handle it
        contentElement.style.visibility = 'visible'
        setIsWidthCalculated(true)
        return
      }

      // Temporarily remove inline width to allow browser to recalculate fit-content
      const hasInlineWidth = contentElement.style.width
      contentElement.style.width = ''
      
      // Get computed styles to account for padding
      const computedStyle = window.getComputedStyle(contentElement)
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
      const paddingRight = parseFloat(computedStyle.paddingRight) || 0
      
      // Measure all children to get their natural widths
      const mediaWrap = contentElement.querySelector('.media-wrap') as HTMLElement
      const textWrap = contentElement.querySelector('.text-wrap') as HTMLElement
      const columnGap = parseFloat(computedStyle.columnGap) || 0
      
      // Ensure text-wrap maintains its CSS width during measurement
      // by temporarily setting a wide parent width
      contentElement.style.width = '2000px' // Wide enough to let children size naturally
      
      // Force a reflow to ensure layout is settled
      void contentElement.offsetWidth
      
      // Start with padding
      let totalWidth = paddingLeft + paddingRight
      
      // Count how many child elements we have
      const hasMedia = mediaWrap && mediaWrap.offsetWidth > 0
      const hasText = textWrap && textWrap.offsetWidth > 0
      const childCount = (hasMedia ? 1 : 0) + (hasText ? 1 : 0)
      
      // Add media wrap width if it exists
      if (hasMedia) {
        const mediaRect = mediaWrap.getBoundingClientRect()
        totalWidth += mediaRect.width
      }
      
      // Add column gap if we have multiple children
      if (childCount > 1) {
        totalWidth += columnGap
      }
      
      // Add text wrap width if it exists - use the computed CSS width (which is responsive)
      if (hasText) {
        const textWrapStyle = window.getComputedStyle(textWrap)
        // Use the computed width which respects media queries, or min-width as fallback
        const textWrapWidth = parseFloat(textWrapStyle.width) || parseFloat(textWrapStyle.minWidth) || 0
        // Only use if we have a valid width value
        if (textWrapWidth > 0) {
          totalWidth += textWrapWidth
        } else {
          // Last resort: measure the actual rendered width
          const textWrapRect = textWrap.getBoundingClientRect()
          if (textWrapRect.width > 0) {
            totalWidth += textWrapRect.width
          }
        }
      }
      
      // Fallback: use scrollWidth if calculation failed, which includes padding
      if (totalWidth <= paddingLeft + paddingRight) {
        totalWidth = contentElement.scrollWidth
      }
      
      // Reset parent width
      contentElement.style.width = ''
      
      // Set the calculated width explicitly
      if (totalWidth > 0) {
        contentElement.style.width = `${totalWidth}px`
      } else if (hasInlineWidth) {
        // Restore original if measurement failed
        contentElement.style.width = hasInlineWidth
      }
      
      // Force another reflow to ensure width is applied
      void contentElement.offsetWidth
      
      // Use requestAnimationFrame to smoothly show content after width is set
      requestAnimationFrame(() => {
        contentElement.style.opacity = '' // Remove inline opacity to let CSS animation handle it
        contentElement.style.visibility = 'visible'
        setIsWidthCalculated(true)
      })
    }

    // If there's an image, wait for it to load before calculating
    const imageElement = contentElement.querySelector('.media-wrap img') as HTMLImageElement
    if (imageElement) {
      if (imageElement.complete && imageElement.naturalWidth > 0) {
        // Image already loaded - calculate after a small delay to ensure layout is complete
        setTimeout(calculateWidth, 100)
      } else {
        // Wait for image to load
        const handleImageLoad = () => {
          setTimeout(calculateWidth, 100)
        }
        imageElement.addEventListener('load', handleImageLoad, { once: true })
        imageElement.addEventListener('error', () => {
          // Even if image fails, calculate width for other content
          setTimeout(calculateWidth, 100)
        }, { once: true })
      }
    } else {
      // No image, calculate after a small delay to ensure content is rendered
      setTimeout(calculateWidth, 100)
    }

    // Also recalculate on window resize to handle responsive breakpoints
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      // Debounce resize to avoid too many calculations
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        calculateWidth()
      }, 150)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
  }, [selectedArtefact])
  
  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as ExtendedDocument
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.msFullscreenElement
      )
      
      if (!isCurrentlyFullscreen && isFullscreen) {
        // User exited fullscreen via browser controls (ESC key or browser button)
        const fullscreenVideo = fullscreenVideoRef.current
        
        if (fullscreenVideo) {
          // Remove fullscreen change listener
          const fullscreenHandler = (fullscreenVideo as ExtendedVideoElement)._fullscreenHandler
          if (fullscreenHandler) {
            document.removeEventListener('fullscreenchange', fullscreenHandler)
            document.removeEventListener('webkitfullscreenchange', fullscreenHandler)
            document.removeEventListener('msfullscreenchange', fullscreenHandler)
          }
          
          // Remove clone from body
          if (fullscreenVideo.parentElement === document.body) {
            document.body.removeChild(fullscreenVideo)
          }
          fullscreenVideoRef.current = null
        }
        
        // Restore ScrollTrigger instances and refresh
        const originalVideo = window.innerWidth >= 768 ? desktopVideoRef.current : mobileVideoRef.current
        const affectedTriggers = (originalVideo as ExtendedVideoElement)?._affectedTriggers || []
        const opacityTriggers = (originalVideo as ExtendedVideoElement)?._opacityTriggers || []
        const savedScrollY = (originalVideo as ExtendedVideoElement)?._scrollY
        
        if (typeof window !== 'undefined' && ScrollTrigger) {
          // Restore scroll position first
          if (savedScrollY !== undefined) {
            window.scrollTo(0, savedScrollY)
          }
          
          // Fix opacity-overlay BEFORE re-enabling triggers and refreshing
          const opacityOverlay = originalVideo?.closest('.hero-media-block')?.querySelector('.opacity-overlay') as HTMLElement
          if (opacityOverlay) {
            // Get the original overlayDarkness value
            const overlayDarknessAttr = opacityOverlay.getAttribute('data-overlay-darkness')
            const overlayDarknessValue = overlayDarknessAttr ? parseFloat(overlayDarknessAttr) : (overlayDarkness || 0.3)
            const targetOpacity = Math.min(overlayDarknessValue, 1)
            
            // Kill any GSAP animations on the overlay
            gsap.killTweensOf(opacityOverlay)
            // Set opacity directly to prevent ScrollTrigger from doubling it
            opacityOverlay.style.opacity = String(targetOpacity)
          }
          
          // Small delay before re-enabling and refreshing to ensure opacity is set
          setTimeout(() => {
            // Restore original callbacks for opacity triggers BEFORE re-enabling
            opacityTriggers.forEach((trigger) => {
              const extendedTrigger = trigger as ScrollTrigger & { _originalCallbacks?: ExtendedVideoElement['_originalCallbacks'] }
              const originalCallbacks = extendedTrigger._originalCallbacks
              if (originalCallbacks && trigger.vars) {
                trigger.vars.onEnter = originalCallbacks.onEnter as typeof trigger.vars.onEnter
                trigger.vars.onEnterBack = originalCallbacks.onEnterBack as typeof trigger.vars.onEnterBack
                trigger.vars.onLeaveBack = originalCallbacks.onLeaveBack as typeof trigger.vars.onLeaveBack
                delete extendedTrigger._originalCallbacks
              }
            })
            
            // Re-enable the affected triggers
            affectedTriggers.forEach((trigger) => trigger.enable())
            // Re-enable opacity triggers
            opacityTriggers.forEach((trigger) => trigger.enable())
            // Restore ScrollTrigger refresh events
            ScrollTrigger.config({ autoRefreshEvents: 'resize,visibilitychange,DOMContentLoaded,load' })
            
            // Refresh ScrollTrigger
            ScrollTrigger.refresh()
            
            // Immediately after refresh, reset opacity again to catch any callbacks
            if (opacityOverlay) {
              const overlayDarknessAttr = opacityOverlay.getAttribute('data-overlay-darkness')
              const overlayDarknessValue = overlayDarknessAttr ? parseFloat(overlayDarknessAttr) : (overlayDarkness || 0.3)
              const targetOpacity = Math.min(overlayDarknessValue, 1)
              gsap.killTweensOf(opacityOverlay)
              opacityOverlay.style.opacity = String(targetOpacity)
            }
            
            // Ensure original video is visible and playing after ScrollTrigger refresh
            if (originalVideo) {
              // Reset any transforms that might have been applied to video
              originalVideo.style.transform = ''
              originalVideo.style.visibility = 'visible'
              originalVideo.style.opacity = '1'
              
              // Also fix the video wrapper if it exists
              const videoWrap = originalVideo.closest('.fill-space-video-wrap') as HTMLElement
              if (videoWrap) {
                videoWrap.style.transform = ''
                videoWrap.style.visibility = 'visible'
                videoWrap.style.opacity = '1'
              }
              
              // Ensure video is playing
              if (originalVideo.paused) {
                originalVideo.play().catch(() => {})
              }
            }
            
            // Reset opacity one more time after a short delay to catch any delayed callbacks
            if (opacityOverlay) {
              setTimeout(() => {
                const overlayDarknessAttr = opacityOverlay.getAttribute('data-overlay-darkness')
                const overlayDarknessValue = overlayDarknessAttr ? parseFloat(overlayDarknessAttr) : (overlayDarkness || 0.3)
                const targetOpacity = Math.min(overlayDarknessValue, 1)
                gsap.killTweensOf(opacityOverlay)
                opacityOverlay.style.opacity = String(targetOpacity)
              }, 100)
            }
          }, 50)
        } else {
          // If ScrollTrigger not available, still restore video
          if (originalVideo) {
            originalVideo.style.transform = ''
            originalVideo.style.visibility = 'visible'
            originalVideo.style.opacity = '1'
            const videoWrap = originalVideo.closest('.fill-space-video-wrap') as HTMLElement
            if (videoWrap) {
              videoWrap.style.transform = ''
              videoWrap.style.visibility = 'visible'
              videoWrap.style.opacity = '1'
            }
            
            // Fix opacity-overlay if it exists (might be set to 2 by ScrollTrigger)
            const opacityOverlay = originalVideo.closest('.hero-media-block')?.querySelector('.opacity-overlay') as HTMLElement
            if (opacityOverlay) {
              // Get the original overlayDarkness value
              const overlayDarknessAttr = opacityOverlay.getAttribute('data-overlay-darkness')
              const overlayDarknessValue = overlayDarknessAttr ? parseFloat(overlayDarknessAttr) : (overlayDarkness || 0.3)
              const targetOpacity = Math.min(overlayDarknessValue, 1)
              
              // Kill any GSAP animations on the overlay
              gsap.killTweensOf(opacityOverlay)
              
              // Reset opacity multiple times to catch ScrollTrigger's callback
              const resetOpacity = () => {
                gsap.killTweensOf(opacityOverlay)
                opacityOverlay.style.opacity = String(targetOpacity)
              }
              
              // Reset immediately
              resetOpacity()
              
              // Reset after delays to catch ScrollTrigger callbacks
              setTimeout(resetOpacity, 100)
              setTimeout(resetOpacity, 200)
              setTimeout(resetOpacity, 300)
            }
            
            if (originalVideo.paused) {
              originalVideo.play().catch(() => {})
            }
          }
        }
        
        setIsFullscreen(false)
        setIsMuted(true)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [isFullscreen, overlayDarkness])
  
  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger)
    
    // Fix any video elements that might have been shifted by GSAP transforms
    const fixVideoPositions = () => {
      // Scope to this component instance to avoid affecting other instances
      const videoWraps = sectionRef.current?.querySelectorAll('.fill-space-video-wrap')
      if (videoWraps) {
        videoWraps.forEach((wrap: Element) => {
          const element = wrap as HTMLElement
          const computedStyle = window.getComputedStyle(element)
          const transform = computedStyle.transform
          
          // Reset transforms that might be causing issues
          // Check if transform contains a large translateY value (indicating unwanted shift)
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
          
          // Ensure the element is not positioned off-screen
          const rect = element.getBoundingClientRect()
          const viewportHeight = window.innerHeight
          const viewportWidth = window.innerWidth
          
          // If element is completely outside viewport, reset its transform
          if (rect.bottom < 0 || rect.top > viewportHeight || rect.right < 0 || rect.left > viewportWidth) {
            // Only reset if it's way off screen (likely a ScrollTrigger issue)
            if (Math.abs(rect.top) > viewportHeight * 2 || Math.abs(rect.bottom) > viewportHeight * 2) {
              element.style.transform = 'none'
            }
          }
        })
      }
    }
    
    // Fix positions immediately and after a short delay
    fixVideoPositions()
    setTimeout(fixVideoPositions, 100)
    
    // Function to setup ScrollTrigger with proper timing
    const setupScrollTriggerEffects = () => {
      const videoControls = videoControlsRef.current
      
      // Show/hide video controls based on section visibility (for heritage and carousel pages)
      if (videoControls && showControls && (document.body.classList.contains('page-carousel') || document.body.classList.contains('page-heritage'))) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          onEnter: () => {
            gsap.to(videoControls, {
              opacity: 1,
              visibility: 'visible',
              duration: 0.3,
              ease: "power2.out"
            })
          },
          onLeave: () => {
            gsap.to(videoControls, {
              opacity: 0,
              visibility: 'hidden',
              duration: 0.3,
              ease: "power2.out"
            })
          },
          onEnterBack: () => {
            gsap.to(videoControls, {
              opacity: 1,
              visibility: 'visible',
              duration: 0.3,
              ease: "power2.out"
            })
          },
          onLeaveBack: () => {
            gsap.to(videoControls, {
              opacity: 0,
              visibility: 'hidden',
              duration: 0.3,
              ease: "power2.out"
            })
          }
        })
      }
      
      // Only apply ScrollTrigger for carousel page
      if (document.body.classList.contains('page-carousel') || document.body.classList.contains('page-heritage')) {
       // Scope selectors to this component instance to avoid conflicts with multiple instances
       const pageCarouselHeroElements = sectionRef.current?.querySelectorAll('.hero-media-block .media-wrap, .hero-media-block .opacity-overlay')
       const textBlock = sectionRef.current?.querySelector('.text-block')
       const textBlockScroll = sectionRef.current?.querySelector('.text-block-scroll')
       const artefactsGrid = sectionRef.current?.querySelector('.artefacts-grid')
       const carouselImage = sectionRef.current?.querySelector('.carousel-image')
       const footer = document.querySelector('.site-footer')
       
        if (pageCarouselHeroElements && pageCarouselHeroElements.length > 0 && textBlock && artefactsGrid && footer) {
          // Wait for lazy images to load before setting up ScrollTriggers
          const setupScrollTriggers = () => {
            // 1. Pin hero / media block elements when they reach viewport top
            pageCarouselHeroElements.forEach((element: Element) => {
              ScrollTrigger.create({
                trigger: element,
                start: "top top",
                endTrigger: footer,
                end: "bottom bottom",
                pin: true,
                pinSpacing: false,
              })
            })
            
            // Video controls are now fixed to viewport, so no pinning needed
          
            // 1.5. Pin text-block-scroll (text 1) for Layout 1 - pin for 3 viewport heights before scrolling away
            // Only on desktop (not iOS devices)
            if (layout === 'layout-1' && textBlockScroll && window.innerWidth > 768 && !isIOSDevice()) {
              ScrollTrigger.create({
                trigger: textBlockScroll,
                start: "top top",
                end: "+=300vh", // Pin for 3 viewport heights (300vh)
                pin: true,
                pinSpacing: true, // Use pinSpacing so it takes up space in the scroll
              })
            }
          
            // 2. Pin text block (text 2) when it reaches viewport top (only on screens larger than 768px, not iOS)
            if (window.innerWidth > 768 && !isIOSDevice()) {
              const opacityOverlay = sectionRef.current?.querySelector('.opacity-overlay') as HTMLElement
              
              if (opacityOverlay) {
                // Get the original overlayDarkness value from the attribute or prop
                const overlayDarknessAttr = opacityOverlay.getAttribute('data-overlay-darkness')
                const initialOpacity = overlayDarknessAttr ? parseFloat(overlayDarknessAttr) : (overlayDarkness || 0.3)
                
                ScrollTrigger.create({
                  trigger: textBlock,
                  start: "top top",
                  endTrigger: footer,
                  end: "bottom bottom",
                  pin: true,
                  pinSpacing: false,
                  onEnter: () => {
                    // Double the opacity when text block pins
                    gsap.to(opacityOverlay, {
                      opacity: initialOpacity * 2,
                      duration: 1,
                      ease: "cubic-bezier(0.25,0.1,0.25,1)"
                    })
                  },
                  onLeaveBack: () => {
                    // Restore original opacity when scrolling back up
                    gsap.to(opacityOverlay, {
                      opacity: initialOpacity,
                      duration: 1,
                      ease: "cubic-bezier(0.25,0.1,0.25,1)"
                    })
                  }
                })
              } else {
                // Fallback: pin without opacity animation if overlay not found
                ScrollTrigger.create({
                  trigger: textBlock,
                  start: "top top",
                  endTrigger: footer,
                  end: "bottom bottom",
                  pin: true,
                  pinSpacing: false,
                })
              }
            }

            // 3. Pin artefacts grid when it reaches viewport bottom (only on desktop, not iOS)
            if (window.innerWidth > 768 && !isIOSDevice()) {
              ScrollTrigger.create({
                trigger: artefactsGrid,
                start: "bottom bottom",
                endTrigger: footer,
                end: "bottom bottom",
                pin: true,
                pinSpacing: false,
              })
            }

            // 4. Pin artefacts grid and carousel icon on mobile when they reach viewport bottom
            if (window.innerWidth <= 768) {
              // Pin artefacts grid on mobile
              ScrollTrigger.create({
                trigger: artefactsGrid,
                start: "bottom bottom",
                endTrigger: footer,
                end: "bottom bottom",
                pin: true,
                pinSpacing: false,
              })

              // Pin carousel icon on mobile (if it exists)
              if (carouselImage) {
                ScrollTrigger.create({
                  trigger: carouselImage,
                  start: "top top",
                  endTrigger: footer,
                  end: "bottom bottom",
                  pin: true,
                  pinSpacing: false,
                })
              }
            }

          }

          // Check if lazy images exist and wait for them to load
          const lazyImages = artefactsGrid.querySelectorAll('img.lazy')
          if (lazyImages.length > 0) {
            let loadedImages = 0
            const totalImages = lazyImages.length
            
            const checkAllImagesLoaded = () => {
              loadedImages++
              if (loadedImages === totalImages) {
                // All lazy images loaded, now setup ScrollTrigger
                setTimeout(setupScrollTriggers, 100) // small delay to ensure layout is complete
              }
            }
            
            lazyImages.forEach((img: Element) => {
              img.addEventListener('load', checkAllImagesLoaded)
              // Also check if already loaded
              if ((img as HTMLImageElement).complete) {
                checkAllImagesLoaded()
              }
            })
            
            // Fallback: setup triggers after timeout even if images don't all load
            setTimeout(() => {
              if (loadedImages < totalImages) {
                console.warn('Some lazy images failed to load, setting up ScrollTrigger anyway')
                setupScrollTriggers()
              }
            }, 3000)
          } else {
            // No lazy images, setup triggers immediately
            setupScrollTriggers()
          }
        }
      }
    }
    
    // Initial setup with delay to ensure body classes are applied
    const initialTimer = setTimeout(() => {
      setupScrollTriggerEffects()
    }, 200)
    
    // Handle window resize to reinitialize animations if needed
    const handleResize = () => {
      // Debounce resize handler
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        // Fix video positions before killing ScrollTriggers
        fixVideoPositions()
        
        // Kill all ScrollTrigger instances scoped to this component
        // Only kill triggers that are related to this section
        const allTriggers = ScrollTrigger.getAll()
        allTriggers.forEach(trigger => {
          const triggerElement = trigger.vars?.trigger as Element
          if (triggerElement && sectionRef.current?.contains(triggerElement)) {
            trigger.kill()
          }
        })
        
        // Refresh ScrollTrigger to recalculate positions
        ScrollTrigger.refresh()
        
        // Reinitialize ScrollTrigger effects after a delay
        setTimeout(() => {
          setupScrollTriggerEffects()
          // Fix video positions again after ScrollTrigger reinitializes
          setTimeout(fixVideoPositions, 150)
        }, 100)
      }, 150) // Debounce delay
    }

    window.addEventListener('resize', handleResize)

    // Cleanup function
    const currentSectionRef = sectionRef.current
    return () => {
      clearTimeout(initialTimer)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      window.removeEventListener('resize', handleResize)
      // Only kill triggers related to this component
      const allTriggers = ScrollTrigger.getAll()
      allTriggers.forEach(trigger => {
        const triggerElement = trigger.vars?.trigger as Element
        if (triggerElement && currentSectionRef?.contains(triggerElement)) {
          trigger.kill()
        }
      })
    }
  }, [pathname, overlayDarkness, showControls, layout]) // Add pathname, showControls, and layout as dependencies to re-run on route changes

  useEffect(() => {
    const addOrientationClasses = () => {
      if (!sectionRef.current) return

      const artefacts = sectionRef.current.querySelectorAll('.artefact')
      
      artefacts.forEach((artefact) => {
        const img = artefact.querySelector('img') as HTMLImageElement
        if (!img) return

        const setOrientationClass = () => {
          const { naturalWidth: width, naturalHeight: height } = img
          
          // Only proceed if we have valid dimensions
          if (width === 0 || height === 0) return
          
          // Remove existing orientation classes
          artefact.classList.remove('landscape', 'portrait', 'square')
          
          // Add appropriate class based on orientation
          if (width === height) {
            artefact.classList.add('square')
          } else if (width > height) {
            artefact.classList.add('landscape')
          } else {
            artefact.classList.add('portrait')
          }
        }

        // For lazy loaded images, prevent layout jumps by setting aspect ratio immediately
        if (img.classList.contains('lazy') && img.dataset.src) {
          // Extract dimensions from URL if possible (Sanity URLs include dimensions)
          const urlParams = new URLSearchParams(img.dataset.src.split('?')[1])
          const width = urlParams.get('w') || urlParams.get('width')
          const height = urlParams.get('h') || urlParams.get('height')
          
          if (width && height) {
            // Set CSS aspect-ratio to prevent layout jumps
            img.style.aspectRatio = `${width} / ${height}`
            
            // Still apply orientation classes for styling
            const aspectRatio = parseInt(width) / parseInt(height)
            artefact.classList.remove('landscape', 'portrait', 'square')
            if (Math.abs(aspectRatio - 1) < 0.1) {
              artefact.classList.add('square')
            } else if (aspectRatio > 1) {
              artefact.classList.add('landscape')
            } else {
              artefact.classList.add('portrait')
            }
          } else {
            // Fallback: preload to get dimensions
            const preloader = new Image()
            preloader.onload = () => {
              const { naturalWidth: w, naturalHeight: h } = preloader
              
              // Set aspect ratio to prevent layout jump when real image loads
              img.style.aspectRatio = `${w} / ${h}`
              
              artefact.classList.remove('landscape', 'portrait', 'square')
              if (w === h) {
                artefact.classList.add('square')
              } else if (w > h) {
                artefact.classList.add('landscape')
              } else {
                artefact.classList.add('portrait')
              }
            }
            preloader.src = img.dataset.src
          }
        } else {
          // Regular image loading
          if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
            setOrientationClass()
          } else {
            img.onload = () => {
              setTimeout(setOrientationClass, 10)
            }
          }
        }
      })
    }

    const addClickHandlers = () => {
      // Click handlers are now added directly in JSX via onClick props
      // This function is kept for backwards compatibility if needed
    }

    // Run after component mounts
    addOrientationClasses()
    addClickHandlers()

    // Re-run when images load (for lazy loaded images)
    const observer = new MutationObserver(() => {
      addOrientationClasses()
      addClickHandlers()
    })

    if (sectionRef.current) {
      observer.observe(sectionRef.current, {
        childList: true,
        subtree: true
      })
    }

    return () => {
      observer.disconnect()
    }
  }, [artefact1, artefact2, artefact3, artefact4])

  return (
    <>
      <section ref={sectionRef} className="text-with-artefacts">
        <div className="hero-media-block full-height flex items-center text-white relative z-6">
          {backgroundMediaType === 'video' && (desktopBackgroundVideo || desktopBackgroundVideoUrl) && (
            <div className="fill-space-video-wrap media-wrap z-1">
              {/* Desktop Video */}
              <video
                ref={desktopVideoRef}
                src={videoSource === 'url' && desktopBackgroundVideoUrl ? desktopBackgroundVideoUrl : videoUrlFor(desktopBackgroundVideo)}
                poster={desktopBackgroundVideoPlaceholder ? urlFor(desktopBackgroundVideoPlaceholder).url() : undefined}
                className="desktop"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
              
              {/* Mobile Video - using desktop video */}
              <video
                ref={mobileVideoRef}
                src={videoSource === 'url' && desktopBackgroundVideoUrl ? desktopBackgroundVideoUrl : videoUrlFor(desktopBackgroundVideo)}
                poster={desktopBackgroundVideoPlaceholder ? urlFor(desktopBackgroundVideoPlaceholder).url() : undefined}
                className="mobile"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            </div>
          )}

          {backgroundMediaType === 'image' && (desktopBackgroundImage || mobileBackgroundImage) && (
            <div className="fill-space-image-wrap media-wrap z-1">
              {/* Desktop Image */}
              {desktopBackgroundImage && (
                <img 
data-src={urlFor(desktopBackgroundImage).url()}
                  alt={desktopBackgroundImage?.alt ?? ''}
                  className="lazy full-bleed-image desktop"
                  style={{
                    objectPosition: desktopBackgroundImage?.hotspot
                      ? `${desktopBackgroundImage.hotspot.x * 100}% ${desktopBackgroundImage.hotspot.y * 100}%`
                      : "center",
                  }}
                />
              )}

              {/* Mobile Image */}
              {mobileBackgroundImage && (
                <img 
data-src={urlFor(mobileBackgroundImage).url()}
                  alt={mobileBackgroundImage?.alt ?? ''}
                  className="lazy full-bleed-image mobile"
                  style={{
                    objectPosition: mobileBackgroundImage?.hotspot
                      ? `${mobileBackgroundImage.hotspot.x * 100}% ${mobileBackgroundImage.hotspot.y * 100}%`
                      : "center",
                  }}
                />
              )}

              {/* Fallback to desktop image for mobile if no mobile image provided */}
              {!mobileBackgroundImage && desktopBackgroundImage && (
                <img 
data-src={urlFor(desktopBackgroundImage).url()}
                  alt={desktopBackgroundImage?.alt ?? ''}
                  className="lazy full-bleed-image mobile"
                  style={{
                    objectPosition: desktopBackgroundImage?.hotspot
                      ? `${desktopBackgroundImage.hotspot.x * 100}% ${desktopBackgroundImage.hotspot.y * 100}%`
                      : "center",
                  }}
                />
              )}

              <div className="loading-overlay" />
            </div>
          )}

          <div className="opacity-overlay z-2" style={{ opacity: overlayDarkness }} data-overlay-darkness={overlayDarkness}></div>
          
          {(desktopTitle || mobileTitle) && ( <div className="z-3 h-pad out-of-view">
            {desktopTitle && <div className="desktop"><h1>{desktopTitle}</h1></div>}
            {mobileTitle && <div className="mobile"><h1>{mobileTitle}</h1></div>}
          </div> )}
        </div>

        {layout === 'layout-1' && body && (
          <div className="text-block-scroll full-height flex items-center text-white relative z-6">
            <div className="h-pad z-3">
              <div className="text-wrap h2">
                <PortableText value={body} components={portableTextComponents} />
              </div>
              
              <div className="down-arrow z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="12" viewBox="0 0 22 12" fill="none" >
                  <path d="M21 1L11 11L1 0.999999" stroke="#FFF9F2"/>
                </svg>
              </div>
            </div>
          </div>
        )}

        {showControls && (
          <VideoControls
            ref={videoControlsRef}
            isPlaying={isPlaying}
            isMuted={isMuted}
            onPlayPause={togglePlayPause}
            onMute={toggleMute}
            onFullscreen={toggleFullscreen}
            className="z-10 out-of-opacity"
            style={{ opacity: 0, visibility: 'hidden', pointerEvents: 'auto' }}
            showControls={true}
          />
        )}

        {/* For non-Layout-1, render body as pinned text-block (existing behavior) */}
        {layout !== 'layout-1' && body && (
          <div className="text-block h-pad z-5 relative">
            <div className="text-wrap h2">
              <PortableText value={body} components={portableTextComponents} />
            </div>

            <div className="down-arrow z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="12" viewBox="0 0 22 12" fill="none" >
                <path d="M21 1L11 11L1 0.999999" stroke="#FFF9F2"/>
              </svg>
            </div>
          </div>
        )}
        
        {/* For Layout 1, render body2 as pinned text-block (takes place of what body1 used to do) */}
        {layout === 'layout-1' && body2 && (
          <div className="text-block h-pad z-5 relative">
            <div className="text-wrap h2">
              <PortableText value={body2} components={portableTextComponents} />
            </div>

            <div className="down-arrow z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="12" viewBox="0 0 22 12" fill="none" >
                <path d="M21 1L11 11L1 0.999999" stroke="#FFF9F2"/>
              </svg>
            </div>
          </div>
        )}
          
        <div className={`artefacts-grid ${layout} h-pad z-6`}>
          {layout === 'layout-1' ? (
            <>
              {/* Row 1 */}
              <div className="artefacts-row-1 row-lg">
                {artefact1 && (
                  <div 
                    className={`artefact artefact-1 col-3-12_lg ${artefact1.title || artefact1.description ? 'has-content' : ''} ${artefact1.hoverImage ? 'has-hover-image' : ''}`}
                    onClick={(e) => (artefact1.title || artefact1.description) && handleArtefactClick(artefact1, e)}
                    style={{ cursor: (artefact1.title || artefact1.description) ? 'pointer' : 'default' }}
                  >
                    {artefact1.image && (
                      <div className="artefact-image">
                        <div className="media-wrap relative">
                          <img 
data-src={urlFor(artefact1.image).url()}
                          alt={artefact1.image?.alt ?? ''}
                          className="lazy"
                          style={{
                            objectPosition: artefact1.image?.hotspot
                              ? `${artefact1.image.hotspot.x * 100}% ${artefact1.image.hotspot.y * 100}%`
                              : "center",
                          }}
                          />
                          {artefact1.hoverImage && (
                            <img 
data-src={urlFor(artefact1.hoverImage).url()}
                            alt={artefact1.hoverImage?.alt ?? ''}
                            className="lazy hover-image"
                            style={{
                              objectPosition: artefact1.hoverImage?.hotspot
                                ? `${artefact1.hoverImage.hotspot.x * 100}% ${artefact1.hoverImage.hotspot.y * 100}%`
                                : "center",
                            }}
                            />
                          )}
                          <div className="loading-overlay" />
                          <div className="learn-more">Learn More</div>
                        </div>

                        {artefact1.caption && (
                          <div className="caption">
                            <div className="caption-font">{artefact1.caption}</div>

                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 11 11">
                              <line x1="5.5" y1="11" x2="5.5" y2="0"/>
                              <line y1="5.5" x2="11" y2="5.5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="col-7-12_lg desktop"></div>

                {artefact2 && (
                  <div 
                    className={`artefact artefact-2 col-2-12_lg ${artefact2.title || artefact2.description ? 'has-content' : ''} ${artefact2.hoverImage ? 'has-hover-image' : ''}`}
                    onClick={(e) => (artefact2.title || artefact2.description) && handleArtefactClick(artefact2, e)}
                    style={{ cursor: (artefact2.title || artefact2.description) ? 'pointer' : 'default' }}
                  >
                    {artefact2.image && (
                      <div className="artefact-image">
                        <div className="media-wrap relative">
                          <img 
data-src={urlFor(artefact2.image).url()}
                          alt={artefact2.image?.alt ?? ''}
                          className="lazy"
                          style={{
                            objectPosition: artefact2.image?.hotspot
                              ? `${artefact2.image.hotspot.x * 100}% ${artefact2.image.hotspot.y * 100}%`
                              : "center",
                          }}
                          />
                          {artefact2.hoverImage && (
                            <img 
data-src={urlFor(artefact2.hoverImage).url()}
                            alt={artefact2.hoverImage?.alt ?? ''}
                            className="lazy hover-image"
                            style={{
                              objectPosition: artefact2.hoverImage?.hotspot
                                ? `${artefact2.hoverImage.hotspot.x * 100}% ${artefact2.hoverImage.hotspot.y * 100}%`
                                : "center",
                            }}
                            />
                          )}
                          <div className="loading-overlay" />
                          <div className="learn-more">Learn More</div>
                        </div>

                        {artefact2.caption && (
                          <div className="caption">
                            <div className="caption-font">{artefact2.caption}</div>

                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 11 11">
                              <line x1="5.5" y1="11" x2="5.5" y2="0"/>
                              <line y1="5.5" x2="11" y2="5.5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Row 2 */}
              <div className="artefacts-row-2 row-lg">
                {artefact3 && (
                  <div 
                    className={`artefact artefact-3 col-3-12_lg ${artefact3.title || artefact3.description ? 'has-content' : ''} ${artefact3.hoverImage ? 'has-hover-image' : ''}`}
                    onClick={(e) => (artefact3.title || artefact3.description) && handleArtefactClick(artefact3, e)}
                    style={{ cursor: (artefact3.title || artefact3.description) ? 'pointer' : 'default' }}
                  >
                    {artefact3.image && (
                      <div className="artefact-image">
                        <div className="media-wrap relative">
                          <img 
data-src={urlFor(artefact3.image).url()}
                          alt={artefact3.image?.alt ?? ''}
                          className="lazy"
                          style={{
                            objectPosition: artefact3.image?.hotspot
                              ? `${artefact3.image.hotspot.x * 100}% ${artefact3.image.hotspot.y * 100}%`
                              : "center",
                          }}
                          />
                          {artefact3.hoverImage && (
                            <img 
data-src={urlFor(artefact3.hoverImage).url()}
                            alt={artefact3.hoverImage?.alt ?? ''}
                            className="lazy hover-image"
                            style={{
                              objectPosition: artefact3.hoverImage?.hotspot
                                ? `${artefact3.hoverImage.hotspot.x * 100}% ${artefact3.hoverImage.hotspot.y * 100}%`
                                : "center",
                            }}
                            />
                          )}
                          <div className="loading-overlay" />
                          <div className="learn-more">Learn More</div>
                        </div>

                        {artefact3.caption && (
                          <div className="caption">
                            <div className="caption-font">{artefact3.caption}</div>

                            {(artefact3.title || artefact3.description) && ( 
                              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 11 11">
                                <line x1="5.5" y1="11" x2="5.5" y2="0"/>
                                <line y1="5.5" x2="11" y2="5.5"/>
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="col-6-12_lg desktop"></div>

                {artefact4 && (
                  <div 
                    className={`artefact artefact-4 col-3-12_lg ${artefact4.title || artefact4.description ? 'has-content' : ''} ${artefact4.hoverImage ? 'has-hover-image' : ''}`}
                    onClick={(e) => (artefact4.title || artefact4.description) && handleArtefactClick(artefact4, e)}
                    style={{ cursor: (artefact4.title || artefact4.description) ? 'pointer' : 'default' }}
                  >
                    {artefact4.image && (
                      <div className="artefact-image">
                        <div className="media-wrap relative">
                          <img 
data-src={urlFor(artefact4.image).url()}
                          alt={artefact4.image?.alt ?? ''}
                          className="lazy"
                          style={{
                            objectPosition: artefact4.image?.hotspot
                              ? `${artefact4.image.hotspot.x * 100}% ${artefact4.image.hotspot.y * 100}%`
                              : "center",
                          }}
                          />
                          {artefact4.hoverImage && (
                            <img 
data-src={urlFor(artefact4.hoverImage).url()}
                            alt={artefact4.hoverImage?.alt ?? ''}
                            className="lazy hover-image"
                            style={{
                              objectPosition: artefact4.hoverImage?.hotspot
                                ? `${artefact4.hoverImage.hotspot.x * 100}% ${artefact4.hoverImage.hotspot.y * 100}%`
                                : "center",
                            }}
                            />
                          )}
                          <div className="loading-overlay" />
                          <div className="learn-more">Learn More</div>
                        </div>

                        {artefact4.caption && (
                          <div className="caption">
                            <div className="caption-font">{artefact4.caption}</div>

                            {(artefact4.title || artefact4.description) && ( 
                              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 11 11">
                                <line x1="5.5" y1="11" x2="5.5" y2="0"/>
                                <line y1="5.5" x2="11" y2="5.5"/>
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : layout === 'layout-2' ? (
            <>
              {/* Row 1 */}
              <div className="artefacts-row-1 row-lg">
                {artefact1 && (
                  <div 
                    className={`artefact artefact-1 col-3-12_lg ${artefact1.title || artefact1.description ? 'has-content' : ''} ${artefact1.hoverImage ? 'has-hover-image' : ''}`}
                    onClick={(e) => (artefact1.title || artefact1.description) && handleArtefactClick(artefact1, e)}
                    style={{ cursor: (artefact1.title || artefact1.description) ? 'pointer' : 'default' }}
                  >
                    {artefact1.image && (
                      <div className="artefact-image">
                        <div className="media-wrap relative">
                          <img 
data-src={urlFor(artefact1.image).url()}
                          alt={artefact1.image?.alt ?? ''}
                          className="lazy"
                          style={{
                            objectPosition: artefact1.image?.hotspot
                              ? `${artefact1.image.hotspot.x * 100}% ${artefact1.image.hotspot.y * 100}%`
                              : "center",
                          }}
                          />
                          {artefact1.hoverImage && (
                            <img 
data-src={urlFor(artefact1.hoverImage).url()}
                            alt={artefact1.hoverImage?.alt ?? ''}
                            className="lazy hover-image"
                            style={{
                              objectPosition: artefact1.hoverImage?.hotspot
                                ? `${artefact1.hoverImage.hotspot.x * 100}% ${artefact1.hoverImage.hotspot.y * 100}%`
                                : "center",
                            }}
                            />
                          )}
                          <div className="loading-overlay" />
                          <div className="learn-more">Learn More</div>
                        </div>

                        {artefact1.caption && (
                          <div className="caption">
                            <div className="caption-font">{artefact1.caption}</div>

                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 11 11">
                              <line x1="5.5" y1="11" x2="5.5" y2="0"/>
                              <line y1="5.5" x2="11" y2="5.5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="col-6-12_lg desktop"></div>

                {artefact2 && (
                  <div 
                    className={`artefact artefact-2 col-2-12_lg ${artefact2.title || artefact2.description ? 'has-content' : ''} ${artefact2.hoverImage ? 'has-hover-image' : ''}`}
                    onClick={(e) => (artefact2.title || artefact2.description) && handleArtefactClick(artefact2, e)}
                    style={{ cursor: (artefact2.title || artefact2.description) ? 'pointer' : 'default' }}
                  >
                    {artefact2.image && (
                      <div className="artefact-image">
                        <div className="media-wrap relative">
                          <img 
data-src={urlFor(artefact2.image).url()}
                          alt={artefact2.image?.alt ?? ''}
                          className="lazy"
                          style={{
                            objectPosition: artefact2.image?.hotspot
                              ? `${artefact2.image.hotspot.x * 100}% ${artefact2.image.hotspot.y * 100}%`
                              : "center",
                          }}
                          />
                          {artefact2.hoverImage && (
                            <img 
data-src={urlFor(artefact2.hoverImage).url()}
                            alt={artefact2.hoverImage?.alt ?? ''}
                            className="lazy hover-image"
                            style={{
                              objectPosition: artefact2.hoverImage?.hotspot
                                ? `${artefact2.hoverImage.hotspot.x * 100}% ${artefact2.hoverImage.hotspot.y * 100}%`
                                : "center",
                            }}
                            />
                          )}
                          <div className="loading-overlay" />
                          <div className="learn-more">Learn More</div>
                        </div>

                        {artefact2.caption && (
                          <div className="caption">
                            <div className="caption-font">{artefact2.caption}</div>

                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 11 11">
                              <line x1="5.5" y1="11" x2="5.5" y2="0"/>
                              <line y1="5.5" x2="11" y2="5.5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="col-1-12_lg desktop"></div>
              </div>
              
              {/* Row 2 */}
              <div className="artefacts-row-2 row-lg">
                <div className="col-9-12_lg desktop"></div>

                {artefact3 && (
                  <div 
                    className={`artefact artefact-3 col-3-12_lg ${artefact3.title || artefact3.description ? 'has-content' : ''} ${artefact3.hoverImage ? 'has-hover-image' : ''}`}
                    onClick={(e) => (artefact3.title || artefact3.description) && handleArtefactClick(artefact3, e)}
                    style={{ cursor: (artefact3.title || artefact3.description) ? 'pointer' : 'default' }}
                  >
                    {artefact3.image && (
                      <div className="artefact-image">
                        <div className="media-wrap relative">
                          <img 
data-src={urlFor(artefact3.image).url()}
                          alt={artefact3.image?.alt ?? ''}
                          className="lazy"
                          style={{
                            objectPosition: artefact3.image?.hotspot
                              ? `${artefact3.image.hotspot.x * 100}% ${artefact3.image.hotspot.y * 100}%`
                              : "center",
                          }}
                          />
                          {artefact3.hoverImage && (
                            <img 
data-src={urlFor(artefact3.hoverImage).url()}
                            alt={artefact3.hoverImage?.alt ?? ''}
                            className="lazy hover-image"
                            style={{
                              objectPosition: artefact3.hoverImage?.hotspot
                                ? `${artefact3.hoverImage.hotspot.x * 100}% ${artefact3.hoverImage.hotspot.y * 100}%`
                                : "center",
                            }}
                            />
                          )}
                          <div className="loading-overlay" />
                          <div className="learn-more">Learn More</div>
                        </div>

                        {artefact3.caption && (
                          <div className="caption">
                            <div className="caption-font">{artefact3.caption}</div>

                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 11 11">
                              <line x1="5.5" y1="11" x2="5.5" y2="0"/>
                              <line y1="5.5" x2="11" y2="5.5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : layout === 'layout-3' ? (
            <>
              {/* Row 1 */}
              <div className="artefacts-row-1 row-lg">
                {artefact1 && (
                  <div 
                    className={`artefact artefact-1 col-2-12_lg ${artefact1.title || artefact1.description ? 'has-content' : ''} ${artefact1.hoverImage ? 'has-hover-image' : ''}`}
                    onClick={(e) => (artefact1.title || artefact1.description) && handleArtefactClick(artefact1, e)}
                    style={{ cursor: (artefact1.title || artefact1.description) ? 'pointer' : 'default' }}
                  >
                    {artefact1.image && (
                      <div className="artefact-image">
                        <div className="media-wrap relative">
                          <img 
data-src={urlFor(artefact1.image).url()}
                          alt={artefact1.image?.alt ?? ''}
                          className="lazy"
                          style={{
                            objectPosition: artefact1.image?.hotspot
                              ? `${artefact1.image.hotspot.x * 100}% ${artefact1.image.hotspot.y * 100}%`
                              : "center",
                          }}
                          />
                          {artefact1.hoverImage && (
                            <img 
data-src={urlFor(artefact1.hoverImage).url()}
                            alt={artefact1.hoverImage?.alt ?? ''}
                            className="lazy hover-image"
                            style={{
                              objectPosition: artefact1.hoverImage?.hotspot
                                ? `${artefact1.hoverImage.hotspot.x * 100}% ${artefact1.hoverImage.hotspot.y * 100}%`
                                : "center",
                            }}
                            />
                          )}
                          <div className="loading-overlay" />
                          <div className="learn-more">Learn More</div>
                        </div>

                        {artefact1.caption && (
                          <div className="caption">
                            <div className="caption-font">{artefact1.caption}</div>

                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 11 11">
                              <line x1="5.5" y1="11" x2="5.5" y2="0"/>
                              <line y1="5.5" x2="11" y2="5.5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="col-7-12_lg desktop"></div>

                {artefact2 && (
                  <div 
                    className={`artefact artefact-2 col-3-12_lg ${artefact2.title || artefact2.description ? 'has-content' : ''} ${artefact2.hoverImage ? 'has-hover-image' : ''}`}
                    onClick={(e) => (artefact2.title || artefact2.description) && handleArtefactClick(artefact2, e)}
                    style={{ cursor: (artefact2.title || artefact2.description) ? 'pointer' : 'default' }}
                  >
                    {artefact2.image && (
                      <div className="artefact-image">
                        <div className="media-wrap relative">
                          <img 
data-src={urlFor(artefact2.image).url()}
                          alt={artefact2.image?.alt ?? ''}
                          className="lazy"
                          style={{
                            objectPosition: artefact2.image?.hotspot
                              ? `${artefact2.image.hotspot.x * 100}% ${artefact2.image.hotspot.y * 100}%`
                              : "center",
                          }}
                          />
                          {artefact2.hoverImage && (
                            <img 
data-src={urlFor(artefact2.hoverImage).url()}
                            alt={artefact2.hoverImage?.alt ?? ''}
                            className="lazy hover-image"
                            style={{
                              objectPosition: artefact2.hoverImage?.hotspot
                                ? `${artefact2.hoverImage.hotspot.x * 100}% ${artefact2.hoverImage.hotspot.y * 100}%`
                                : "center",
                            }}
                            />
                          )}
                          <div className="loading-overlay" />
                          <div className="learn-more">Learn More</div>
                        </div>

                        {artefact2.caption && (
                          <div className="caption">
                            <div className="caption-font">{artefact2.caption}</div>

                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 11 11">
                              <line x1="5.5" y1="11" x2="5.5" y2="0"/>
                              <line y1="5.5" x2="11" y2="5.5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Row 2 */}
              <div className="artefacts-row-2 row-lg">
                {artefact3 && (
                  <div 
                    className={`artefact artefact-3 col-2-12_lg ${artefact3.title || artefact3.description ? 'has-content' : ''} ${artefact3.hoverImage ? 'has-hover-image' : ''}`}
                    onClick={(e) => (artefact3.title || artefact3.description) && handleArtefactClick(artefact3, e)}
                    style={{ cursor: (artefact3.title || artefact3.description) ? 'pointer' : 'default' }}
                  >
                    {artefact3.image && (
                      <div className="artefact-image">
                        <div className="media-wrap relative">
                          <img 
data-src={urlFor(artefact3.image).url()}
                          alt={artefact3.image?.alt ?? ''}
                          className="lazy"
                          style={{
                            objectPosition: artefact3.image?.hotspot
                              ? `${artefact3.image.hotspot.x * 100}% ${artefact3.image.hotspot.y * 100}%`
                              : "center",
                          }}
                          />
                          {artefact3.hoverImage && (
                            <img 
data-src={urlFor(artefact3.hoverImage).url()}
                            alt={artefact3.hoverImage?.alt ?? ''}
                            className="lazy hover-image"
                            style={{
                              objectPosition: artefact3.hoverImage?.hotspot
                                ? `${artefact3.hoverImage.hotspot.x * 100}% ${artefact3.hoverImage.hotspot.y * 100}%`
                                : "center",
                            }}
                            />
                          )}
                          <div className="loading-overlay" />
                          <div className="learn-more">Learn More</div>
                        </div>

                        {artefact3.caption && (
                          <div className="caption">
                            <div className="caption-font">{artefact3.caption}</div>

                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 11 11">
                              <line x1="5.5" y1="11" x2="5.5" y2="0"/>
                              <line y1="5.5" x2="11" y2="5.5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="col-10-12_lg desktop"></div>

                {artefact4 && (
                  <div 
                    className={`artefact artefact-4 col-2-12_lg ${artefact4.title || artefact4.description ? 'has-content' : ''} ${artefact4.hoverImage ? 'has-hover-image' : ''}`}
                    onClick={(e) => (artefact4.title || artefact4.description) && handleArtefactClick(artefact4, e)}
                    style={{ cursor: (artefact4.title || artefact4.description) ? 'pointer' : 'default' }}
                  >
                    {artefact4.image && (
                      <div className="artefact-image">
                        <div className="media-wrap relative">
                          <img 
data-src={urlFor(artefact4.image).url()}
                          alt={artefact4.image?.alt ?? ''}
                          className="lazy"
                          style={{
                            objectPosition: artefact4.image?.hotspot
                              ? `${artefact4.image.hotspot.x * 100}% ${artefact4.image.hotspot.y * 100}%`
                              : "center",
                          }}
                          />
                          {artefact4.hoverImage && (
                            <img 
data-src={urlFor(artefact4.hoverImage).url()}
                            alt={artefact4.hoverImage?.alt ?? ''}
                            className="lazy hover-image"
                            style={{
                              objectPosition: artefact4.hoverImage?.hotspot
                                ? `${artefact4.hoverImage.hotspot.x * 100}% ${artefact4.hoverImage.hotspot.y * 100}%`
                                : "center",
                            }}
                            />
                          )}
                          <div className="loading-overlay" />
                          <div className="learn-more">Learn More</div>
                        </div>

                        {artefact4.caption && (
                          <div className="caption">
                            <div className="caption-font">{artefact4.caption}</div>

                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 11 11">
                              <line x1="5.5" y1="11" x2="5.5" y2="0"/>
                              <line y1="5.5" x2="11" y2="5.5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {carouselIcon && (
                <div className="carousel-image">
                  <img 
src={urlFor(carouselIcon).url()}
                    alt={carouselIcon?.alt ?? ''}
                  />
                </div>
              )}
            </>
          ) : null}
        </div>
      </section>

      {selectedArtefact && (
        <div 
          className={`artefact-overlay ${isClosing ? 'closing' : ''}`}
          style={viewportHeight ? { height: `${viewportHeight}px` } : undefined}
        >
          <div 
            className="artefact-content" 
            ref={artefactContentRef}
            style={{
              visibility: isWidthCalculated ? 'visible' : 'hidden'
            }}
          >
            <div className="mobile" style={{ width: '100%' }}>
              <div className="title-wrap">
                <h3 className="artefact-title">
                  {selectedArtefact.title || ''}
                </h3>

                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="32" 
                  height="32" 
                  viewBox="0 0 32 32" 
                  fill="none"
                  onClick={handleCloseOverlay}
                  style={{ cursor: 'pointer' }}
                >
                  <line y1="-0.6" x2="42.23" y2="-0.6" transform="matrix(0.703601 -0.710596 0.703601 0.710596 1.29761 31.0078)" stroke="#FFF9F2" strokeWidth="1.2"/>
                  <line y1="-0.6" x2="42.23" y2="-0.6" transform="matrix(-0.703601 -0.710596 -0.703601 0.710596 30.7131 31.0059)" stroke="#FFF9F2" strokeWidth="1.2"/>
                </svg>
              </div>
            </div>
            
            {selectedArtefact.image && (
              <div 
                ref={overlayMediaWrapRef}
                className={`media-wrap relative ${imageOrientation ? imageOrientation : ''}`}
                style={{
                  borderRadius: (layout === 'layout-1' && selectedArtefact === artefact1) ? '50%' : '0',
                  overflow: (layout === 'layout-1' && selectedArtefact === artefact1) ? 'hidden' : 'visible',
                }}
              >
                <img 
src={urlFor(selectedArtefact.image).url()}
                  alt={selectedArtefact.image?.alt ?? ''}
                  style={{
                    objectPosition: selectedArtefact.image?.hotspot
                      ? `${selectedArtefact.image.hotspot.x * 100}% ${selectedArtefact.image.hotspot.y * 100}%`
                      : "center",
                  }}
                />
              </div>
            )}

            <div className="text-wrap">
              <div className="desktop">
                <div className="title-wrap">
                  <h2 className="artefact-title">{selectedArtefact.title || ''}</h2>

                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="32" 
                    height="32" 
                    viewBox="0 0 32 32" 
                    fill="none"
                    onClick={handleCloseOverlay}
                    style={{ cursor: 'pointer' }}
                  >
                    <line y1="-0.6" x2="42.23" y2="-0.6" transform="matrix(0.703601 -0.710596 0.703601 0.710596 1.29761 31.0078)" stroke="#FFF9F2" strokeWidth="1.2"/>
                    <line y1="-0.6" x2="42.23" y2="-0.6" transform="matrix(-0.703601 -0.710596 -0.703601 0.710596 30.7131 31.0059)" stroke="#FFF9F2" strokeWidth="1.2"/>
                  </svg>
                </div>
              </div>
              
              {selectedArtefact.description && (
                <p ref={artefactDescriptionRef} className="artefact-description">{selectedArtefact.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="scroll-buffer"></section>
    </>
  )
}
