/* eslint-disable @next/next/no-img-element */
'use client'

import React from 'react'
import { PortableTextBlock, SanityImage } from '../types/sanity'
import { urlFor } from '../sanity/utils/imageUrlBuilder'

interface PressPost {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  thumbnailImage?: SanityImage
  thumbnailLogo?: SanityImage
  thumbnailBackgroundColour?: string
  excerpt?: string
  featuredImage?: SanityImage
  content?: PortableTextBlock[]
  source?: string
  sourceUrl?: string
  layout?: string
}

interface PressPostsSectionProps {
  post1?: PressPost
  post2?: PressPost
  layout?: string
}

const PressPostsSection: React.FC<PressPostsSectionProps> = ({
  post1,
  post2,
  layout = 'layout-1'
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '.')
  }

  const renderPostCard = (post: PressPost) => (
    <>
      {post.thumbnailImage && (
        <div className="media-wrap relative out-of-opacity">
          <img 
data-src={urlFor(post.thumbnailImage).url()}
          alt={post.thumbnailImage?.alt ?? post.title ?? ''}
          className="lazy full-bleed-image"
          />
          <div className="loading-overlay" />
        </div>
      )}

      {post.thumbnailLogo && (
        <div className="media-wrap logo-wrap" style={{ backgroundColor: post.thumbnailBackgroundColour }}>
          <img src={urlFor(post.thumbnailLogo).url()} alt={post.title} />
        </div>
      )}

      <div className="text-wrap">
        <div className="date cta-font">{post.source && `${post.source} | `}{formatDate(post.publishedAt)}</div>

        <h3 className="title">{post.title}</h3>

        {post.excerpt && <div>{post.excerpt}</div>}

        <div className="cta-font underline-link link">
          <a href={`/press/${post.slug.current}`} className="press-card__link">Learn More</a>

          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
            <path d="M1 1L13.5 13.5L0.999999 26"/>
          </svg>
        </div>
      </div>
    </>
  )

  // Determine column layout based on layout option
  let firstCols, spacerCols, secondCols, rowClass
  
  if (layout === 'layout-1') {
    // Layout 1: 4 cols + 2 spacer + 6 cols (matches row-1)
    firstCols = 4
    spacerCols = 2
    secondCols = 6
    rowClass = 'row-1'
  } else if (layout === 'layout-2') {
    // Layout 2: 5 cols + 2 spacer + 5 cols (matches row-2)
    firstCols = 5
    spacerCols = 2
    secondCols = 5
    rowClass = 'row-2'
  // } else if (layout === 'layout-3') {
    // Layout 3: 5 cols + 1 spacer + 6 cols (matches row-3)
    // firstCols = 5
    // spacerCols = 1
    // secondCols = 6
    // rowClass = 'row-3'
  } else {
    // Default to layout-1
    firstCols = 4
    spacerCols = 2
    secondCols = 6
    rowClass = 'row-1'
  }

  if (!post1 && !post2) {
    return null
  }

  return (
    <section className={`press-row ${rowClass} row-lg h-pad`}>
      {post1 && (
        <div className={`col-${firstCols}-12_lg`}>
          <div className="press-card card-1 out-of-opacity">
            {renderPostCard(post1)}
          </div>
        </div>
      )}

      {post1 && post2 && (
        <div className={`col-${spacerCols}-12_lg desktop`}></div>
      )}

      {post2 && (
        <div className={`col-${secondCols}-12_lg`}>
          <div className="press-card card-2 out-of-opacity">
            {renderPostCard(post2)}
          </div>
        </div>
      )}
    </section>
  )
}

export default PressPostsSection
