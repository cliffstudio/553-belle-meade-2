/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { PortableTextBlock } from '@sanity/types'
import { SanityImage } from '../types/sanity'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import mediaLazyloading from '../utils/lazyLoad'
import BrandDirectorySection from './brand-directory/BrandDirectorySection'
import { BrandDirectoryItem } from './brand-directory/types'

interface BrandCategory {
  _id: string
  name?: string
  icon?: SanityImage
}

interface Brand {
  _id: string
  _createdAt?: string
  title?: string
  slug?: {
    current?: string
  }
  thumbnailImage?: SanityImage
  brandCategory?: BrandCategory
  details?: {
    _key?: string
    detailHeading?: string
    detailBody?: PortableTextBlock[]
  }[]
}

interface BrandDirectoryProps {
  allBrands?: Brand[]
  brandCategories?: Array<BrandCategory | null>
  preselectedBrandCategory?: BrandCategory | null
}

type ViewMode = 'grid' | 'list'
type SortBy = 'alphabetical' | 'newest'

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'newest', label: 'Newest' },
]

function IconCategoryGrid() {
  return (
    <svg
      className="brand-directory-icon brand-directory-icon--categories"
      viewBox="0 0 13 13"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M2.8203101,0.5c1.27279,0,2.32129,1.0546,2.32129,2.375c-0.0002303,1.3202-1.0486302,2.3740201-2.32129,2.3740201C1.54782,5.2488298,0.500228,4.1950798,0.5,2.875C0.5,1.55472,1.54768,0.500198,2.8203101,0.5z" />
      <path d="M2.8203101,7.7500601c1.27279,0,2.32129,1.0545998,2.32129,2.3750401c-0.0002303,1.3202-1.0486302,2.3739996-2.32129,2.3739996C1.54782,12.4989004,0.500228,11.4450998,0.5,10.1251001C0.5,8.80478,1.54768,7.7502599,2.8203101,7.7500601z" />
      <path d="M10.1787004,0.5C11.4514999,0.5,12.5,1.5546,12.5,2.875c-0.0002003,1.3202-1.0486002,2.3740201-2.3212996,2.3740201C8.9062204,5.2488298,7.8586302,4.1950798,7.8583999,2.875C7.8583999,1.55472,8.9060802,0.500198,10.1787004,0.5z" />
      <path d="M10.1787004,7.7500601c1.2727995,0,2.3212996,1.0545998,2.3212996,2.3750401c-0.0002003,1.3202-1.0486002,2.3739996-2.3212996,2.3739996c-1.27248-0.0001993-2.3200703-1.0539999-2.3203006-2.3739996C7.8583999,8.80478,8.9060802,7.7502599,10.1787004,7.7500601z" />
    </svg>
  )
}

function IconSortChevron() {
  return (
    <svg
      className="brand-directory-icon brand-directory-icon--sort"
      viewBox="0 0 12 8"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M1 1.5L6 6.5L11 1.5" />
    </svg>
  )
}

function BrandCategoryTitleIcon({ category }: { category?: BrandCategory | null }) {
  if (category?.icon?.asset) {
    return (
      <span className="brand-directory-title__icon" aria-hidden>
        <img
          src={urlFor(category.icon).url()}
          alt=""
          className="brand-directory-title__icon-img"
        />
      </span>
    )
  }
  if (category?._id) {
    return (
      <span className="brand-directory-title__icon" aria-hidden>
        <IconCategoryGrid />
      </span>
    )
  }
  return null
}

function BrandDirectory({
  allBrands = [],
  brandCategories = [],
  preselectedBrandCategory,
}: BrandDirectoryProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    preselectedBrandCategory?._id ?? null
  )
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('alphabetical')
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const categories = useMemo(() => {
    const fallbackCategories = allBrands
      .map((brand) => brand.brandCategory)
      .filter((category): category is BrandCategory => Boolean(category?._id))

    const cmsCategories = brandCategories.filter(
      (category): category is BrandCategory => Boolean(category?._id)
    )

    const merged = [...cmsCategories, ...fallbackCategories]
    const uniqueById = new Map<string, BrandCategory>()
    merged.forEach((category) => {
      if (!uniqueById.has(category._id)) {
        uniqueById.set(category._id, category)
      }
    })

    return Array.from(uniqueById.values())
  }, [allBrands, brandCategories])

  const filteredBrands = useMemo(() => {
    if (!selectedCategoryId) return allBrands

    return allBrands.filter(
      (brand) => brand.brandCategory?._id === selectedCategoryId
    )
  }, [allBrands, selectedCategoryId])

  const sortedBrands = useMemo(() => {
    const list = [...filteredBrands]
    if (sortBy === 'newest') {
      list.sort((a, b) => {
        const aTime = a._createdAt ? new Date(a._createdAt).getTime() : 0
        const bTime = b._createdAt ? new Date(b._createdAt).getTime() : 0
        return bTime - aTime
      })
      return list
    }

    list.sort((a, b) => {
      const ta = (a.title || '').toLocaleLowerCase()
      const tb = (b.title || '').toLocaleLowerCase()
      return ta.localeCompare(tb)
    })
    return list
  }, [filteredBrands, sortBy])

  const brandItems: BrandDirectoryItem[] = useMemo(
    () =>
      sortedBrands.map((brand) => {
        const href = brand.slug?.current ? `/brands/${brand.slug.current}` : '#'
        const openingHours = brand.details?.find((detail) => detail.detailHeading === 'Opening Hours')
        const address = brand.details?.find((detail) => detail.detailHeading === 'Address')

        return {
          id: brand._id,
          title: brand.title || 'Brand',
          href,
          image: brand.thumbnailImage,
          category: brand.brandCategory,
          openingHours: openingHours?.detailBody,
          address: address?.detailBody,
        }
      }),
    [sortedBrands]
  )

  // Re-observe newly rendered lazy images after filter/sort/view changes.
  useEffect(() => {
    const timer = setTimeout(() => {
      mediaLazyloading()
    }, 0)

    return () => clearTimeout(timer)
  }, [sortedBrands, viewMode])

  const closeDropdowns = () => setActiveDropdown(null)

  const toggleDropdown = (index: number) => {
    setActiveDropdown((prev) => (prev === index ? null : index))
  }

  useEffect(() => {
    const onResize = () => {
      setActiveDropdown(null)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (activeDropdown === null) return
    const onPointerDown = (e: PointerEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [activeDropdown])

  const categoryDropdownIndex = 0
  const sortDropdownIndex = 1

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget
    const parent = image.parentElement
    if (!parent) return

    const overlay = parent.querySelector('.loading-overlay')
    if (overlay) {
      overlay.classList.add('hidden')
    }
  }

  return (
    <section className="brand-directory-block">
      <div ref={toolbarRef} className="brand-directory-toolbar h-pad cta-font">
        <div className="brand-directory-view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            className={viewMode === 'grid' ? 'is-active' : ''}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            type="button"
            className={viewMode === 'list' ? 'is-active' : ''}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>

        <div className="brand-directory-toolbar-actions">
          <div
            className={`brand-directory-dropdown-slot${
              activeDropdown === categoryDropdownIndex ? ' is-expanded' : ''
            }`}
          >
            <div
              className={`brand-directory-dropdown-trigger brand-directory-dropdown-trigger--categories${
                selectedCategoryId ? ' has-active' : ''
              }${activeDropdown === categoryDropdownIndex ? ' is-open' : ''}`}
            >
              <button
                type="button"
                className="brand-directory-dropdown-trigger__btn"
                aria-expanded={activeDropdown === categoryDropdownIndex}
                aria-controls="brand-directory-categories-panel"
                id="brand-directory-categories-trigger"
                onClick={() => toggleDropdown(categoryDropdownIndex)}
              >
                <span className="brand-directory-dropdown__trigger-icon" aria-hidden>
                  <IconCategoryGrid />
                </span>
                <span className="brand-directory-dropdown__trigger-label">Categories</span>
              </button>
            </div>
            <div
              className={`brand-directory-toolbar__panel brand-directory-toolbar__panel--categories${
                activeDropdown === categoryDropdownIndex ? ' is-open' : ''
              }`}
              id="brand-directory-categories-panel"
              role="presentation"
              aria-labelledby="brand-directory-categories-trigger"
              aria-hidden={activeDropdown !== categoryDropdownIndex}
            >
              <div
                className="brand-directory-dropdown__radios"
                role="radiogroup"
                aria-label="Filter by category"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={!selectedCategoryId}
                  className={`brand-directory-radio-option${!selectedCategoryId ? ' is-selected' : ''}`}
                  onClick={() => {
                    setSelectedCategoryId(null)
                    closeDropdowns()
                  }}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    role="radio"
                    aria-checked={selectedCategoryId === category._id}
                    className={`brand-directory-radio-option${
                      selectedCategoryId === category._id ? ' is-selected' : ''
                    }`}
                    onClick={() => {
                      setSelectedCategoryId(category._id)
                      closeDropdowns()
                    }}
                  >
                    {category.name || 'Category'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`brand-directory-dropdown-slot${
              activeDropdown === sortDropdownIndex ? ' is-expanded' : ''
            }`}
          >
            <div
              className={`brand-directory-dropdown-trigger brand-directory-dropdown-trigger--sort${
                sortBy !== 'alphabetical' ? ' has-active' : ''
              }${activeDropdown === sortDropdownIndex ? ' is-open' : ''}`}
            >
              <button
                type="button"
                className="brand-directory-dropdown-trigger__btn"
                aria-expanded={activeDropdown === sortDropdownIndex}
                aria-controls="brand-directory-sort-panel"
                id="brand-directory-sort-trigger"
                onClick={() => toggleDropdown(sortDropdownIndex)}
              >
                <span className="brand-directory-dropdown__trigger-icon" aria-hidden>
                  <IconSortChevron />
                </span>
                <span className="brand-directory-dropdown__trigger-label">Sort by</span>
              </button>
            </div>
            <div
              className={`brand-directory-toolbar__panel brand-directory-toolbar__panel--sort${
                activeDropdown === sortDropdownIndex ? ' is-open' : ''
              }`}
              id="brand-directory-sort-panel"
              role="presentation"
              aria-labelledby="brand-directory-sort-trigger"
              aria-hidden={activeDropdown !== sortDropdownIndex}
            >
              <div
                className="brand-directory-dropdown__radios"
                role="radiogroup"
                aria-label="Sort brands by"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={sortBy === opt.value}
                    className={`brand-directory-radio-option${sortBy === opt.value ? ' is-selected' : ''}`}
                    onClick={() => {
                      setSortBy(opt.value)
                      closeDropdowns()
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="brand-directory-grid h-pad">
          {sortedBrands.map((brand) => {
            const href = brand.slug?.current ? `/brands/${brand.slug.current}` : '#'

            return (
              <div key={brand._id} className="brand-directory-card out-of-opacity">
                <Link
                  href={href}
                  className="brand-directory-media-link"
                  aria-label={brand.title || 'View brand'}
                >
                  {brand.thumbnailImage && (
                    <>
                      <img 
                        data-src={urlFor(brand.thumbnailImage).url()}
                        alt={brand.thumbnailImage?.alt ?? brand.title ?? ''}
                        className="lazy full-bleed-image"
                        onLoad={handleImageLoad}
                      />
                      <div className="loading-overlay" />
                    </>
                  )}
                </Link>
                <div className="brand-directory-title h3">
                  <div className="brand-directory-title__row">
                    <Link href={href}>{brand.title}</Link>
                    <BrandCategoryTitleIcon category={brand.brandCategory} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <BrandDirectorySection
          items={brandItems}
          renderCategoryIcon={(category) => <BrandCategoryTitleIcon category={category} />}
        />

      )}
    </section>
  )
}

export default BrandDirectory
