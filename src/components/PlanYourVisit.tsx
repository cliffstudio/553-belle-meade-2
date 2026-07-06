/* eslint-disable @next/next/no-img-element */
'use client'

import React from 'react'
import { PortableText } from '@portabletext/react'
import { PortableTextBlock, SanityImage } from '../types/sanity'
import { portableTextComponents } from '../utils/portableTextComponents'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const GOOGLE_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'administrative', elementType: 'all', stylers: [{ color: '#581b25' }, { weight: '0.01' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.fill',
    stylers: [{ color: '#fff9f2' }, { visibility: 'on' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.fill',
    stylers: [{ color: '#fff9f2' }, { visibility: 'on' }],
  },
  { featureType: 'administrative.locality', elementType: 'geometry.fill', stylers: [{ color: '#fff9f2' }] },
  { featureType: 'administrative.neighborhood', elementType: 'all', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'geometry.fill',
    stylers: [{ color: '#fff9f2' }, { visibility: 'on' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'geometry.fill',
    stylers: [{ color: '#fff9f2' }, { visibility: 'on' }],
  },
  { featureType: 'landscape', elementType: 'all', stylers: [{ color: '#fff9f2' }] },
  { featureType: 'landscape.natural.landcover', elementType: 'geometry.fill', stylers: [{ color: '#fff9f2' }] },
  {
    featureType: 'landscape.natural.terrain',
    elementType: 'geometry.fill',
    stylers: [{ color: '#fff9f2' }, { visibility: 'on' }],
  },
  { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'all', stylers: [{ visibility: 'simplified' }, { hue: '#ff0000' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#898f65' }] },
  {
    featureType: 'poi.park',
    elementType: 'labels',
    stylers: [{ color: '#581b25' }, { weight: '0.01' }, { visibility: 'off' }],
  },
  { featureType: 'poi.park', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#c6bbcf' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'road', elementType: 'labels.text', stylers: [{ color: '#581b25' }] },
  { featureType: 'road.highway', elementType: 'all', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'transit', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'all', stylers: [{ color: '#aec4e8' }] },
]
const GOOGLE_MAP_CENTER = { lat: 36.12505336698718, lng: -86.84925702883638 }

interface PlanYourVisitDetailItem {
  _key?: string
  subtitle?: string
  body?: PortableTextBlock[]
}

interface PlanYourVisitDetail {
  _key?: string
  heading?: string
  items?: PlanYourVisitDetailItem[]
}

export interface PlanYourVisitProps {
  planYourVisitHeading?: string
  planYourVisitBody?: PortableTextBlock[]
  planYourVisitDetails?: PlanYourVisitDetail[]
  planYourVisitImages?: SanityImage[]
  showMap?: boolean
  sectionClassName?: 'plan-your-visit-content' | 'plan-your-visit-block'
}

const PlanYourVisit: React.FC<PlanYourVisitProps> = ({
  planYourVisitHeading,
  planYourVisitBody,
  planYourVisitDetails,
  planYourVisitImages,
  showMap = false,
  sectionClassName = 'plan-your-visit-block',
}) => {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
  const mapZoom = 12
  const mapRef = React.useRef<HTMLDivElement>(null)
  const sectionRef = React.useRef<HTMLElement>(null)
  const leftContentRef = React.useRef<HTMLDivElement>(null)
  const rightContentRef = React.useRef<HTMLDivElement>(null)

  const hasContent =
    planYourVisitHeading ||
    planYourVisitBody ||
    planYourVisitDetails?.length ||
    planYourVisitImages?.length ||
    showMap

  React.useEffect(() => {
    if (!showMap || !googleMapsApiKey || !mapRef.current) return

    const initMap = () => {
      if (!mapRef.current || !window.google?.maps) return

      const map = new window.google.maps.Map(mapRef.current, {
        center: GOOGLE_MAP_CENTER,
        zoom: mapZoom,
        styles: GOOGLE_MAP_STYLES,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      })

      new window.google.maps.Marker({
        map,
        position: GOOGLE_MAP_CENTER,
      })
    }

    if (window.google?.maps) {
      initMap()
      return
    }

    const existingScript = document.getElementById('google-maps-script') as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener('load', initMap, { once: true })
      return () => existingScript.removeEventListener('load', initMap)
    }

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsApiKey)}`
    script.async = true
    script.defer = true
    script.addEventListener('load', initMap, { once: true })
    document.head.appendChild(script)

    return () => script.removeEventListener('load', initMap)
  }, [googleMapsApiKey, mapZoom, showMap])

  React.useEffect(() => {
    if (!sectionRef.current || !leftContentRef.current || !rightContentRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const mm = gsap.matchMedia()
    mm.add('(min-width: 769px)', () => {
      const leftContent = leftContentRef.current
      const rightContent = rightContentRef.current

      if (!leftContent || !rightContent) return
      if (rightContent.offsetHeight <= leftContent.offsetHeight) return

      const trigger = ScrollTrigger.create({
        trigger: leftContent,
        start: 'bottom bottom-=100',
        endTrigger: rightContent,
        end: 'bottom bottom-=100',
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true,
      })

      return () => {
        trigger.kill()
      }
    })

    return () => {
      mm.revert()
    }
  }, [planYourVisitDetails, planYourVisitImages, planYourVisitBody, planYourVisitHeading, showMap])

  if (!hasContent) return null

  const hasRightColumn = !!planYourVisitImages?.length || showMap

  return (
    <section ref={sectionRef} className={`${sectionClassName} h-pad row-lg`}>
      <div ref={leftContentRef} className="left-content col-4-12_lg">
        {(planYourVisitHeading || planYourVisitBody) && (
          <div className="top-text-wrap max-width-big-text out-of-view">
            {planYourVisitHeading && (
              <div className="heading cta-font">{planYourVisitHeading}</div>
            )}

            {planYourVisitBody && (
              <div className="h2">
                <PortableText value={planYourVisitBody} components={portableTextComponents} />
              </div>
            )}
          </div>
        )}

        {!!planYourVisitDetails?.length && (
          <div className="plan-your-visit-details max-width-big-text out-of-view">
            {planYourVisitDetails.map((detail, detailIndex) => (
              <div className="plan-your-visit-detail" key={detail._key ?? `detail-${detailIndex}`}>
                {detail.heading && <h3 className="detail-heading">{detail.heading}</h3>}

                {!!detail.items?.length && (
                  <div className="plan-your-visit-detail-items">
                    {detail.items.map((item, itemIndex) => (
                      <div className="plan-your-visit-detail-item" key={item._key ?? `item-${itemIndex}`}>
                        {item.subtitle && <div className="detail-subtitle cta-font">{item.subtitle}</div>}
                        {item.body && (
                          <div>
                            <PortableText value={item.body} components={portableTextComponents} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {hasRightColumn && (
        <>
          <div className="col-1-12_lg dummy-col"></div>

          <div ref={rightContentRef} className="right-content col-7-12_lg">
            {!!planYourVisitImages?.length && (
              <div className="plan-your-visit-images">
                {planYourVisitImages.map((image, index) => (
                  <div className="plan-your-visit-image out-of-opacity" key={image.asset?._ref ?? `image-${index}`}>
                    <img src={urlFor(image).url()} alt={image.alt ?? ''} />
                  </div>
                ))}
              </div>
            )}

            {showMap && (
              <div className="plan-your-visit-map out-of-opacity">
                <div
                  ref={mapRef}
                  aria-label="Belle Meade map"
                  className="map-iframe-wrap"
                />
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default PlanYourVisit
