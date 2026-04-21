/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { PortableText } from '@portabletext/react'
import BrandList from './BrandList'
import { portableTextComponents } from '../../utils/portableTextComponents'
import { urlFor } from '../../sanity/utils/imageUrlBuilder'
import { BrandDirectoryCategory, BrandDirectoryItem } from './types'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

interface BrandDirectorySectionProps {
  items: BrandDirectoryItem[]
  renderCategoryIcon: (category?: BrandDirectoryCategory) => React.ReactNode
}

function BrandDirectorySection({ items, renderCategoryIcon }: BrandDirectorySectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [progressIndex, setProgressIndex] = useState(0)
  const activeIndexRef = useRef(0)
  const progressIndexRef = useRef(0)

  const maxIndex = Math.max(items.length - 1, 0)
  const stickySteps = Math.max(items.length - 1, 1)

  useEffect(() => {
    setActiveIndex(0)
    setProgressIndex(0)
    activeIndexRef.current = 0
    progressIndexRef.current = 0
  }, [items])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let ticking = false

    const updateProgress = () => {
      ticking = false
      const wrapper = wrapperRef.current
      if (!wrapper) return

      if (window.innerWidth <= 768) {
        if (progressIndexRef.current !== 0) {
          progressIndexRef.current = 0
          setProgressIndex(0)
        }
        if (activeIndexRef.current !== 0) {
          activeIndexRef.current = 0
          setActiveIndex(0)
        }
        return
      }

      const rect = wrapper.getBoundingClientRect()
      const scrollRange = Math.max(rect.height - window.innerHeight, 1)
      const progress = Math.min(Math.max((-rect.top) / scrollRange, 0), 1)
      const nextProgressIndex = progress * maxIndex
      const nextActiveIndex = Math.round(nextProgressIndex)
      const clampedActiveIndex = Math.min(Math.max(nextActiveIndex, 0), maxIndex)

      if (Math.abs(progressIndexRef.current - nextProgressIndex) > 0.001) {
        progressIndexRef.current = nextProgressIndex
        setProgressIndex(nextProgressIndex)
      }
      if (activeIndexRef.current !== clampedActiveIndex) {
        activeIndexRef.current = clampedActiveIndex
        setActiveIndex(clampedActiveIndex)
      }
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [maxIndex])

  const cards = useMemo(
    () =>
      items.map((brand, index) => {
        const distance = Math.abs(progressIndex - index)
        const isActive = activeIndex === index
        const opacity = isActive ? 1 : Math.max(0, 1 - distance * 1.8)

        const style = {
          '--brand-card-opacity': opacity,
        } as React.CSSProperties

        return (
          <article
            key={brand.id}
            className={`brand-directory-list__card ${isActive ? 'is-active' : ''}`}
            style={style}
            aria-hidden={!isActive}
          >
            {brand.image && (
              <div className="media-wrap relative">
                <img src={urlFor(brand.image).url()} alt={brand.image?.alt ?? brand.title} className="full-bleed-image" />
                <a href={brand.href}></a>
              </div>
            )}

            <div className="brand-directory-list__meta">
              <div className="details">
                {brand.openingHours && (
                  <div className="detail">
                    <div className="detail-heading cta-font">Opening Hours</div>
                    <PortableText value={brand.openingHours} components={portableTextComponents} />
                  </div>
                )}

                {brand.address && (
                  <div className="detail">
                    <div className="detail-heading cta-font">Address</div>
                    <PortableText value={brand.address} components={portableTextComponents} />
                  </div>
                )}
              </div>

              <div className="link-wrap">
                {renderCategoryIcon(brand.category)}

                <div className="cta-font underline-link link">
                  <a href={brand.href}>More Info</a>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                    <path d="M1 1L13.5 13.5L0.999999 26" />
                  </svg>
                </div>
              </div>
            </div>
          </article>
        )
      }),
    [activeIndex, items, progressIndex, renderCategoryIcon]
  )

  if (!items.length) {
    return null
  }

  return (
    <>
      <div
        ref={wrapperRef}
        className="brand-directory-scroll-sequence"
        style={
          {
            '--brand-directory-steps': stickySteps,
          } as React.CSSProperties
        }
      >
        <div className="brand-directory-scroll-sticky">
          <div className={`brand-directory-list h-pad ${items.length < 5 ? 'has-few-items' : ''}`}>
            <BrandList items={items} activeIndex={activeIndex} progressIndex={progressIndex} />
            <div className="brand-directory-list__right">{cards}</div>
          </div>
        </div>
      </div>

      <div className="brand-directory-list-mobile h-pad">
        {items.map((brand) => (
          <div key={brand.id} className="brand-directory-list-mobile__item">
            <Link href={brand.href} className="brand-directory-list__title-wrap is-active">
              <span className="brand-directory-list__title h2">{brand.title}</span>
              {brand.shortDescription && <span className="brand-directory-list__description">{brand.shortDescription}</span>}
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}

export default BrandDirectorySection
