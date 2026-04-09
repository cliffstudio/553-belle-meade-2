/* eslint-disable @next/next/no-img-element */
'use client'

import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { videoUrlFor } from '../sanity/utils/videoUrlBuilder'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import { useEffect, useRef } from 'react'
import mediaLazyloading from '../utils/lazyLoad'
import 'flickity/css/flickity.css'
import { portableTextComponents } from '../utils/portableTextComponents'
import { SanityImage, SanityVideo, SanityVideoUrl } from '../types/sanity'
import { getLinkInfo } from '../utils/getLinkInfo'
import { getExternalLinkProps } from '../utils/getExternalLinkProps'
import type { CtaLink } from '../types/link'

type Slide = {
  _key?: string
  mediaType?: 'image' | 'video'
  image?: SanityImage
  video?: SanityVideo
  videoSource?: 'file' | 'url'
  videoUrl?: SanityVideoUrl
  videoPlaceholder?: SanityImage
  heading?: string
  body?: PortableTextBlock[]
  cta?: CtaLink
}

type SlideshowWithBorderProps = {
  slides?: Slide[]
}

export default function SlideshowWithBorder({ slides }: SlideshowWithBorderProps) {
  const SLIDE_DURATION_MS = 3000
  const sectionRef = useRef<HTMLElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const flickityRef = useRef<unknown>(null)

  useEffect(() => {
    let animationFrameId = 0

    const syncFlickityLayout = () => {
      if (!flickityRef.current || typeof flickityRef.current !== 'object' || !('resize' in flickityRef.current)) {
        return
      }

      ;(flickityRef.current as { resize: () => void }).resize()
    }

    const syncBlockHeight = () => {
      if (!sectionRef.current) return

      if (window.innerWidth <= 768) {
        sectionRef.current.style.height = ''
        return
      }

      // const siteHeader = document.querySelector<HTMLElement>('.site-header')
      // const viewportHeight = window.visualViewport?.height ?? window.innerHeight
      // const headerHeight = siteHeader?.offsetHeight ?? 0
      // const availableHeight = Math.max(viewportHeight - headerHeight, 0)
      // sectionRef.current.style.height = `${availableHeight}px`
    }

    const syncTextHeights = () => {
      if (!carouselRef.current) return

      const textBlocks = Array.from(carouselRef.current.querySelectorAll<HTMLElement>('.text-wrap'))
      if (textBlocks.length === 0) return

      textBlocks.forEach((block) => {
        block.style.minHeight = '0px'
      })

      const tallestHeight = textBlocks.reduce((maxHeight, block) => {
        return Math.max(maxHeight, block.offsetHeight)
      }, 0)

      textBlocks.forEach((block) => {
        block.style.minHeight = `${tallestHeight}px`
      })
    }

    const syncActiveVideo = (activeIndex: number) => {
      if (!carouselRef.current) return

      const videos = Array.from(carouselRef.current.querySelectorAll<HTMLVideoElement>('video[data-slide-index]'))
      videos.forEach((video) => {
        const videoSlideIndex = Number(video.dataset.slideIndex)
        if (videoSlideIndex === activeIndex) {
          video.currentTime = 0
          video.play().catch(() => {
            // Ignore play errors from browser autoplay policies.
          })
        } else {
          video.pause()
          video.currentTime = 0
        }
      })
    }

    if (!carouselRef.current || !slides || slides.length === 0) return

    const initializeFlickity = async () => {
      try {
        const Flickity = (await import('flickity')).default
        await import('flickity-fade')

        if (carouselRef.current) {
          const flickityOptions = {
            cellAlign: 'left',
            prevNextButtons: false,
            pageDots: false,
            imagesLoaded: true,
            lazyLoad: true,
            wrapAround: false,
            fade: true,
            draggable: false,
            on: {
              ready: () => {
                mediaLazyloading()
              },
            },
          }

          const flickityInstance = new Flickity(carouselRef.current, flickityOptions)

          flickityRef.current = flickityInstance

          const slideCount = slides.length
          const totalCycleDuration = slideCount * SLIDE_DURATION_MS
          const cycleStartTime = performance.now()
          let activeSlideIndex = -1

          const animateProgress = (timestamp: number) => {
            const elapsedInCycle = (timestamp - cycleStartTime) % totalCycleDuration
            const activeSegmentIndex = Math.floor(elapsedInCycle / SLIDE_DURATION_MS) % slideCount
            const overallProgress = elapsedInCycle / totalCycleDuration
            const barWidthPercentage = overallProgress * 100

            const progressBars = sectionRef.current?.querySelectorAll<HTMLElement>(
              '.slideshow-with-border-block__progress-bar'
            )
            progressBars?.forEach((progressBar) => {
              progressBar.style.width = `${barWidthPercentage}%`
              progressBar.style.transform = 'translateX(0)'
            })

            if (activeSegmentIndex !== activeSlideIndex) {
              activeSlideIndex = activeSegmentIndex
              ;(flickityInstance as { select: (index: number, isWrapped?: boolean, isInstant?: boolean) => void }).select(
                activeSegmentIndex,
                false,
                false
              )
              syncActiveVideo(activeSegmentIndex)
            }

            animationFrameId = window.requestAnimationFrame(animateProgress)
          }

          animationFrameId = window.requestAnimationFrame(animateProgress)

          requestAnimationFrame(() => {
            try {
              syncTextHeights()
              syncFlickityLayout()
            } catch (error) {
              console.error('Error syncing text heights:', error)
            }
          })
        }
      } catch (error) {
        console.error('Failed to load Flickity:', error)
      }
    }

    initializeFlickity()
    syncBlockHeight()
    syncTextHeights()
    syncFlickityLayout()

    const handleResize = () => {
      syncBlockHeight()
      syncTextHeights()
      syncFlickityLayout()
    }
    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)

    const siteHeader = document.querySelector<HTMLElement>('.site-header')
    let headerResizeObserver: ResizeObserver | null = null
    if (siteHeader && 'ResizeObserver' in window) {
      headerResizeObserver = new ResizeObserver(() => {
        syncBlockHeight()
      })
      headerResizeObserver.observe(siteHeader)
    }

    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        syncBlockHeight()
        syncTextHeights()
        syncFlickityLayout()
      })
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
      headerResizeObserver?.disconnect()
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId)
      }

      if (flickityRef.current && typeof flickityRef.current === 'object' && 'destroy' in flickityRef.current) {
        const flickityInstance = flickityRef.current as { destroy: () => void }
        flickityInstance.destroy()
        flickityRef.current = null
      }
    }
  }, [slides])

  if (!slides || slides.length === 0) {
    return null
  }

  return (
    <section ref={sectionRef} className="slideshow-with-border-block h-pad">
      <div ref={carouselRef} className="carousel flickity-enabled">
        {slides.map((item, index) => {
          const mediaType = item.mediaType || 'image'
          const isVideo = mediaType === 'video' && (item.video || item.videoUrl)
          const isImage = mediaType === 'image' && item.image

          if (!isImage && !isVideo) {
            return null
          }

          const { text: ctaText, href: ctaHref } = getLinkInfo(item.cta)

          return (
            <div key={item._key || index} className="carousel-cell">
              <div className="media-wrap out-of-opacity">
                {isImage && item.image && (
                  <>
                    <img
                      data-src={urlFor(item.image).url()}
                      alt={item.image?.alt ?? ''}
                      className="lazy full-bleed-image"
                      style={{
                        objectPosition: item.image?.hotspot
                          ? `${item.image.hotspot.x * 100}% ${item.image.hotspot.y * 100}%`
                          : 'center',
                      }}
                    />
                    <div className="loading-overlay" />
                  </>
                )}
                {isVideo && (
                  <div className="fill-space-video-wrap out-of-opacity">
                    <video
                      data-slide-index={index}
                      src={
                        item.videoSource === 'url' && item.videoUrl ? item.videoUrl : videoUrlFor(item.video)
                      }
                      poster={item.videoPlaceholder ? urlFor(item.videoPlaceholder).url() : undefined}
                      muted
                      playsInline
                      preload="metadata"
                    />
                  </div>
                )}

                <div className="slideshow-with-border-block__progress" aria-hidden="true">
                  <div className="slideshow-with-border-block__progress-track" />
                  <div className="slideshow-with-border-block__progress-bar" />
                </div>
              </div>

              {(item.heading || item.body?.length || ctaHref) && (
                <div className="text-wrap max-width-small-text out-of-view">
                  {item.heading && <h2 className="heading">{item.heading}</h2>}
                  {item.body && item.body.length > 0 && (
                    <div>
                      <PortableText value={item.body} components={portableTextComponents} />
                    </div>
                  )}
                  {ctaHref && (
                    <div className="cta-font underline-link link">
                      <a
                        href={ctaHref}
                        {...getExternalLinkProps(item.cta?.linkType)}
                      >
                        {ctaText}
                      </a>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                        <path d="M1 1L13.5 13.5L0.999999 26" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
