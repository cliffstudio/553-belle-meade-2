/* eslint-disable @next/next/no-img-element */
"use client"

import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { PortableText } from '@portabletext/react'
import { SanityImage, PortableTextBlock, SanityVideo } from '../types/sanity'
import { videoUrlFor } from '@/sanity/utils/videoUrlBuilder'
import VideoControls from './VideoControls'
import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { portableTextComponents } from '../utils/portableTextComponents'
import { getLinkInfo } from '../utils/getLinkInfo'
import { getExternalLinkProps } from '../utils/getExternalLinkProps'
import type { CtaLink } from '../types/link'
import {
  getSectionBackgroundColor,
  type SectionBackgroundColour,
} from '../utils/getSectionBackgroundColor'

// Extended types for fullscreen API
interface ExtendedDocument extends Document {
  webkitFullscreenElement?: Element | null
  msFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
}

interface ExtendedVideoElement extends HTMLVideoElement {
  _affectedTriggers?: ScrollTrigger[]
  _scrollY?: number
  _fullscreenHandler?: () => void
}

type StackedMediaTextProps = {
  layout?: 'layout-1' | 'layout-2'
  mediaType?: 'image' | 'video'
  image?: SanityImage
  video?: SanityVideo
  videoSource?: 'file' | 'url'
  videoUrl?: string
  heading?: string
  body?: PortableTextBlock[]
  cta?: CtaLink
  showControls?: boolean
  backgroundColour?: SectionBackgroundColour
}

export default function StackedMediaText({ layout = 'layout-1', mediaType = 'image', image, video, videoSource = 'file', videoUrl, heading, body, cta, showControls = false, backgroundColour }: StackedMediaTextProps) {
  const { text, href } = getLinkInfo(cta)
  
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const togglePlayPause = () => {
    const video = videoRef.current
    
    if (isPlaying) {
      // Pause video
      if (video) video.pause()
      setIsPlaying(false)
    } else {
      // Play video
      if (video) video.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    
    if (isMuted) {
      // Unmute video
      if (video) video.muted = false
      setIsMuted(false)
    } else {
      // Mute video
      if (video) video.muted = true
      setIsMuted(true)
    }
  }

  const toggleFullscreen = async () => {
    console.log('StackedMediaText: toggleFullscreen called!')
    const video = videoRef.current
    
    if (!video) return

    try {
      if (!isFullscreen) {
        // Save current scroll position and video state before entering fullscreen
        const scrollY = window.scrollY
        const videoWrap = video.closest('.fill-space-video-wrap') as HTMLElement
        
        // Temporarily disable ScrollTrigger instances that might affect the video
        let affectedTriggers: ScrollTrigger[] = []
        if (typeof window !== 'undefined' && ScrollTrigger) {
          const allTriggers = ScrollTrigger.getAll()
          affectedTriggers = allTriggers.filter(trigger => {
            const triggerElement = trigger.vars?.trigger as Element
            if (!triggerElement) return false
            
            // Check if trigger affects the video or its wrapper
            const isVideoRelated = 
              videoWrap?.contains(triggerElement) || 
              triggerElement.contains(video) ||
              triggerElement.contains(videoWrap) ||
              (videoWrap && triggerElement === videoWrap) ||
              triggerElement === video
            
            // Also check if trigger is pinning a parent element that contains the video
            const isPinningParent = trigger.vars?.pin && (
              triggerElement.contains(video) ||
              triggerElement.contains(videoWrap)
            )
            
            return isVideoRelated || isPinningParent
          })
          // Disable these specific triggers
          affectedTriggers.forEach(trigger => trigger.disable())
          // Prevent ScrollTrigger from refreshing
          ScrollTrigger.config({ autoRefreshEvents: 'none' })
        }
        
        // Create a clone of the video element for fullscreen
        const fullscreenVideoClone = video.cloneNode(true) as HTMLVideoElement
        
        // Copy all important properties
        fullscreenVideoClone.src = video.src
        fullscreenVideoClone.currentTime = video.currentTime
        fullscreenVideoClone.muted = false
        fullscreenVideoClone.autoplay = true
        fullscreenVideoClone.loop = video.loop
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
        
        // Add clone to body
        document.body.appendChild(fullscreenVideoClone)
        
        // Wait for clone to be ready
        await new Promise<void>((resolve) => {
          if (fullscreenVideoClone.readyState >= 2) {
            resolve()
          } else {
            fullscreenVideoClone.addEventListener('loadedmetadata', () => resolve(), { once: true })
            fullscreenVideoClone.load()
          }
        })
        
        // Wait a moment for DOM to update
        await new Promise(resolve => setTimeout(resolve, 50))
        
        // Enter fullscreen with the clone
        if (fullscreenVideoClone.requestFullscreen) {
          await fullscreenVideoClone.requestFullscreen()
        } else if ('webkitRequestFullscreen' in fullscreenVideoClone) {
          await (fullscreenVideoClone as HTMLVideoElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen()
        } else if ('msRequestFullscreen' in fullscreenVideoClone) {
          await (fullscreenVideoClone as HTMLVideoElement & { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen()
        }
        
        // Ensure controls are visible after entering fullscreen
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
        
        // Store reference to clone for cleanup
        fullscreenVideoRef.current = fullscreenVideoClone
        ;(video as ExtendedVideoElement)._affectedTriggers = affectedTriggers
        ;(video as ExtendedVideoElement)._scrollY = scrollY
        
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
        const originalVideo = videoRef.current
        const affectedTriggers = (originalVideo as ExtendedVideoElement)?._affectedTriggers || []
        const savedScrollY = (originalVideo as ExtendedVideoElement)?._scrollY
        
        if (typeof window !== 'undefined' && ScrollTrigger) {
          // Re-enable the affected triggers
          affectedTriggers.forEach(trigger => trigger.enable())
          // Restore ScrollTrigger refresh events
          ScrollTrigger.config({ autoRefreshEvents: 'resize,visibilitychange,DOMContentLoaded,load' })
          
          // Restore scroll position first, then refresh ScrollTrigger
          if (savedScrollY !== undefined) {
            window.scrollTo(0, savedScrollY)
          }
          
          // Small delay before refresh to ensure fullscreen cleanup is complete
          setTimeout(() => {
            ScrollTrigger.refresh()
            
            // Ensure original video is visible and playing after ScrollTrigger refresh
            if (videoRef.current) {
              videoRef.current.style.transform = ''
              videoRef.current.style.visibility = 'visible'
              videoRef.current.style.opacity = '1'
              
              // Also fix the video wrapper if it exists
              const videoWrap = videoRef.current.closest('.fill-space-video-wrap') as HTMLElement
              if (videoWrap) {
                videoWrap.style.transform = ''
                videoWrap.style.visibility = 'visible'
                videoWrap.style.opacity = '1'
              }
              
              // Fix opacity-overlay if it exists (might be set to 2 by ScrollTrigger)
              const opacityOverlay = videoRef.current.closest('.stacked-media-text-block, .hero-media-block')?.querySelector('.opacity-overlay') as HTMLElement
              if (opacityOverlay) {
                // Get the original overlayDarkness value
                const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
                const targetOpacity = Math.min(overlayDarkness, 1)
                
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
              
              if (videoRef.current.paused) {
                videoRef.current.play().catch(() => {})
              }
            }
          }, 100)
        } else {
          // If ScrollTrigger not available, still restore video
          if (videoRef.current) {
            videoRef.current.style.transform = ''
            videoRef.current.style.visibility = 'visible'
            videoRef.current.style.opacity = '1'
            const videoWrap = videoRef.current.closest('.fill-space-video-wrap') as HTMLElement
            if (videoWrap) {
              videoWrap.style.transform = ''
              videoWrap.style.visibility = 'visible'
              videoWrap.style.opacity = '1'
            }
            
            // Fix opacity-overlay if it exists (might be set to 2 by ScrollTrigger)
            const opacityOverlay = videoRef.current.closest('.stacked-media-text-block, .hero-media-block')?.querySelector('.opacity-overlay') as HTMLElement
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
            
            if (videoRef.current.paused) {
              videoRef.current.play().catch(() => {})
            }
          }
        }
        
        setIsFullscreen(false)
        setIsMuted(true)
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
      // Restore ScrollTrigger on error
      const fullscreenVideo = fullscreenVideoRef.current
      const affectedTriggers = (fullscreenVideo as ExtendedVideoElement)?._affectedTriggers || []
      const savedScrollY = (fullscreenVideo as ExtendedVideoElement)?._scrollY
      
      if (typeof window !== 'undefined' && ScrollTrigger) {
        // Re-enable the affected triggers
        affectedTriggers.forEach(trigger => trigger.enable())
        // Restore ScrollTrigger refresh events
        ScrollTrigger.config({ autoRefreshEvents: 'resize,visibilitychange,DOMContentLoaded,load' })
        
        // Restore scroll position if saved
        if (savedScrollY !== undefined) {
          window.scrollTo(0, savedScrollY)
        }
      }
      
      // Clean up fullscreen video element if it exists
      if (fullscreenVideo) {
        try {
          document.body.removeChild(fullscreenVideo)
        } catch {
          // Element might already be removed
        }
        fullscreenVideoRef.current = null
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
        // User exited fullscreen via browser controls
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
        const originalVideo = videoRef.current
        const affectedTriggers = (originalVideo as ExtendedVideoElement)?._affectedTriggers || []
        const savedScrollY = (originalVideo as ExtendedVideoElement)?._scrollY
        
        if (typeof window !== 'undefined' && ScrollTrigger) {
          // Re-enable the affected triggers
          affectedTriggers.forEach(trigger => trigger.enable())
          // Restore ScrollTrigger refresh events
          ScrollTrigger.config({ autoRefreshEvents: 'resize,visibilitychange,DOMContentLoaded,load' })
          
          // Restore scroll position first, then refresh ScrollTrigger
          if (savedScrollY !== undefined) {
            window.scrollTo(0, savedScrollY)
          }
          
          // Small delay before refresh to ensure fullscreen cleanup is complete
          setTimeout(() => {
            ScrollTrigger.refresh()
            
            // Ensure original video is visible and playing after ScrollTrigger refresh
            if (videoRef.current) {
              videoRef.current.style.transform = ''
              videoRef.current.style.visibility = 'visible'
              videoRef.current.style.opacity = '1'
              
              // Also fix the video wrapper if it exists
              const videoWrap = videoRef.current.closest('.fill-space-video-wrap') as HTMLElement
              if (videoWrap) {
                videoWrap.style.transform = ''
                videoWrap.style.visibility = 'visible'
                videoWrap.style.opacity = '1'
              }
              
              // Fix opacity-overlay if it exists (might be set to 2 by ScrollTrigger)
              const opacityOverlay = videoRef.current.closest('.stacked-media-text-block, .hero-media-block')?.querySelector('.opacity-overlay') as HTMLElement
              if (opacityOverlay) {
                // Get the original overlayDarkness value
                const overlayDarkness = parseFloat(opacityOverlay.getAttribute('data-overlay-darkness') || '0.3')
                const targetOpacity = Math.min(overlayDarkness, 1)
                
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
              
              if (videoRef.current.paused) {
                videoRef.current.play().catch(() => {})
              }
            }
          }, 100)
        } else {
          // If ScrollTrigger not available, still restore video
          if (videoRef.current) {
            videoRef.current.style.transform = ''
            videoRef.current.style.visibility = 'visible'
            videoRef.current.style.opacity = '1'
            const videoWrap = videoRef.current.closest('.fill-space-video-wrap') as HTMLElement
            if (videoWrap) {
              videoWrap.style.transform = ''
              videoWrap.style.visibility = 'visible'
              videoWrap.style.opacity = '1'
            }
            
            // Fix opacity-overlay if it exists (might be set to 2 by ScrollTrigger)
            const opacityOverlay = videoRef.current.closest('.stacked-media-text-block, .hero-media-block')?.querySelector('.opacity-overlay') as HTMLElement
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
            
            if (videoRef.current.paused) {
              videoRef.current.play().catch(() => {})
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

  // Background color scroll trigger for layout-1
  useEffect(() => {
    // Only set up scroll trigger for layout-1
    if (layout !== 'layout-1' || !sectionRef.current) return
    if (!backgroundColour || backgroundColour === 'None') return

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger)

    // Get the colour-background elements
    const colourBackgrounds = sectionRef.current.querySelectorAll('.colour-background')

    // Initialize opacity to 0 if backgrounds exist
    if (colourBackgrounds.length > 0) {
      gsap.set(colourBackgrounds, { opacity: 0 })
    }

    // Create scroll trigger to fade in colour background when section comes into view
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 50%",
      end: "bottom top",
      onEnter: () => {
        colourBackgrounds.forEach(bg => {
          gsap.to(bg, {
            opacity: 1,
            duration: 0.8,
            ease: "cubic-bezier(0.25,0.1,0.25,1)"
          })
        })
      },
      onEnterBack: () => {
        colourBackgrounds.forEach(bg => {
          gsap.to(bg, {
            opacity: 1,
            duration: 0.8,
            ease: "cubic-bezier(0.25,0.1,0.25,1)"
          })
        })
      },
    })

    // Cleanup
    return () => {
      trigger.kill()
    }
  }, [layout, backgroundColour])

  return (
    <>
    
      {layout === 'layout-1' && (
        <section ref={sectionRef} className="stacked-media-text-block layout-1 h-pad row-lg">
          {backgroundColour && backgroundColour !== 'None' && (
            <div className="colour-background" style={{ backgroundColor: getSectionBackgroundColor(backgroundColour) }}></div>
          )}

          {(heading || body) && (
            <div className="col-4-12_lg">
              <div className="text-wrap max-width-small-text out-of-view">
                {heading && <h2 className="heading">{heading}</h2>}
                
                {body && <div><PortableText value={body} components={portableTextComponents} /></div>}

                {href && <div className="cta-font underline-link link">
                  <a href={href} {...getExternalLinkProps(cta?.linkType)}>{text}</a>

                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                    <path d="M1 1L13.5 13.5L0.999999 26"/>
                  </svg>
                </div>}
              </div>
            </div>
          )}

          <div className="col-1-12_lg desktop"></div>

          <div className="col-7-12_lg">
            {mediaType === 'image' && image && (
              <div className="media-wrap out-of-opacity">
                <img 
                data-src={urlFor(image).url()}
                alt={image?.alt ?? ''}
                className="lazy full-bleed-image"
                style={{
                  objectPosition: image?.hotspot
                    ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`
                    : "center",
                }}
                />
                <div className="loading-overlay" />
              </div>
            )}
            
            {mediaType === 'video' && (video || videoUrl) && (
              <div className="media-wrap out-of-opacity">
                <div className="fill-space-video-wrap">
                  <video
                    ref={videoRef}
                    src={videoSource === 'url' && videoUrl ? videoUrl : videoUrlFor(video)}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                </div>
                
                <VideoControls
                  isPlaying={isPlaying}
                  isMuted={isMuted}
                  onPlayPause={togglePlayPause}
                  onMute={toggleMute}
                  onFullscreen={toggleFullscreen}
                  className="z-10 stacked-media-text-controls"
                  style={{ opacity: 1, pointerEvents: 'auto' }}
                  showControls={showControls}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {layout === 'layout-2' && (
        <section ref={sectionRef} className="stacked-media-text-block layout-2 h-pad">
          {backgroundColour && backgroundColour !== 'None' && (
            <div className="colour-background" style={{ backgroundColor: getSectionBackgroundColor(backgroundColour) }}></div>
          )}
          <div className="row-lg">
            <div className="col-9-12_lg">
              {mediaType === 'image' && image && (
                <div className="media-wrap out-of-opacity">
                  <img 
data-src={urlFor(image).url()}
                alt={image?.alt ?? ''}
                  className="lazy full-bleed-image"
                  />
                  <div className="loading-overlay" />
                </div>
              )}
            
              {mediaType === 'video' && (video || videoUrl) && (
                <div className="media-wrap out-of-opacity">
                  <div className="fill-space-video-wrap">
                    <video
                      ref={videoRef}
                      src={videoSource === 'url' && videoUrl ? videoUrl : videoUrlFor(video)}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="col-3-12_lg desktop"></div>
          </div>

          {(heading || body) && (
            <div className="row-lg">
              <div className="col-4-12_lg">
                <div className="text-wrap max-width-small-text out-of-view">
                  {heading && <h2 className="heading">{heading}</h2>}
                  
                  {body && <div><PortableText value={body} components={portableTextComponents} /></div>}

                  {href && <div className="cta-font underline-link link">
                    <a href={href} {...getExternalLinkProps(cta?.linkType)}>{text}</a>

                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                      <path d="M1 1L13.5 13.5L0.999999 26"/>
                    </svg>
                  </div>}
                </div>
              </div>

              <div className="col-8-12_lg desktop"></div>
            </div>
          )}
        </section>
      )}

    </>
  )
}
