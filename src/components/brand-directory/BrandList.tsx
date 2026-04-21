import React from 'react'
import Link from 'next/link'
import { BrandDirectoryItem } from './types'

interface BrandListProps {
  items: BrandDirectoryItem[]
  activeIndex: number
  progressIndex: number
}

function BrandList({ items, activeIndex, progressIndex }: BrandListProps) {
  return (
    <div className="brand-directory-list__left" aria-label="Brand list">
      {items.map((brand, index) => {
        const distanceFromProgress = Math.abs(progressIndex - index)
        const style = {
          '--brand-row-opacity': Math.max(0.5, 1 - distanceFromProgress * 0.5),
        } as React.CSSProperties

        return (
          <Link
            key={brand.id}
            href={brand.href}
            className={`brand-directory-list__title-wrap ${activeIndex === index ? 'is-active' : ''}`}
            style={style}
          >
            <span className="brand-directory-list__title h1">{brand.title}</span>
            {brand.shortDescription && <span className="brand-directory-list__description">{brand.shortDescription}</span>}
          </Link>
        )
      })}
    </div>
  )
}

export default BrandList
