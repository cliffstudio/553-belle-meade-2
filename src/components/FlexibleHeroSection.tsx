/* eslint-disable @next/next/no-img-element */
"use client"

import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { videoUrlFor } from '../sanity/utils/videoUrlBuilder'
import { SanityImage, SanityVideo } from '../types/sanity'
import Logo from './Logo'
import StackedLogo from './StackedLogo'
import VideoControls from './VideoControls'
import Link from 'next/link'
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

type FlexibleHeroSectionProps = {
  layout?: 'layout-1' | 'layout-2' | 'layout-3' | 'homepage'
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

export default function FlexibleHeroSection({ 
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
  showControls = false,
  overlayDarkness = 0.3,
  cta
}: FlexibleHeroSectionProps) {
  const { text, href } = getLinkInfo(cta)
  const hasCtaLink = Boolean(text?.trim() && href?.trim())
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const desktopVideoRef = useRef<HTMLVideoElement>(null)
  const mobileVideoRef = useRef<HTMLVideoElement>(null)
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  // Use HeroMedia logic for layouts 1-3, HomeHeroMedia logic for homepage layout
  const isHomepageLayout = layout === 'homepage'

  const togglePlayPause = () => {
    const desktopVideo = desktopVideoRef.current
    const mobileVideo = mobileVideoRef.current
    
    if (isPlaying) {
      if (desktopVideo) desktopVideo.pause()
      if (mobileVideo) mobileVideo.pause()
      setIsPlaying(false)
    } else {
      if (desktopVideo) desktopVideo.play()
      if (mobileVideo) mobileVideo.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    const desktopVideo = desktopVideoRef.current
    const mobileVideo = mobileVideoRef.current
    
    if (isMuted) {
      if (desktopVideo) desktopVideo.muted = false
      if (mobileVideo) mobileVideo.muted = false
      setIsMuted(false)
    } else {
      if (desktopVideo) desktopVideo.muted = true
      if (mobileVideo) mobileVideo.muted = true
      setIsMuted(true)
    }
  }

  const toggleFullscreen = async () => {
    const desktopVideo = desktopVideoRef.current
    const mobileVideo = mobileVideoRef.current
    
    const sourceVideo = window.innerWidth >= 768 ? desktopVideo : mobileVideo
    
    if (!sourceVideo) return

    try {
      if (!isFullscreen) {
        const scrollY = window.scrollY
        const videoWrap = sourceVideo.closest('.fill-space-video-wrap') as HTMLElement
        
        let affectedTriggers: ScrollTrigger[] = []
        let opacityTriggers: ScrollTrigger[] = []
        if (typeof window !== 'undefined' && ScrollTrigger) {
          const allTriggers = ScrollTrigger.getAll()
          affectedTriggers = allTriggers.filter(trigger => {
            const triggerElement = trigger.vars?.trigger as Element
            if (!triggerElement) return false
            
            const isVideoRelated = 
              videoWrap?.contains(triggerElement) || 
              triggerElement.contains(sourceVideo) ||
              triggerElement.contains(videoWrap) ||
              (videoWrap && triggerElement === videoWrap) ||
              triggerElement === sourceVideo
            
            const isPinningParent = trigger.vars?.pin && (
              triggerElement.contains(sourceVideo) ||
              triggerElement.contains(videoWrap)
            )
            
            return isVideoRelated || isPinningParent
          })
          
          const opacityOverlay = sourceVideo.closest(isHomepageLayout ? '.home-hero-media-block' : '.hero-media-block')?.querySelector('.opacity-overlay, .opacity-overlay-home') as HTMLElement
          if (opacityOverlay) {
            opacityTriggers = allTriggers.filter(trigger => {
              const hasOpacityCallback = trigger.vars?.onEnter || trigger.vars?.onEnterBack
              if (!hasOpacityCallback) return false
              
              const triggerElement = trigger.vars?.trigger as Element
              if (!triggerElement) return false
              
              const heroBlock = sourceVideo.closest(isHomepageLayout ? '.home-hero-media-block' : '.hero-media-block')
              return heroBlock && (
                heroBlock.contains(triggerElement) ||
                triggerElement.contains(heroBlock) ||
                triggerElement === heroBlock
              )
            })
            
            opacityTriggers.forEach((trigger) => {
              const extendedTrigger = trigger as ScrollTrigger & { _originalCallbacks?: ExtendedVideoElement['_originalCallbacks'] }
              if (!extendedTrigger._originalCallbacks) {
                extendedTrigger._originalCallbacks = {
                  onEnter: trigger.vars?.onEnter as unknown,
                  onEnterBack: trigger.vars?.onEnterBack as unknown,
                  onLeaveBack: trigger.vars?.onLeaveBack as unknown
                }
                if (trigger.vars) {
                  trigger.vars.onEnter = () => {}
                  trigger.vars.onEnterBack = () => {}
                  trigger.vars.onLeaveBack = () => {}
                }
              }
            })
          }
          
          affectedTriggers.forEach((trigger) => trigger.disable())
          opacityTriggers.forEach((trigger) => trigger.disable())
          ScrollTrigger.config({ autoRefreshEvents: 'none' })
        }
        
        const fullscreenVideoClone = sourceVideo.cloneNode(true) as HTMLVideoElement
        
        fullscreenVideoClone.src = sourceVideo.src
        fullscreenVideoClone.currentTime = sourceVideo.currentTime
        fullscreenVideoClone.muted = false
        fullscreenVideoClone.autoplay = true
        fullscreenVideoClone.loop = sourceVideo.loop
        fullscreenVideoClone.playsInline = false
        fullscreenVideoClone.controls = true
        fullscreenVideoClone.setAttribute('controls', '')
        
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
        
        document.body.appendChild(fullscreenVideoClone)
        
        await new Promise<void>((resolve) => {
          if (fullscreenVideoClone.readyState >= 2) {
            resolve()
          } else {
            fullscreenVideoClone.addEventListener('loadedmetadata', () => resolve(), { once: true })
            fullscreenVideoClone.load()
          }
        })
        
        await new Promise(resolve => setTimeout(resolve, 50))
        
        if (fullscreenVideoClone.requestFullscreen) {
          await fullscreenVideoClone.requestFullscreen()
        } else if ('webkitRequestFullscreen' in fullscreenVideoClone) {
          await (fullscreenVideoClone as HTMLVideoElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen()
        } else if ('msRequestFullscreen' in fullscreenVideoClone) {
          await (fullscreenVideoClone as HTMLVideoElement & { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen()
        }
        
        const ensureControls = () => {
          const doc = document as ExtendedDocument
          const isFullscreen = document.fullscreenElement === fullscreenVideoClone || 
              doc.webkitFullscreenElement === fullscreenVideoClone ||
              doc.msFullscreenElement === fullscreenVideoClone
          
          if (isFullscreen) {
            fullscreenVideoClone.removeAttribute('controls')
            fullscreenVideoClone.controls = false
            void fullscreenVideoClone.offsetWidth
            fullscreenVideoClone.controls = true
            fullscreenVideoClone.setAttribute('controls', '')
            fullscreenVideoClone.style.visibility = 'visible'
            fullscreenVideoClone.style.opacity = '1'
            fullscreenVideoClone.style.pointerEvents = 'auto'
          }
        }
        
        const handleFullscreenEnter = () => {
          const doc = document as ExtendedDocument
          if (document.fullscreenElement === fullscreenVideoClone || 
              doc.webkitFullscreenElement === fullscreenVideoClone ||
              doc.msFullscreenElement === fullscreenVideoClone) {
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
        ;(fullscreenVideoClone as ExtendedVideoElement)._fullscreenHandler = handleFullscreenEnter
        
        ensureControls()
        setTimeout(ensureControls, 10)
        setTimeout(ensureControls, 50)
        setTimeout(ensureControls, 100)
        setTimeout(ensureControls, 200)
        
        fullscreenVideoRef.current = fullscreenVideoClone
        ;(sourceVideo as ExtendedVideoElement)._affectedTriggers = affectedTriggers
        ;(sourceVideo as ExtendedVideoElement)._opacityTriggers = opacityTriggers
        ;(sourceVideo as ExtendedVideoElement)._scrollY = scrollY
        
        setIsFullscreen(true)
        setIsMuted(false)
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ('webkitExitFullscreen' in document) {
          await (document as Document & { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen()
        } else if ('msExitFullscreen' in document) {
          await (document as Document & { msExitFullscreen: () => Promise<void> }).msExitFullscreen()
        }
        
        const fullscreenVideo = fullscreenVideoRef.current
        if (fullscreenVideo) {
          const fullscreenHandler = (fullscreenVideo as ExtendedVideoElement)._fullscreenHandler
          if (fullscreenHandler) {
            document.removeEventListener('fullscreenchange', fullscreenHandler)
            document.removeEventListener('webkitfullscreenchange', fullscreenHandler)
            document.removeEventListener('msfullscreenchange', fullscreenHandler)
          }
          
          if (fullscreenVideo.parentElement === document.body) {
            document.body.removeChild(fullscreenVideo)
          }
          fullscreenVideoRef.current = null
        }
        
        const originalVideo = window.innerWidth >= 768 ? desktopVideoRef.current : mobileVideoRef.current
        const affectedTriggers = (originalVideo as ExtendedVideoElement)?._affectedTriggers || []
        const opacityTriggers = (originalVideo as ExtendedVideoElement)?._opacityTriggers || []
        const savedScrollY = (originalVideo as ExtendedVideoElement)?._scrollY
        
        if (typeof window !== 'undefined' && ScrollTrigger) {
          if (savedScrollY !== undefined) {
            window.scrollTo(0, savedScrollY)
          }
          
          const opacityOverlay = originalVideo?.closest(isHomepageLayout ? '.home-hero-media-block' : '.hero-media-block')?.querySelector('.opacity-overlay, .opacity-overlay-home') as HTMLElement
          if (opacityOverlay) {
            const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
            const targetOpacity = Math.min(overlayDarkness, 1)
            gsap.killTweensOf(opacityOverlay)
            opacityOverlay.style.opacity = String(targetOpacity)
          }
          
          setTimeout(() => {
            const currentScrollY = window.scrollY
            window.scrollTo(0, 0)
            
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
            
            affectedTriggers.forEach((trigger) => trigger.enable())
            opacityTriggers.forEach((trigger) => trigger.enable())
            ScrollTrigger.config({ autoRefreshEvents: 'resize,visibilitychange,DOMContentLoaded,load' })
            
            ScrollTrigger.refresh()
            
            if (opacityOverlay) {
              const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
              const targetOpacity = Math.min(overlayDarkness, 1)
              gsap.killTweensOf(opacityOverlay)
              opacityOverlay.style.opacity = String(targetOpacity)
            }
            
            if (savedScrollY !== undefined) {
              window.scrollTo(0, savedScrollY)
            } else {
              window.scrollTo(0, currentScrollY)
            }
            
            setTimeout(() => {
              if (opacityOverlay) {
                const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
                const targetOpacity = Math.min(overlayDarkness, 1)
                gsap.killTweensOf(opacityOverlay)
                opacityOverlay.style.opacity = String(targetOpacity)
              }
              
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
                
                if (originalVideo.paused) {
                  originalVideo.play().catch(() => {})
                }
              }
            }, 50)
          }, 50)
        } else {
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
            
            const opacityOverlay = originalVideo.closest(isHomepageLayout ? '.home-hero-media-block' : '.hero-media-block')?.querySelector('.opacity-overlay, .opacity-overlay-home') as HTMLElement
            if (opacityOverlay) {
              const computedOpacity = parseFloat(window.getComputedStyle(opacityOverlay).opacity)
              if (computedOpacity > 1) {
                opacityOverlay.style.opacity = ''
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
      const originalVideo = window.innerWidth >= 768 ? desktopVideoRef.current : mobileVideoRef.current
      const affectedTriggers = (originalVideo as ExtendedVideoElement)?._affectedTriggers || []
      const opacityTriggers = (originalVideo as ExtendedVideoElement)?._opacityTriggers || []
      const savedScrollY = (originalVideo as ExtendedVideoElement)?._scrollY
      
      if (originalVideo && (originalVideo as ExtendedVideoElement)._originalParent) {
        const originalParent = (originalVideo as ExtendedVideoElement)._originalParent as HTMLElement
        if (originalVideo.parentElement === document.body) {
          document.body.removeChild(originalVideo)
          originalParent.appendChild(originalVideo)
        }
      }
      
      if (typeof window !== 'undefined' && ScrollTrigger) {
        if (savedScrollY !== undefined) {
          window.scrollTo(0, savedScrollY)
        }
        
        const opacityOverlay = originalVideo?.closest(isHomepageLayout ? '.home-hero-media-block' : '.hero-media-block')?.querySelector('.opacity-overlay, .opacity-overlay-home') as HTMLElement
        if (opacityOverlay) {
          const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
          const targetOpacity = Math.min(overlayDarkness, 1)
          gsap.killTweensOf(opacityOverlay)
          opacityOverlay.style.opacity = String(targetOpacity)
        }
        
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
        
        affectedTriggers.forEach((trigger) => trigger.enable())
        opacityTriggers.forEach((trigger) => trigger.enable())
        ScrollTrigger.config({ autoRefreshEvents: 'resize,visibilitychange,DOMContentLoaded,load' })
        ScrollTrigger.refresh(true)
      }
      
      setIsFullscreen(false)
      setIsMuted(true)
    }
  }

  const handleScrollDown = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    })
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
        const fullscreenVideo = fullscreenVideoRef.current
        
        if (fullscreenVideo) {
          const fullscreenHandler = (fullscreenVideo as ExtendedVideoElement)._fullscreenHandler
          if (fullscreenHandler) {
            document.removeEventListener('fullscreenchange', fullscreenHandler)
            document.removeEventListener('webkitfullscreenchange', fullscreenHandler)
            document.removeEventListener('msfullscreenchange', fullscreenHandler)
          }
          
          if (fullscreenVideo.parentElement === document.body) {
            document.body.removeChild(fullscreenVideo)
          }
          fullscreenVideoRef.current = null
        }
        
        const originalVideo = window.innerWidth >= 768 ? desktopVideoRef.current : mobileVideoRef.current
        const affectedTriggers = (originalVideo as ExtendedVideoElement)?._affectedTriggers || []
        const opacityTriggers = (originalVideo as ExtendedVideoElement)?._opacityTriggers || []
        const savedScrollY = (originalVideo as ExtendedVideoElement)?._scrollY
        
        if (typeof window !== 'undefined' && ScrollTrigger) {
          if (savedScrollY !== undefined) {
            window.scrollTo(0, savedScrollY)
          }
          
          const opacityOverlay = originalVideo?.closest(isHomepageLayout ? '.home-hero-media-block' : '.hero-media-block')?.querySelector('.opacity-overlay, .opacity-overlay-home') as HTMLElement
          if (opacityOverlay) {
            const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
            const targetOpacity = Math.min(overlayDarkness, 1)
            gsap.killTweensOf(opacityOverlay)
            opacityOverlay.style.opacity = String(targetOpacity)
          }
          
          setTimeout(() => {
            const currentScrollY = window.scrollY
            window.scrollTo(0, 0)
            
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
            
            affectedTriggers.forEach((trigger) => trigger.enable())
            opacityTriggers.forEach((trigger) => trigger.enable())
            ScrollTrigger.config({ autoRefreshEvents: 'resize,visibilitychange,DOMContentLoaded,load' })
            
            ScrollTrigger.refresh()
            
            if (opacityOverlay) {
              const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
              const targetOpacity = Math.min(overlayDarkness, 1)
              gsap.killTweensOf(opacityOverlay)
              opacityOverlay.style.opacity = String(targetOpacity)
            }
            
            if (savedScrollY !== undefined) {
              window.scrollTo(0, savedScrollY)
            } else {
              window.scrollTo(0, currentScrollY)
            }
            
            setTimeout(() => {
              if (opacityOverlay) {
                const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
                const targetOpacity = Math.min(overlayDarkness, 1)
                gsap.killTweensOf(opacityOverlay)
                opacityOverlay.style.opacity = String(targetOpacity)
              }
              
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
                
                if (originalVideo.paused) {
                  originalVideo.play().catch(() => {})
                }
              }
            }, 50)
          }, 50)
        } else {
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
            
            const opacityOverlay = originalVideo.closest(isHomepageLayout ? '.home-hero-media-block' : '.hero-media-block')?.querySelector('.opacity-overlay, .opacity-overlay-home') as HTMLElement
            if (opacityOverlay) {
              const computedOpacity = parseFloat(window.getComputedStyle(opacityOverlay).opacity)
              if (computedOpacity > 1) {
                opacityOverlay.style.opacity = ''
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
  }, [isFullscreen, isHomepageLayout])

  // Determine the video source URL
  const getVideoSrc = () => {
    if (videoSource === 'url') {
      if (desktopBackgroundVideoUrl) {
        return desktopBackgroundVideoUrl
      }
      return ''
    }
    if (desktopBackgroundVideo) {
      return videoUrlFor(desktopBackgroundVideo)
    }
    return ''
  }

  const videoSrc = getVideoSrc()
  const hasVideo = backgroundMediaType === 'video' && (desktopBackgroundVideo || desktopBackgroundVideoUrl)

  // Render homepage layout
  if (isHomepageLayout) {
    return (
      <section className="home-hero-media-block full-height flex items-center text-white relative">
        {hasVideo && videoSrc && (
          <div className="fill-space-video-wrap">
            <video
              ref={desktopVideoRef}
              src={videoSrc}
              poster={desktopBackgroundVideoPlaceholder ? urlFor(desktopBackgroundVideoPlaceholder).url() : undefined}
              className="desktop"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <video
              ref={mobileVideoRef}
              src={videoSrc}
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
          <div className="fill-space-image-wrap">
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

        <div className="opacity-overlay opacity-overlay-home z-5" style={{ opacity: overlayDarkness }} data-overlay-darkness={overlayDarkness} />

        <h1 ref={logoRef} className="logo z-10 h-pad out-of-opacity">
          <Link href="/" className="block">
            <span className="sr-only">Belle Meade Village</span>
            <div className="desktop" aria-hidden>
              <Logo />
            </div>
            <div className="mobile" aria-hidden>
              <StackedLogo />
            </div>
          </Link>
        </h1>

        <div className="down-arrow z-10 out-of-opacity" onClick={handleScrollDown}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="12" viewBox="0 0 22 12" fill="none" >
            <path d="M21 1L11 11L1 0.999999" stroke="#FFF9F2"/>
          </svg>
        </div>

        <VideoControls
          isPlaying={isPlaying}
          isMuted={isMuted}
          onPlayPause={togglePlayPause}
          onMute={toggleMute}
          onFullscreen={toggleFullscreen}
          className="z-10 out-of-opacity"
          showControls={showControls}
        />
      </section>
    )
  }

  // Render HeroMedia layouts (layout-1, layout-2, layout-3)
  return (
    <>
      {layout === 'layout-1' && (
        <section className="hero-media-block layout-1 full-height flex items-center text-white relative">
          {backgroundMediaType === 'video' && (desktopBackgroundVideo || desktopBackgroundVideoUrl) && (
            <div className="fill-space-video-wrap media-wrap z-1">
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
            {hasCtaLink && (
              <div className="cta-font underline-link link cream">
                <a href={href} {...getExternalLinkProps(cta?.linkType)}>{text}</a>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                  <path d="M1 1L13.5 13.5L0.999999 26"/>
                </svg>
              </div>
            )}
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

