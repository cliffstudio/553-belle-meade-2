import React from 'react'
import BrandList from './BrandList'
import StickyBrandCard from './StickyBrandCard'
import { useActiveBrandObserver } from './useActiveBrandObserver'
import { BrandDirectoryCategory, BrandDirectoryItem } from './types'
import Link from 'next/link'

interface BrandDirectorySectionProps {
  items: BrandDirectoryItem[]
  renderCategoryIcon: (category?: BrandDirectoryCategory) => React.ReactNode
}

function BrandDirectorySection({ items, renderCategoryIcon }: BrandDirectorySectionProps) {
  const { activeIndex, setRowRef } = useActiveBrandObserver({ itemCount: items.length })
  const activeBrand = items[activeIndex]

  if (!items.length) {
    return null
  }

  return (
    <>
      <div className="brand-directory-list h-pad">
        <BrandList items={items} activeIndex={activeIndex} setRowRef={setRowRef} />

        <div className="brand-directory-list__right">
          <div className="brand-directory-list__sticky">
            {activeBrand && (
              <div key={activeBrand.id} className="brand-directory-list__card-shell">
                <StickyBrandCard brand={activeBrand} renderCategoryIcon={renderCategoryIcon} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="brand-directory-list-mobile h-pad">
        {items.map((brand) => (
          <div key={brand.id} className="brand-directory-list-mobile__item">
            <Link href={brand.href} className="brand-directory-list__title is-active">
              <span className="h1">{brand.title}</span>
              {/* todo: add description */}
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}

export default BrandDirectorySection
