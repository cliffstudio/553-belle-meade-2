/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef } from 'react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { PortableText } from '@portabletext/react'
import { PortableTextBlock, SanityImage, SanityVideo } from '../types/sanity'
import { videoUrlFor } from '@/sanity/utils/videoUrlBuilder'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { portableTextComponents } from '../utils/portableTextComponents'
import { getLinkInfo } from '../utils/getLinkInfo'
import { getExternalLinkProps } from '../utils/getExternalLinkProps'
import type { CtaLink } from '../types/link'
import {
  getSectionBackgroundColor,
  type SectionBackgroundColour,
} from '../utils/getSectionBackgroundColor'

type ImageMasonryProps = { 
  heading?: string
  body?: PortableTextBlock[]
  cta?: CtaLink
  layout?: 'layout-1' | 'layout-2' | 'layout-3'
  backgroundColour?: SectionBackgroundColour
  mediaType1?: 'image' | 'video'
  image1?: SanityImage
  video1?: SanityVideo
  videoSource1?: 'file' | 'url'
  videoUrl1?: string
  mediaType2?: 'image' | 'video'
  image2?: SanityImage
  video2?: SanityVideo
  videoSource2?: 'file' | 'url'
  videoUrl2?: string
}

export default function ImageMasonry({ 
  heading, 
  body, 
  cta, 
  layout,
  backgroundColour = 'None',
  mediaType1 = 'image',
  image1, 
  video1,
  videoSource1 = 'file',
  videoUrl1,
  mediaType2 = 'image',
  image2, 
  video2,
  videoSource2 = 'file',
  videoUrl2
}: ImageMasonryProps) {
  const { text: linkText, href: linkHref } = getLinkInfo(cta)

  const sectionRef = useRef<HTMLDivElement>(null)

  // Get the background color value if a valid color is selected
  const backgroundColorValue = backgroundColour && backgroundColour !== 'None' 
    ? getSectionBackgroundColor(backgroundColour) 
    : undefined

  useEffect(() => {
    // Only set up scroll trigger for layout-1
    if (layout !== 'layout-1' || !sectionRef.current) return

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger)

    // Get the colour-background elements (both desktop and mobile)
    const colourBackgrounds = sectionRef.current.querySelectorAll('.colour-background')

    // Initialize opacity to 0 if backgrounds exist
    if (colourBackgrounds.length > 0) {
      gsap.set(colourBackgrounds, { opacity: 0 })
    }

    // Create scroll trigger to fade in colour background when layout-1 comes into view
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 50%",
      end: "bottom top",
      onEnter: () => {
        colourBackgrounds.forEach(bg => {
          gsap.to(bg, {
            opacity: 1,
            duration: 0.8,
            ease: "cubic-bezier(0.25,0.1,0.25,1)"
          })
        })
      },
      onEnterBack: () => {
        colourBackgrounds.forEach(bg => {
          gsap.to(bg, {
            opacity: 1,
            duration: 0.8,
            ease: "cubic-bezier(0.25,0.1,0.25,1)"
          })
        })
      },
    })

    // Cleanup
    return () => {
      trigger.kill()
    }
  }, [layout, backgroundColour])

  return (
    <>
      
      {layout === 'layout-1' && (
        <div ref={sectionRef}>
          {/* Desktop */}
          <section className="image-masonry-block layout-1 h-pad desktop">
            {backgroundColorValue && (
              <div className="colour-background" style={{ backgroundColor: backgroundColorValue }}></div>
            )}

            <div className="text-wrap max-width-small-text out-of-view">
              {heading && <h2 className="heading">{heading}</h2>}
              
              {body && <div><PortableText value={body} components={portableTextComponents} /></div>}

              {linkHref && <div className="cta-font underline-link link">
                <a 
                  href={linkHref} 
                  {...getExternalLinkProps(cta?.linkType)}
                >{linkText}</a>

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                  <path d="M1 1L13.5 13.5L0.999999 26"/>
                </svg>
              </div>}
            </div>

            <div className="row-lg">
              <div className="col-3-12_lg">
                {mediaType1 === 'image' && image1 && (
                  <div className="media-1 media-wrap out-of-opacity">
                    <img 
data-src={urlFor(image1).url()}
                    alt={image1?.alt ?? ''}
                    className="lazy full-bleed-image"
                    style={{
                      objectPosition: image1?.hotspot
                        ? `${image1.hotspot.x * 100}% ${image1.hotspot.y * 100}%`
                        : "center",
                    }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {mediaType1 === 'video' && (video1 || videoUrl1) && (
                  <div className="media-1 media-wrap out-of-opacity">
                    <div className="fill-space-video-wrap">
                      <video
                        src={videoSource1 === 'url' && videoUrl1 ? videoUrl1 : videoUrlFor(video1)}
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

              <div className="col-2-12_lg desktop"></div>

              <div className="col-7-12_lg">
                {mediaType2 === 'image' && image2 && (
                  <div className="media-2 media-wrap out-of-opacity">
                    <img 
data-src={urlFor(image2).url()}
                    alt={image2?.alt ?? ''}
                    className="lazy full-bleed-image"
                    style={{
                      objectPosition: image2?.hotspot
                        ? `${image2.hotspot.x * 100}% ${image2.hotspot.y * 100}%`
                        : "center",
                    }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {mediaType2 === 'video' && (video2 || videoUrl2) && (
                  <div className="media-2 media-wrap out-of-opacity">
                    <div className="fill-space-video-wrap">
                      <video
                        src={videoSource2 === 'url' && videoUrl2 ? videoUrl2 : videoUrlFor(video2)}
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

          {/* Mobile */}
          <section className="image-masonry-block layout-1 h-pad mobile">
            {backgroundColorValue && (
              <div className="colour-background" style={{ backgroundColor: backgroundColorValue }}></div>
            )}

            <div>
              <div className="text-wrap max-width-small-text out-of-view">
                {heading && <h2 className="heading">{heading}</h2>}
                
                {body && <div><PortableText value={body} components={portableTextComponents} /></div>}

                {cta?.href && <div className="cta-font underline-link link">
                  <a href={cta.href}>{cta.label || ''}</a>

                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                    <path d="M1 1L13.5 13.5L0.999999 26"/>
                  </svg>
                </div>}
              </div>
            </div>

            <div className="row-sm">
              <div className="col-1-5_sm"></div>

              <div className="col-4-5_sm">
                {mediaType2 === 'image' && image2 && (
                  <div className="media-2 media-wrap out-of-opacity">
                    <img 
data-src={urlFor(image2).url()}
                    alt={image2?.alt ?? ''}
                    className="lazy full-bleed-image"
                    style={{
                      objectPosition: image2?.hotspot
                        ? `${image2.hotspot.x * 100}% ${image2.hotspot.y * 100}%`
                        : "center",
                    }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {mediaType2 === 'video' && (video2 || videoUrl2) && (
                  <div className="media-2 media-wrap out-of-opacity">
                    <div className="fill-space-video-wrap">
                      <video
                        src={videoSource2 === 'url' && videoUrl2 ? videoUrl2 : videoUrlFor(video2)}
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

            <div className="row-sm">
              <div className="col-3-5_sm">
                {mediaType1 === 'image' && image1 && (
                  <div className="media-1 media-wrap out-of-opacity">
                    <img 
data-src={urlFor(image1).url()}
                    alt={image1?.alt ?? ''}
                    className="lazy full-bleed-image"
                    style={{
                      objectPosition: image1?.hotspot
                        ? `${image1.hotspot.x * 100}% ${image1.hotspot.y * 100}%`
                        : "center",
                    }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {mediaType1 === 'video' && (video1 || videoUrl1) && (
                  <div className="media-1 media-wrap out-of-opacity">
                    <div className="fill-space-video-wrap">
                      <video
                        src={videoSource1 === 'url' && videoUrl1 ? videoUrl1 : videoUrlFor(video1)}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    </div>
                  </div>
                )}

                <div className="col-2-5_sm"></div>
              </div>
            </div>
          </section>
        </div>
      )}

      {layout === 'layout-2' && (
        <>
          <section className="image-masonry-block layout-2 h-pad">
            <div className="row-1 row-lg">
              <div className="col-7-12_lg">
                <div className="text-wrap max-width-big-text out-of-view">
                  {heading && <div className="heading cta-font">{heading}</div>}
                  
                  {body && <div className="h2"><PortableText value={body} components={portableTextComponents} /></div>}

                  {cta?.href && <div className="cta-font underline-link link">
                    <a href={cta.href}>{cta.label || ''}</a>

                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                      <path d="M1 1L13.5 13.5L0.999999 26"/>
                    </svg>
                  </div>}
                </div>
              </div>

              {/* Desktop only */}
              <div className="col-5-12_lg desktop">
                {mediaType1 === 'image' && image1 && (
                  <div className="media-1 media-wrap out-of-opacity">
                    <img 
                    data-src={urlFor(image1).url()}
                    alt={image1?.alt ?? ''}
                    className="lazy full-bleed-image"
                    style={{
                      objectPosition: image1?.hotspot
                        ? `${image1.hotspot.x * 100}% ${image1.hotspot.y * 100}%`
                        : "center",
                    }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {mediaType1 === 'video' && (video1 || videoUrl1) && (
                  <div className="media-1 media-wrap out-of-opacity">
                    <div className="fill-space-video-wrap">
                      <video
                        src={videoSource1 === 'url' && videoUrl1 ? videoUrl1 : videoUrlFor(video1)}
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

            {/* Tablet & Mobile only */}
            <div className="row-2 row-lg row-sm">
              <div className="col-7-12_lg col-1-5_sm"></div>

              <div className="col-5-12_lg col-4-5_sm">
                {mediaType1 === 'image' && image1 && (
                  <div className="media-1 media-wrap out-of-opacity">
                    <img 
                    data-src={urlFor(image1).url()}
                    alt={image1?.alt ?? ''}
                    className="lazy full-bleed-image"
                    style={{
                      objectPosition: image1?.hotspot
                        ? `${image1.hotspot.x * 100}% ${image1.hotspot.y * 100}%`
                        : "center",
                    }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {mediaType1 === 'video' && (video1 || videoUrl1) && (
                  <div className="media-1 media-wrap out-of-opacity">
                    <div className="fill-space-video-wrap">
                      <video
                        src={videoSource1 === 'url' && videoUrl1 ? videoUrl1 : videoUrlFor(video1)}
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

            <div className="row-3 row-lg row-sm">
              <div className="col-1-12_lg desktop"></div>

              <div className="col-4-12_lg col-4-5_sm">
                {mediaType2 === 'image' && image2 && (
                  <div className="media-2 media-wrap out-of-opacity">
                    <img 
                    data-src={urlFor(image2).url()}
                    alt={image2?.alt ?? ''}
                    className="lazy full-bleed-image"
                    style={{
                      objectPosition: image2?.hotspot
                        ? `${image2.hotspot.x * 100}% ${image2.hotspot.y * 100}%`
                        : "center",
                    }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {mediaType2 === 'video' && (video2 || videoUrl2) && (
                  <div className="media-2 media-wrap out-of-opacity">
                    <div className="fill-space-video-wrap">
                      <video
                        src={videoSource2 === 'url' && videoUrl2 ? videoUrl2 : videoUrlFor(video2)}
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

              <div className="col-7-12_lg col-1-5_sm"></div>
            </div>
          </section>
        </>
      )}

      {layout === 'layout-3' && (
        <>
          {/* Desktop */}
          <section className="image-masonry-block layout-3 h-pad desktop">
            <div className="row-lg">
              <div className="col-6-12_lg">
                <div className="text-wrap max-width-big-text out-of-view">
                  {heading && <div className="heading cta-font">{heading}</div>}
                  
                  {body && <div className="h2"><PortableText value={body} components={portableTextComponents} /></div>}

                  {cta?.href && <div className="cta-font underline-link link">
                    <a href={cta.href}>{cta.label || ''}</a>

                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                      <path d="M1 1L13.5 13.5L0.999999 26"/>
                    </svg>
                  </div>}
                </div>
              </div>

              <div className="col-6-12_lg">
                {mediaType1 === 'image' && image1 && (
                  <div className="media-1 media-wrap out-of-opacity">
                    <img 
                    data-src={urlFor(image1).url()}
                    alt={image1?.alt ?? ''}
                    className="lazy full-bleed-image"
                    style={{
                      objectPosition: image1?.hotspot
                        ? `${image1.hotspot.x * 100}% ${image1.hotspot.y * 100}%`
                        : "center",
                    }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {mediaType1 === 'video' && (video1 || videoUrl1) && (
                  <div className="media-1 media-wrap out-of-opacity">
                    <div className="fill-space-video-wrap">
                      <video
                        src={videoSource1 === 'url' && videoUrl1 ? videoUrl1 : videoUrlFor(video1)}
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

            <div className="row-lg">
              <div className="col-4-12_lg">
                {mediaType2 === 'image' && image2 && (
                  <div className="media-2 media-wrap out-of-opacity">
                    <img 
                    data-src={urlFor(image2).url()}
                    alt={image2?.alt ?? ''}
                    className="lazy full-bleed-image"
                    style={{
                      objectPosition: image2?.hotspot
                        ? `${image2.hotspot.x * 100}% ${image2.hotspot.y * 100}%`
                        : "center",
                    }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {mediaType2 === 'video' && (video2 || videoUrl2) && (
                  <div className="media-2 media-wrap out-of-opacity">
                    <div className="fill-space-video-wrap">
                      <video
                        src={videoSource2 === 'url' && videoUrl2 ? videoUrl2 : videoUrlFor(video2)}
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

              <div className="col-8-12_lg desktop"></div>
            </div>
          </section>

          {/* Mobile */}
          <section className="image-masonry-block layout-3 h-pad mobile">
            <div>
              <div className="text-wrap max-width-big-text out-of-view">
                {heading && <div className="heading cta-font">{heading}</div>}
                
                {body && <div className="h2"><PortableText value={body} /></div>}

                {cta?.href && <div className="cta-font underline-link link">
                  <a href={cta.href}>{cta.label || ''}</a>

                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                    <path d="M1 1L13.5 13.5L0.999999 26"/>
                  </svg>
                </div>}
              </div>
            </div>

            <div className="row-sm">
              <div className="col-2-5_sm">
                {mediaType2 === 'image' && image2 && (
                  <div className="media-2 media-wrap out-of-opacity">
                    <img 
data-src={urlFor(image2).url()}
                    alt={image2?.alt ?? ''}
                    className="lazy full-bleed-image"
                    style={{
                      objectPosition: image2?.hotspot
                        ? `${image2.hotspot.x * 100}% ${image2.hotspot.y * 100}%`
                        : "center",
                    }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {mediaType2 === 'video' && (video2 || videoUrl2) && (
                  <div className="media-2 media-wrap out-of-opacity">
                    <div className="fill-space-video-wrap">
                      <video
                        src={videoSource2 === 'url' && videoUrl2 ? videoUrl2 : videoUrlFor(video2)}
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

              <div className="col-3-5_sm">
                {mediaType1 === 'image' && image1 && (
                  <div className="media-1 media-wrap out-of-opacity">
                    <img 
data-src={urlFor(image1).url()}
                    alt={image1?.alt ?? ''}
                    className="lazy full-bleed-image"
                    style={{
                      objectPosition: image1?.hotspot
                        ? `${image1.hotspot.x * 100}% ${image1.hotspot.y * 100}%`
                        : "center",
                    }}
                    />
                    <div className="loading-overlay" />
                  </div>
                )}

                {mediaType1 === 'video' && (video1 || videoUrl1) && (
                  <div className="media-1 media-wrap out-of-opacity">
                    <div className="fill-space-video-wrap">
                      <video
                        src={videoSource1 === 'url' && videoUrl1 ? videoUrl1 : videoUrlFor(video1)}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    </div>
                  </div>
                )}

                <div className="col-1-5_sm"></div>
              </div>
            </div>
          </section>
        </>
      )}

    </>
  )
}
