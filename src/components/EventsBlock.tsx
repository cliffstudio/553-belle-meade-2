/* eslint-disable @next/next/no-img-element */
'use client'

import React from 'react'
import { SanityImage } from '../types/sanity'
import { urlFor } from '../sanity/utils/imageUrlBuilder'

type EventsFilter = 'this-week' | 'this-month' | 'custom'
type EventsGrid = 'columns-2' | 'columns-3' | 'columns-4'

interface EventCard {
  _id: string
  title: string
  slug?: { current?: string }
  eventStartDateTime?: string
  eventEndDateTime?: string
  eventLocation?: string
  thumbnailImage?: SanityImage
}

interface EventsBlockProps {
  heading?: string
  subheading?: string
  backgroundColour?: string
  events?: EventsFilter
  gridLayout?: EventsGrid
  customEvents?: EventCard[]
  allEvents?: EventCard[]
}

const EventsBlock: React.FC<EventsBlockProps> = ({
  heading,
  subheading,
  backgroundColour = 'none',
  events = 'this-week',
  gridLayout = 'columns-3',
  customEvents = [],
  allEvents = [],
}) => {
  const now = new Date()

  const startOfWeek = new Date(now)
  const day = startOfWeek.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  startOfWeek.setDate(startOfWeek.getDate() + diffToMonday)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  const eventMatchesThisWeek = (event: EventCard) => {
    if (!event.eventStartDateTime) return false
    const start = new Date(event.eventStartDateTime)
    if (Number.isNaN(start.getTime())) return false
    return start >= startOfWeek && start < endOfWeek
  }

  const eventMatchesThisMonth = (event: EventCard) => {
    if (!event.eventStartDateTime) return false
    const start = new Date(event.eventStartDateTime)
    if (Number.isNaN(start.getTime())) return false
    return start.getMonth() === thisMonth && start.getFullYear() === thisYear
  }

  const selectedEvents = (() => {
    if (events === 'custom') return customEvents
    if (events === 'this-month') return allEvents.filter(eventMatchesThisMonth)
    return allEvents.filter(eventMatchesThisWeek)
  })()

  const sortedEvents = [...selectedEvents].sort((a, b) => {
    const aDate = a.eventStartDateTime ? new Date(a.eventStartDateTime).getTime() : Infinity
    const bDate = b.eventStartDateTime ? new Date(b.eventStartDateTime).getTime() : Infinity
    return aDate - bDate
  })

  const formatEventDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return ''

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  if (!sortedEvents.length) {
    return null
  }

  return (
    <section className={`events-block h-pad bg-${backgroundColour}`}>
      <div className="text-wrap max-width-big-text out-of-view">
        {subheading && <div className="heading cta-font">{subheading}</div>}
        {heading && <div className="h1">{heading}</div>}
      </div>

      <div className={`events-grid ${gridLayout}`}>
        {sortedEvents.map((event) => {
          const href = event.slug?.current ? `/events/${event.slug.current}` : '#'
          const date = formatEventDate(event.eventStartDateTime)

          return (
            <div key={event._id} className="events-card out-of-opacity">
              {event.thumbnailImage && (
                <div className="media-wrap relative">
                  <img
                    data-src={urlFor(event.thumbnailImage).url()}
                    alt={event.thumbnailImage?.alt ?? event.title ?? ''}
                    className="lazy full-bleed-image"
                  />
                  <div className="loading-overlay" />
                </div>
              )}

              <div className="events-card-content">
                {date && <div className="events-card-date">{date}</div>}

                <h2 className="events-card-title">{event.title}</h2>

                <div className="cta-font underline-link link">
                  <a href={href}>Learn More</a>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                    <path d="M1 1L13.5 13.5L0.999999 26" />
                  </svg>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default EventsBlock
