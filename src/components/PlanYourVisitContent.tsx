/* eslint-disable @next/next/no-img-element */
'use client'

import React from 'react'
import { PortableText } from '@portabletext/react'
import { PortableTextBlock, SanityImage } from '../types/sanity'
import { portableTextComponents } from '../utils/portableTextComponents'
import { urlFor } from '../sanity/utils/imageUrlBuilder'

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

interface PlanYourVisitContentProps {
  title?: string
  heading?: string
  body?: PortableTextBlock[]
  details?: PlanYourVisitDetail[]
  images?: SanityImage[]
}

const PlanYourVisitContent: React.FC<PlanYourVisitContentProps> = ({
  title,
  heading,
  body,
  details,
  images,
}) => {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
  const mapQuery = 'Belle Meade Historic Site, Nashville TN'
  // TODO: Add your Snazzy Maps (or Google map style/map_id) value here.
  const mapStyleId = ''

  const googleMapEmbedSrc = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(
    mapQuery
  )}${mapStyleId ? `&map_id=${encodeURIComponent(mapStyleId)}` : ''}`

  return (
    <>
      <section className="hero-media-block layout-2 flex items-center justify-center text-white">
        <div className="inner-wrap h-pad out-of-view">
          {title && <h1>{title}</h1>}
        </div>
      </section>

      <section className="plan-your-visit-content h-pad row-lg">
        <div className="left-content col-4-12_lg">
          <div className="top-text-wrap max-width-big-text out-of-view">
            {heading && <div className="heading cta-font">{heading}</div>}

            {body && (
              <div className="h2">
                <PortableText value={body} components={portableTextComponents} />
              </div>
            )}
          </div>

          {!!details?.length && (
            <div className="plan-your-visit-details max-width-big-text">
              {details.map((detail, detailIndex) => (
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

        <div className="col-1-12_lg dummy-col"></div>

        <div className="right-content col-7-12_lg">
          {!!images?.length && (
            <div className="plan-your-visit-images">
              {images.map((image, index) => (
                <div className="plan-your-visit-image" key={image.asset?._ref ?? `image-${index}`}>
                  <img src={urlFor(image).url()} alt={image.alt ?? ''} />
                </div>
              ))}
            </div>
          )}

          <div className="plan-your-visit-map">
            <iframe
              title="Belle Meade map"
              src={googleMapEmbedSrc}
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default PlanYourVisitContent
