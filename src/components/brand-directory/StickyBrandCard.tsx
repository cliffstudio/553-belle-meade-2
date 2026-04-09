/* eslint-disable @next/next/no-img-element */
import React from 'react'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { urlFor } from '../../sanity/utils/imageUrlBuilder'
import { portableTextComponents } from '../../utils/portableTextComponents'
import { BrandDirectoryCategory, BrandDirectoryItem } from './types'

interface StickyBrandCardProps {
  brand: BrandDirectoryItem
  renderCategoryIcon: (category?: BrandDirectoryCategory) => React.ReactNode
}

function StickyBrandCard({ brand, renderCategoryIcon }: StickyBrandCardProps) {
  return (
    <div key={brand.id} className="brand-directory-list__card" aria-live="polite">
      <div className="media-wrap relative">
        {brand.image && (
          <img
            src={urlFor(brand.image).url()}
            alt={brand.image?.alt ?? brand.title}
            className="full-bleed-image"
          />
        )}
      </div>

      <div className="brand-directory-list__meta">
        <div className="details">
          {!!brand.openingHours?.length && (
            <div>
              <div className="detail-heading cta-font">Opening Hours</div>
              <PortableText value={brand.openingHours} components={portableTextComponents} />
            </div>
          )}
          {!!brand.address?.length && (
            <div>
              <div className="detail-heading cta-font">Location</div>
              <PortableText value={brand.address} components={portableTextComponents} />
            </div>
          )}
        </div>

        <div className="link-wrap">
          {renderCategoryIcon(brand.category)}
          <div className="cta-font underline-link link">
            <Link href={brand.href}>Discover</Link>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27" aria-hidden>
              <path d="M1 1L13.5 13.5L0.999999 26" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StickyBrandCard
