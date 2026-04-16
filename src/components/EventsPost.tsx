/* eslint-disable @next/next/no-img-element */
'use client'

import React from 'react'
import { SanityImage } from '../types/sanity'
import { PortableTextBlock } from '@sanity/types'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { PortableText } from '@portabletext/react'
import { portableTextComponents } from '../utils/portableTextComponents'
import { getLinkInfo } from '../utils/getLinkInfo'
import { getExternalLinkProps } from '../utils/getExternalLinkProps'
import type { CtaLink } from '../types/link'

type EventsLayout = 'layout-1' | 'layout-2'

interface EventsPostProps {
  title: string
  slug: { current: string }
  eventStartDateTime: string
  eventEndDateTime?: string
  eventLocation?: string
  featuredImage?: SanityImage
  desktopLayout?: EventsLayout
  mobileLayout?: EventsLayout
  details?: {
    _key?: string
    detailHeading?: string
    detailBody?: PortableTextBlock[]
  }[]
  content?: PortableTextBlock[]
  cta?: CtaLink
  nextPostSlug?: string
  nextPostTitle?: string
}

const EventsPost: React.FC<EventsPostProps> = ({
  title,
  eventStartDateTime,
  eventEndDateTime,
  eventLocation,
  featuredImage,
  desktopLayout = 'layout-1',
  mobileLayout = 'layout-1',
  details,
  content,
  cta,
  nextPostSlug,
  nextPostTitle,
}) => {
  const { text: ctaText, href: ctaHref } = getLinkInfo(cta)

  const formatEventDateTimeRange = (startDateTime: string, endDateTime?: string) => {
    const start = new Date(startDateTime)
    if (Number.isNaN(start.getTime())) return ''

    const datePart = start.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).replace(',', '')

    const formatTime = (date: Date) =>
      date
        .toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        .replace(':00', '')
        .replace(' AM', 'am')
        .replace(' PM', 'pm')

    const startTime = formatTime(start)

    if (!endDateTime) return `${datePart}, ${startTime}`

    const end = new Date(endDateTime)
    if (Number.isNaN(end.getTime())) return `${datePart}, ${startTime}`

    const endTime = formatTime(end)
    return `${datePart}, ${startTime} to ${endTime}`
  }

  const spacerColClass = desktopLayout === 'layout-1' ? 'col-4-12_lg' : 'col-1-12_lg'
  const mediaColClass = desktopLayout === 'layout-1' ? 'col-4-12_lg' : 'col-7-12_lg'

  return (
    <article className="events-post">

      <section className="hero-media-block layout-2 flex items-center justify-center text-white">
        <div className="inner-wrap h-pad out-of-view">
          <h1>{title}</h1>
          <div className="date-location-wrap">
            <div className="cta-font">{formatEventDateTimeRange(eventStartDateTime, eventEndDateTime)}</div>
            {eventLocation && <div className="cta-font">{eventLocation}</div>}
          </div>
        </div>
      </section>

      <section className={`events-post desktop-${desktopLayout} mobile-${mobileLayout}`}>
        <div className="content-wrap h-pad">
          <div className="out-of-view events-content-col events-content-col--text">
            <h2 className="events-header">{title}</h2>

            {content && (
              <div className="content">
                <PortableText value={content} components={portableTextComponents} />
              </div>
            )}

            {ctaHref && (
              <div className="cta-font underline-link link">
                <a href={ctaHref} {...getExternalLinkProps(cta?.linkType)}>{ctaText}</a>

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                  <path d="M1 1L13.5 13.5L0.999999 26" />
                </svg>
              </div>
            )}

            {!!details?.length && (
              <div className="details">
                {details?.map((detail, index) => (
                  <div className="detail" key={detail._key ?? `${detail.detailHeading ?? 'detail'}-${index}`}>
                    <h3 className="detail-heading">{detail?.detailHeading}</h3>
                    {detail?.detailBody && (
                      <div className="cta-font">
                        <PortableText value={detail.detailBody} components={portableTextComponents} />
                      </div>
                    )}
                  </div>
                ))}
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

            <a href={`/events/${nextPostSlug}`}></a>
          </div>
        )}
      </section>
    </article>
  )
}

export default EventsPost
