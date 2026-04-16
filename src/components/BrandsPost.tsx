/* eslint-disable @next/next/no-img-element */
'use client'

import React from 'react'
import { SanityImage } from '../types/sanity'
import { PortableTextBlock } from '@sanity/types'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { PortableText } from '@portabletext/react'
import { portableTextComponents } from '../utils/portableTextComponents'
import Link from 'next/link'

type BrandsLayout = 'layout-1' | 'layout-2'

interface BrandsPostProps {
  title: string
  slug: { current: string }
  featuredImage?: SanityImage
  locationImage?: SanityImage
  desktopLayout?: BrandsLayout
  mobileLayout?: BrandsLayout
  details?: {
    _key?: string
    detailHeading?: string
    detailBody?: PortableTextBlock[]
  }[]
  content?: PortableTextBlock[]
  nextPostSlug?: string
  nextPostTitle?: string
}

const BrandsPost: React.FC<BrandsPostProps> = ({
  title,
  featuredImage,
  locationImage,
  desktopLayout = 'layout-1',
  mobileLayout = 'layout-1',
  details,
  content,
  nextPostSlug,
  nextPostTitle,
}) => {
  const spacerColClass = desktopLayout === 'layout-1' ? 'col-4-12_lg' : 'col-1-12_lg'
  const mediaColClass = desktopLayout === 'layout-1' ? 'col-4-12_lg' : 'col-7-12_lg'

  return (
    <article className="brands-post">

      <section className="hero-media-block layout-2 flex items-center justify-center text-white">
        <div className="inner-wrap h-pad out-of-view">
          <h1>{title}</h1>
        </div>
      </section>

      <section className={`brands-post desktop-${desktopLayout} mobile-${mobileLayout}`}>
        <div className="content-wrap h-pad">
          <div className="out-of-view events-content-col events-content-col--text">
            {content && (
              <div className="content">
                <PortableText value={content} components={portableTextComponents} />
              </div>
            )}

            {!!details?.length && (
              <div className="details">
                {details?.map((detail, index) => (
                  <div className="detail" key={detail._key ?? `${detail.detailHeading ?? 'detail'}-${index}`}>
                    <div className="detail-heading cta-font">{detail?.detailHeading}</div>
                    {detail?.detailBody && (
                      <div>
                        <PortableText value={detail.detailBody} components={portableTextComponents} />
                      </div>
                    )}
                  </div>
                ))}

                {locationImage && (
                  <div className="detail">
                    <div className="detail-heading cta-font">Location</div>

                    <div className="location-image-wrap">
                      <div className="layout-image relative">
                        <img
                          data-src={urlFor(locationImage).url()}
                          alt={locationImage?.alt ?? ''}
                          className="lazy regular"
                        />
                        <div className="loading-overlay" />
                      </div>

                      <div className="map-icon">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 20.5 20.5">
                          <g>
                            <path d="M0.25,12.25v8h8"/>
                            <path d="M8.25,12.25l-8,8"/>
                            <path d="M20.25,8.25v-8h-8"/>
                            <path d="M20.25,0.25l-8,8"/>
                          </g>
                        </svg>
                        <Link href="/village-map"></Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="out-of-opacity events-content-col events-content-col--media">
            {featuredImage && (
              <div className="media-wrap relative">
                <img 
                  data-src={urlFor(featuredImage).url()}
                  alt={featuredImage?.alt ?? ''}
                  className="lazy full-bleed-image"
                />
                <div className="loading-overlay" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="cta-banner-block">
        {nextPostSlug && nextPostTitle && (
          <div className="inner-wrap h-pad relative out-of-view">
            <div className="h1 smaller link-text">Next</div>

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
              <path d="M1 1L13.5 13.5L0.999999 26"/>
            </svg>

            <Link href={`/brands/${nextPostSlug}`} aria-label={`Go to ${nextPostTitle}`}>
              <span aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>
    </article>
  )
}

export default BrandsPost
