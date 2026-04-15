import React from 'react'
import { BrandDirectoryItem } from './types'

interface BrandListProps {
  items: BrandDirectoryItem[]
  activeIndex: number
  setRowRef: (index: number) => (node: HTMLElement | null) => void
}

function BrandList({ items, activeIndex, setRowRef }: BrandListProps) {
  return (
    <div className="brand-directory-list__left" aria-label="Brand list">
      {items.map((brand, index) => (
        <div
          key={brand.id}
          ref={setRowRef(index)}
          data-index={index}
          className={`brand-directory-list__title-wrap ${activeIndex === index ? 'is-active' : ''}`}
        >
          <span className="brand-directory-list__title h1">{brand.title}</span>
          {brand.shortDescription && <span className="brand-directory-list__description">{brand.shortDescription}</span>}
        </div>
      ))}
    </div>
  )
}

export default BrandList
