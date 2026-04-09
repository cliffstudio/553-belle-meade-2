/* eslint-disable @next/next/no-img-element */

import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { PortableText } from '@portabletext/react'
import { SanityImage, PortableTextBlock, SanityVideo } from '../types/sanity'
import { videoUrlFor } from '@/sanity/utils/videoUrlBuilder'
import { portableTextComponents } from '../utils/portableTextComponents'
import { getLinkInfo } from '../utils/getLinkInfo'
import { getExternalLinkProps } from '../utils/getExternalLinkProps'
import type { CtaLink } from '../types/link'

type LargeMediaTextProps = {
  mediaType?: 'image' | 'video'
  image?: SanityImage
  video?: SanityVideo
  videoSource?: 'file' | 'url'
  videoUrl?: string
  heading?: string
  body?: PortableTextBlock[]
  cta?: CtaLink
}

export default function LargeMediaText({ mediaType = 'image', image, video, videoSource = 'file', videoUrl, heading, body, cta
}: LargeMediaTextProps) {
  const { text, href } = getLinkInfo(cta)

  return (
    <section className="large-media-text-block h-pad">
      <div className="inner-wrap">
        <div className="row-lg">
          <div className="col-7-12_lg desktop">
            {mediaType === 'image' && image && (
              <div className="media-wrap out-of-opacity">
                <img 
                data-src={urlFor(image).url()}
                alt={image?.alt ?? ''}
                className="lazy full-bleed-image"
                style={{
                  objectPosition: image?.hotspot
                    ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`
                    : "center",
                }}
                />
                <div className="loading-overlay" />
              </div>
            )}
            
            {mediaType === 'video' && (video || videoUrl) && (
              <div className="media-wrap out-of-opacity">
                <div className="fill-space-video-wrap">
                  <video
                    src={videoSource === 'url' && videoUrl ? videoUrl : videoUrlFor(video)}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="col-1-12_lg desktop"></div>

          <div className="col-4-12_lg">
            <div className="text-wrap max-width-small-text offset-margin-top out-of-view">
              {heading && <h2 className="heading">{heading}</h2>}
              
              {body && <div><PortableText value={body} components={portableTextComponents} /></div>}

                {href && <div className="cta-font underline-link link">
                  <a href={href} {...getExternalLinkProps(cta?.linkType)}>{text}</a>

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                  <path d="M1 1L13.5 13.5L0.999999 26"/>
                </svg>
              </div>}
            </div>
          </div>
        </div>

        <div className="mobile">
          {mediaType === 'image' && image && (
            <div className="media-wrap out-of-opacity">
              <img 
                data-src={urlFor(image).url()}
                alt={image?.alt ?? ''}
              className="lazy full-bleed-image"
              />
              <div className="loading-overlay" />
            </div>
          )}
          
          {mediaType === 'video' && (video || videoUrl) && (
            <div className="media-wrap out-of-opacity">
              <div className="fill-space-video-wrap">
                <video
                  src={videoSource === 'url' && videoUrl ? videoUrl : videoUrlFor(video)}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
