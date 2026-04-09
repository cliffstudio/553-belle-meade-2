/* eslint-disable @next/next/no-img-element */
'use client'

import React from 'react'
import { SanityImage } from '../types/sanity'
import { PortableTextBlock } from '@sanity/types'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { PortableText } from '@portabletext/react'
import { portableTextComponents } from '../utils/portableTextComponents'

interface PressPostProps {
  title: string
  slug: { current: string }
  publishedAt: string
  excerpt?: string
  featuredImage?: SanityImage
  content?: PortableTextBlock[]
  source?: string
  sourceUrl?: string
  layout?: string
  nextPostSlug?: string
  nextPostTitle?: string
}

const PressPost: React.FC<PressPostProps> = ({
  title,
  publishedAt,
  featuredImage,
  content,
  source,
  sourceUrl,
  layout,
  nextPostSlug,
  nextPostTitle
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '.')
  }

  return (
    <article className="press-post">

      {source && (
        <section className="hero-media-block layout-3 flex items-center text-white">
          <div className="h-pad out-of-view">
            <div className="cta-font publish-date">{formatDate(publishedAt)}</div>
            
            <h1>{source}</h1>
          </div>
        </section>
      )}

      {layout === 'layout-1' && (
        <section className="press-post layout-1">
          {featuredImage && (
            <div className="full-bleed-media-block relative out-of-opacity">
              <div className="fill-space-image-wrap">
                <img 
data-src={urlFor(featuredImage).url()}
                alt={featuredImage?.alt ?? ''}
                className="lazy full-bleed-image"
                />
                <div className="loading-overlay" />
              </div>
            </div>
          )}

          <div className="content-wrap row-lg h-pad">
            <div className="col-5-12_lg out-of-view">
              <div className="press-header">{title}</div>

              {content && (
                <div className="content">
                  <PortableText value={content} components={portableTextComponents} />
                </div>
              )}

              {sourceUrl && <div className="cta-font underline-link link">
                <a href={sourceUrl} target="_blank">Read Full Article</a>

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                  <path d="M1 1L13.5 13.5L0.999999 26"/>
                </svg>
              </div>}
            </div>

            <div className="col-7-12_lg desktop"></div>
          </div>
        </section>
      )}

      {layout === 'layout-2' && (
        <section className="press-post layout-2">
          <div className="content-wrap row-lg h-pad">
            <div className="col-5-12_lg out-of-view">
              <div className="press-header">{title}</div>

              {content && (
                <div className="content">
                  <PortableText value={content} components={portableTextComponents} />
                </div>
              )}

              {sourceUrl && <div className="cta-font underline-link link">
                <a href={sourceUrl} target="_blank">Read Full Article</a>

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                  <path d="M1 1L13.5 13.5L0.999999 26"/>
                </svg>
              </div>}
            </div>

            <div className="col-2-12_lg desktop"></div>

            <div className="col-5-12_lg out-of-opacity">
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
      )}

      <section className="cta-banner-block">
        {nextPostSlug && nextPostTitle && (
          <div className="inner-wrap h-pad relative out-of-view">
            <div className="h1 smaller link-text">Next</div>

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
              <path d="M1 1L13.5 13.5L0.999999 26"/>
            </svg>

            <a href={`/press/${nextPostSlug}`}></a>
          </div>
        )}
      </section>
    </article>
  )
}

export default PressPost
