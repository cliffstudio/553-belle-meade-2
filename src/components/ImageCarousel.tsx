/* eslint-disable @next/next/no-img-element */
"use client"

import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { videoUrlFor } from '../sanity/utils/videoUrlBuilder'
import { SanityImage, SanityVideo, SanityVideoUrl } from '../types/sanity'
import { PortableText } from '@portabletext/react'
import { PortableTextBlock } from '@portabletext/react'
import { useEffect, useRef, useState } from 'react'
import mediaLazyloading from '../utils/lazyLoad'
import 'flickity/css/flickity.css'
import { portableTextComponents } from '../utils/portableTextComponents'

type ImageWithCaption = {
  mediaType?: 'image' | 'video'
  image?: SanityImage
  video?: SanityVideo
  videoSource?: 'file' | 'url'
  videoUrl?: SanityVideoUrl
  caption?: string
  imageSize?: '16:9' | '1:1' | '4:3' | '2:3'
}

type ImageCarouselProps = {
  heading?: string
  body?: PortableTextBlock[]
  images?: ImageWithCaption[]
}

export default function ImageCarousel({ heading, body, images }: ImageCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const flickityRef = useRef<unknown>(null)
  const [isPreviousDisabled, setIsPreviousDisabled] = useState(false)
  const [isNextDisabled, setIsNextDisabled] = useState(false)

  useEffect(() => {
    const updateButtonStates = (flickityInstance: {
      selectedIndex?: number
      cells?: { length: number }
      options?: { wrapAround?: boolean }
    }) => {
      // Defensive checks - ensure instance is fully initialized
      if (!flickityInstance || flickityInstance.cells === undefined || flickityInstance.selectedIndex === undefined) {
        return
      }

      const wrapAround = flickityInstance.options?.wrapAround ?? false
      const selectedIndex = flickityInstance.selectedIndex
      const cellCount = flickityInstance.cells.length

      // If there's only one slide, disable both buttons
      if (cellCount <= 1) {
        setIsPreviousDisabled(true)
        setIsNextDisabled(true)
        return
      }

      if (wrapAround) {
        // If wrapAround is enabled, buttons are never disabled
        setIsPreviousDisabled(false)
        setIsNextDisabled(false)
      } else {
        // Disable previous button if at first slide
        setIsPreviousDisabled(selectedIndex === 0)
        // Disable next button if at last slide
        setIsNextDisabled(selectedIndex === cellCount - 1)
      }
    }
    if (!carouselRef.current || !images || images.length === 0) return

    // Dynamically import Flickity only on client side
    const initializeFlickity = async () => {
      try {
        // Import Flickity dynamically
        const Flickity = (await import('flickity')).default

        // Initialize Flickity
        if (carouselRef.current) {
          // Create instance
          let flickityInstance: typeof Flickity.prototype | null = null
          
          flickityInstance = new Flickity(carouselRef.current, {
            cellAlign: 'left',
            prevNextButtons: false,
            pageDots: false,
            imagesLoaded: true,
            lazyLoad: true,
            wrapAround: false,
            on: {
              ready: () => {
                mediaLazyloading()
              }
            }
          })
          
          // Assign to ref immediately after creation
          flickityRef.current = flickityInstance
          
          // Attach select event listener after instance is created and assigned
          const handleSelect = () => {
            try {
              // Use ref to ensure we have the latest instance
              if (flickityRef.current) {
                updateButtonStates(flickityRef.current as {
                  selectedIndex?: number
                  cells?: { length: number }
                  options?: { wrapAround?: boolean }
                })
              }
            } catch (error) {
              console.error('Error updating button states:', error)
            }
          }
          
          flickityInstance.on('select', handleSelect)
          
          // Update button states after instance is fully set up
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            try {
              if (flickityRef.current) {
                updateButtonStates(flickityRef.current as {
                  selectedIndex?: number
                  cells?: { length: number }
                  options?: { wrapAround?: boolean }
                })
              }
            } catch (error) {
              console.error('Error updating initial button states:', error)
            }
          })
        }
      } catch (error) {
        console.error('Failed to load Flickity:', error)
      }
    }

    initializeFlickity()

    // Cleanup function
    return () => {
      if (flickityRef.current && typeof flickityRef.current === 'object' && 'destroy' in flickityRef.current) {
        const flickityInstance = flickityRef.current as { destroy: () => void }
        flickityInstance.destroy()
        flickityRef.current = null
      }
    }
  }, [images])

  if (!images || images.length === 0) {
    return null
  }

  const handlePrevious = () => {
    if (isPreviousDisabled) return
    if (flickityRef.current && typeof flickityRef.current === 'object' && 'previous' in flickityRef.current) {
      const flickityInstance = flickityRef.current as { previous: () => void }
      flickityInstance.previous()
    }
  }

  const handleNext = () => {
    if (isNextDisabled) return
    if (flickityRef.current && typeof flickityRef.current === 'object' && 'next' in flickityRef.current) {
      const flickityInstance = flickityRef.current as { next: () => void }
      flickityInstance.next()
    }
  }

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
      default:
        return 'aspect-16-9'
    }
  }

  return (
    <section className="image-carousel-block">
      <div className="h-pad">
        {(heading || body) && (
          <div className="carousel-header row-lg">
            <div className="col-11-12_lg">
              <div className="text-wrap max-width-small-text out-of-view">
                {heading && <h2 className="heading">{heading}</h2>}

                {body && (
                  <div className="carousel-body">
                    <PortableText value={body} components={portableTextComponents} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="carousel-container">
          <button 
            className={`left-arrow ${isPreviousDisabled ? 'flickity-button-disabled' : ''}`}
            onClick={handlePrevious} 
            type="button"
            disabled={isPreviousDisabled}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
              <path d="M1 1L13.5 13.5L0.999999 26"/>
            </svg>
          </button>

          <div 
            ref={carouselRef}
            className="carousel flickity-enabled"
            data-flickity='{"cellAlign": "center", "contain": true, "wrapAround": true}'
          >
            {images.map((item, index) => {
              const mediaType = item.mediaType || 'image'
              const isVideo = mediaType === 'video' && (item.video || item.videoUrl)
              const isImage = mediaType === 'image' && item.image
              
              if (!isImage && !isVideo) {
                return null
              }

              return (
                <div key={index} className="carousel-cell">
                  <div className={`media-wrap ${getAspectRatioClass(item.imageSize)}`}>
                    {isImage && item.image && (
                      <>
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
                      </>
                    )}
                    {isVideo && (
                      <div className="fill-space-video-wrap">
                        <video
                          src={item.videoSource === 'url' && item.videoUrl ? item.videoUrl : videoUrlFor(item.video)}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        />
                      </div>
                    )}
                  </div>

                  {item.caption && (
                    <div className="caption caption-font">{item.caption}</div>
                  )}
                </div>
              )
            })}
          </div>

          <button 
            className={`right-arrow ${isNextDisabled ? 'flickity-button-disabled' : ''}`}
            onClick={handleNext} 
            type="button"
            disabled={isNextDisabled}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
              <path d="M1 1L13.5 13.5L0.999999 26"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}