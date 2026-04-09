/* eslint-disable @next/next/no-img-element */
"use client"

import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { videoUrlFor } from '../sanity/utils/videoUrlBuilder'
import { SanityImage, SanityVideo } from '../types/sanity'
import VideoControls from './VideoControls'
import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLinkInfo } from '../utils/getLinkInfo'
import { getExternalLinkProps } from '../utils/getExternalLinkProps'
import type { CtaLink } from '../types/link'

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

type HeroMediaProps = {
  layout?: 'layout-1' | 'layout-2' | 'layout-3'
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
  cta?: CtaLink
}

export default function HeroMedia({ 
  layout,
  desktopTitle, 
  mobileTitle, 
  backgroundMediaType, 
  desktopBackgroundImage, 
  mobileBackgroundImage,
    desktopBackgroundVideo,
    videoSource = 'file',
    desktopBackgroundVideoUrl,
    desktopBackgroundVideoPlaceholder,
    showControls = false,
  overlayDarkness = 0.3,
  cta
}: HeroMediaProps) {
  const { text, href } = getLinkInfo(cta)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const desktopVideoRef = useRef<HTMLVideoElement>(null)
  const mobileVideoRef = useRef<HTMLVideoElement>(null)
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null)

  const togglePlayPause = () => {
    const desktopVideo = desktopVideoRef.current
    const mobileVideo = mobileVideoRef.current
    
    if (isPlaying) {
      // Pause videos
      if (desktopVideo) desktopVideo.pause()
      if (mobileVideo) mobileVideo.pause()
      setIsPlaying(false)
    } else {
      // Play videos
      if (desktopVideo) desktopVideo.play()
      if (mobileVideo) mobileVideo.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    const desktopVideo = desktopVideoRef.current
    const mobileVideo = mobileVideoRef.current
    
    if (isMuted) {
      // Unmute videos
      if (desktopVideo) desktopVideo.muted = false
      if (mobileVideo) mobileVideo.muted = false
      setIsMuted(false)
    } else {
      // Mute videos
      if (desktopVideo) desktopVideo.muted = true
      if (mobileVideo) mobileVideo.muted = true
      setIsMuted(true)
    }
  }

  const toggleFullscreen = async () => {
    console.log('toggleFullscreen called!')
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
        
        // Move the video element to document.body to prevent ScrollTrigger interference
        // Clear any ScrollTrigger transforms by getting computed style and resetting
        const computedStyle = window.getComputedStyle(sourceVideo)
        if (computedStyle.transform && computedStyle.transform !== 'none') {
          sourceVideo.style.transform = 'none'
        }
        
        // Set styles for fullscreen
        sourceVideo.style.position = 'fixed'
        sourceVideo.style.top = '0'
        sourceVideo.style.left = '0'
        sourceVideo.style.width = '100%'
        sourceVideo.style.height = '100%'
        sourceVideo.style.zIndex = '999999'
        sourceVideo.style.transform = 'none'
        sourceVideo.style.visibility = 'visible'
        sourceVideo.style.opacity = '1'
        sourceVideo.style.pointerEvents = 'auto'
        
        // Ensure controls are set before moving
        sourceVideo.controls = true
        sourceVideo.setAttribute('controls', '')
        sourceVideo.playsInline = false
        
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
          const originalVideo = window.innerWidth >= 768 ? desktopVideoRef.current : mobileVideoRef.current
          const opacityOverlay = originalVideo?.closest('.hero-media-block')?.querySelector('.opacity-overlay') as HTMLElement
          if (opacityOverlay) {
            // Get the original overlayDarkness value
            const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
            const targetOpacity = Math.min(overlayDarkness, 1)
            
            // Kill any GSAP animations on the overlay
            gsap.killTweensOf(opacityOverlay)
            // Set opacity directly to prevent ScrollTrigger from doubling it
            opacityOverlay.style.opacity = String(targetOpacity)
          }
          
          // Small delay before re-enabling and refreshing to ensure opacity is set
          setTimeout(() => {
            // Temporarily scroll to top to prevent ScrollTrigger callbacks from firing
            const currentScrollY = window.scrollY
            window.scrollTo(0, 0)
            
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
            
            // Refresh ScrollTrigger while at top (callbacks won't fire)
            ScrollTrigger.refresh()
            
            // Set opacity to correct value before scrolling back
            if (opacityOverlay) {
              const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
              const targetOpacity = Math.min(overlayDarkness, 1)
              gsap.killTweensOf(opacityOverlay)
              opacityOverlay.style.opacity = String(targetOpacity)
            }
            
            // Scroll back to saved position
            if (savedScrollY !== undefined) {
              window.scrollTo(0, savedScrollY)
            } else {
              window.scrollTo(0, currentScrollY)
            }
            
            // Small delay after scrolling back, then reset opacity again
            setTimeout(() => {
              if (opacityOverlay) {
                const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
                const targetOpacity = Math.min(overlayDarkness, 1)
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
            }, 50)
          }, 50)
        } else {
          // If ScrollTrigger not available, still restore video
          const originalVideo = window.innerWidth >= 768 ? desktopVideoRef.current : mobileVideoRef.current
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
              const computedOpacity = parseFloat(window.getComputedStyle(opacityOverlay).opacity)
              // If opacity is greater than 1, reset it to a reasonable value
              if (computedOpacity > 1) {
                opacityOverlay.style.opacity = ''
                // Let the component's overlayDarkness prop handle it, or default to 0.3
                const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
                opacityOverlay.style.opacity = String(Math.min(overlayDarkness, 1))
              }
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
      
      // Move video back to original parent if needed
      if (originalVideo && (originalVideo as ExtendedVideoElement)._originalParent) {
        const originalParent = (originalVideo as ExtendedVideoElement)._originalParent as HTMLElement
        if (originalVideo.parentElement === document.body) {
          document.body.removeChild(originalVideo)
          originalParent.appendChild(originalVideo)
        }
      }
      
      if (typeof window !== 'undefined' && ScrollTrigger) {
        // Restore scroll position if saved
        if (savedScrollY !== undefined) {
          window.scrollTo(0, savedScrollY)
        }
        
        // Fix opacity-overlay before re-enabling triggers
        const opacityOverlay = originalVideo?.closest('.hero-media-block')?.querySelector('.opacity-overlay') as HTMLElement
        if (opacityOverlay) {
          const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
          const targetOpacity = Math.min(overlayDarkness, 1)
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
          const originalVideo = window.innerWidth >= 768 ? desktopVideoRef.current : mobileVideoRef.current
          const opacityOverlay = originalVideo?.closest('.hero-media-block')?.querySelector('.opacity-overlay') as HTMLElement
          if (opacityOverlay) {
            // Get the original overlayDarkness value
            const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
            const targetOpacity = Math.min(overlayDarkness, 1)
            
            // Kill any GSAP animations on the overlay
            gsap.killTweensOf(opacityOverlay)
            // Set opacity directly to prevent ScrollTrigger from doubling it
            opacityOverlay.style.opacity = String(targetOpacity)
          }
          
          // Small delay before re-enabling and refreshing to ensure opacity is set
          setTimeout(() => {
            // Temporarily scroll to top to prevent ScrollTrigger callbacks from firing
            const currentScrollY = window.scrollY
            window.scrollTo(0, 0)
            
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
            
            // Refresh ScrollTrigger while at top (callbacks won't fire)
            ScrollTrigger.refresh()
            
            // Set opacity to correct value before scrolling back
            if (opacityOverlay) {
              const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
              const targetOpacity = Math.min(overlayDarkness, 1)
              gsap.killTweensOf(opacityOverlay)
              opacityOverlay.style.opacity = String(targetOpacity)
            }
            
            // Scroll back to saved position
            if (savedScrollY !== undefined) {
              window.scrollTo(0, savedScrollY)
            } else {
              window.scrollTo(0, currentScrollY)
            }
            
            // Small delay after scrolling back, then reset opacity again
            setTimeout(() => {
              if (opacityOverlay) {
                const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
                const targetOpacity = Math.min(overlayDarkness, 1)
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
            }, 50)
          }, 50)
        } else {
          // If ScrollTrigger not available, still restore video
          const originalVideo = window.innerWidth >= 768 ? desktopVideoRef.current : mobileVideoRef.current
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
              const computedOpacity = parseFloat(window.getComputedStyle(opacityOverlay).opacity)
              // If opacity is greater than 1, reset it to a reasonable value
              if (computedOpacity > 1) {
                opacityOverlay.style.opacity = ''
                // Let the component's overlayDarkness prop handle it, or default to 0.3
                const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
                opacityOverlay.style.opacity = String(Math.min(overlayDarkness, 1))
              }
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
  }, [isFullscreen])

  return (
    <>
      {layout === 'layout-1' && (
        <section className="hero-media-block layout-1 full-height flex items-center text-white relative">
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
          
          <div className="z-3 h-pad out-of-view">
            {desktopTitle && <div className="desktop"><h1>{desktopTitle}</h1></div>}
            {mobileTitle && <div className="mobile"><h1>{mobileTitle}</h1></div>}
          </div>

          <VideoControls
            isPlaying={isPlaying}
            isMuted={isMuted}
            onPlayPause={togglePlayPause}
            onMute={toggleMute}
            onFullscreen={toggleFullscreen}
            className="z-4"
            style={{ pointerEvents: 'auto' }}
            showControls={showControls}
          />
        </section>
      )}

      {layout === 'layout-2' && (
        <section className="hero-media-block layout-2 flex items-center justify-center text-white relative">
          <div className="inner-wrap h-pad out-of-view">
            {desktopTitle && <div className="desktop text-wrap h2">{desktopTitle}</div>}
            {mobileTitle && <div className="mobile text-wrap h2">{mobileTitle}</div>}

            {cta && <div className="cta-font underline-link link cream">
              <a href={href} {...getExternalLinkProps(cta?.linkType)}>{text || 'Learn More'}</a>

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                <path d="M1 1L13.5 13.5L0.999999 26"/>
              </svg>
            </div>}
          </div>
        </section>
      )}

      {layout === 'layout-3' && (
        <section className="hero-media-block layout-3 flex items-center text-white relative">
          <div className="h-pad out-of-view">
            {desktopTitle && <div className="desktop"><h1 className="h2">{desktopTitle}</h1></div>}
            {mobileTitle && <div className="mobile"><h1 className="h2">{mobileTitle}</h1></div>}
          </div>
        </section>
      )}
    </>
  )
}
