'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import { BrandDirectoryItem } from './types'

interface BrandListProps {
  items: BrandDirectoryItem[]
  activeIndex: number
  progressIndex: number
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function BrandList({ items, activeIndex, progressIndex }: BrandListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const activeIndexRef = useRef(activeIndex)
  const prevActiveIndexRef = useRef(activeIndex)
  const hasMountedRef = useRef(false)

  activeIndexRef.current = activeIndex

  const updateEndPadding = useCallback(() => {
    const container = scrollRef.current
    const inner = innerRef.current
    if (!container || !inner) return
    const half = Math.max(container.clientHeight / 2, 0)
    inner.style.paddingTop = `${half}px`
    inner.style.paddingBottom = `${half}px`
  }, [])

  const scrollActiveIntoCenter = useCallback((behavior: ScrollBehavior) => {
    const container = scrollRef.current
    const inner = innerRef.current
    const idx = activeIndexRef.current
    const item = itemRefs.current[idx]
    if (!container || !inner || !item) return

    const ch = container.clientHeight
    if (ch <= 0) return

    const itemCenter = item.offsetTop + item.offsetHeight / 2
    const target = itemCenter - ch / 2
    const maxScroll = Math.max(0, container.scrollHeight - ch)
    const nextTop = Math.min(Math.max(target, 0), maxScroll)

    if (Math.abs(container.scrollTop - nextTop) < 0.5) return

    container.scrollTo({ top: nextTop, behavior })
  }, [])

  useLayoutEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length)
  }, [items.length])

  useLayoutEffect(() => {
    updateEndPadding()
    const behavior: ScrollBehavior =
      !hasMountedRef.current || prefersReducedMotion() ? 'auto' : 'smooth'
    hasMountedRef.current = true
    scrollActiveIntoCenter(behavior)
  }, [activeIndex, items, scrollActiveIntoCenter, updateEndPadding])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const onResize = () => {
      updateEndPadding()
      scrollActiveIntoCenter('auto')
    }

    const ro = new ResizeObserver(onResize)
    ro.observe(container)
    window.addEventListener('resize', onResize)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [scrollActiveIntoCenter, updateEndPadding])

  useEffect(() => {
    if (prevActiveIndexRef.current === activeIndex) return
    prevActiveIndexRef.current = activeIndex
    const id = window.setTimeout(() => {
      updateEndPadding()
      scrollActiveIntoCenter('auto')
    }, 450)
    return () => window.clearTimeout(id)
  }, [activeIndex, scrollActiveIntoCenter, updateEndPadding])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: 'auto' })
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div className="brand-directory-list__left">
      <div ref={scrollRef} className="brand-directory-list__scroll" role="region" aria-label="Brand list">
        <div ref={innerRef} className="brand-directory-list__scroll-inner">
          {items.map((brand, index) => {
            const distanceFromProgress = Math.abs(progressIndex - index)
            const style = {
              '--brand-row-opacity': Math.max(0.5, 1 - distanceFromProgress * 0.5),
            } as React.CSSProperties

            return (
              <Link
                key={brand.id}
                ref={(node) => {
                  itemRefs.current[index] = node
                }}
                href={brand.href}
                className={`brand-directory-list__title-wrap ${activeIndex === index ? 'is-active' : ''}`}
                style={style}
              >
                <span className="brand-directory-list__title h1">{brand.title}</span>
                {brand.shortDescription && (
                  <span className="brand-directory-list__description">{brand.shortDescription}</span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BrandList
