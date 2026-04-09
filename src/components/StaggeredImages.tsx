/* eslint-disable @next/next/no-img-element */

import { PortableText } from '@portabletext/react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImage, SanityVideo, PortableTextBlock } from '../types/sanity'
import { videoUrlFor } from '@/sanity/utils/videoUrlBuilder'
import { portableTextComponents } from '../utils/portableTextComponents'

type LayoutVariant = 'layout-1' | 'layout-2' | 'layout-3'

type StaggeredImagesProps = { 
  heading?: string
  body?: PortableTextBlock[]
  mediaType1?: 'image' | 'video'
  image1?: SanityImage
  video1?: SanityVideo
  videoSource1?: 'file' | 'url'
  videoUrl1?: string
  caption1?: string
  mediaType2?: 'image' | 'video'
  image2?: SanityImage
  video2?: SanityVideo
  videoSource2?: 'file' | 'url'
  videoUrl2?: string
  caption2?: string
  mediaType3?: 'image' | 'video'
  image3?: SanityImage
  video3?: SanityVideo
  videoSource3?: 'file' | 'url'
  videoUrl3?: string
  caption3?: string
  layout?: LayoutVariant
}

export default function StaggeredImages({ 
  heading, 
  body, 
  mediaType1 = 'image',
  image1, 
  video1,
  videoSource1 = 'file',
  videoUrl1,
  caption1,
  mediaType2 = 'image',
  image2, 
  video2,
  videoSource2 = 'file',
  videoUrl2,
  caption2,
  mediaType3 = 'image',
  image3, 
  video3,
  videoSource3 = 'file',
  videoUrl3,
  caption3,
  layout = 'layout-1' 
}: StaggeredImagesProps) {
  // Helper function to render media (image or video)
  const renderMedia = (
    mediaType: 'image' | 'video', 
    image: SanityImage | undefined, 
    video: SanityVideo | undefined, 
    videoSource: 'file' | 'url' = 'file',
    videoUrl: string | undefined,
    className: string
  ) => {
    if (mediaType === 'image' && image) {
      return (
        <>
          <img 
data-src={urlFor(image).url()}
            alt={image?.alt ?? ''}
            className={`lazy ${className} full-bleed-image`}
            style={{
              objectPosition: image?.hotspot
                ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`
                : "center",
            }}
          />
          <div className="loading-overlay" />
        </>
      )
    } else if (mediaType === 'video' && (video || videoUrl)) {
      return (
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
      )
    }
    return null
  }

  return (
    <>
      {layout === 'layout-1' && (
        <section className="staggered-images-block h-pad layout-1">
          <div className="row-1">
            <div className="text-wrap max-width-big-text out-of-view">
              {heading && <h2 className="heading cta-font">{heading}</h2>}
              {body && <div className="h2"><PortableText value={body} components={portableTextComponents} /></div>}
            </div>
          </div>

          <div className="row-2 row-lg row-sm">
            <div className="col-7-12_lg col-1-5_sm"></div>

            <div className="relative col-5-12_lg col-4-5_sm out-of-opacity">
              {(image1 || video1) && (
                <div className="media-1 media-wrap">
                  {renderMedia(mediaType1, image1, video1, videoSource1, videoUrl1, 'full-bleed-image')}
                </div>
              )}

              {caption1 && <div className="media-caption caption-font">{caption1}</div>}
            </div>
          </div>

          <div className="row-3 row-lg row-sm">
            <div className="relative col-3-12_lg col-2-5_sm out-of-opacity">
              {(image2 || video2) && (
                <div className="media-2 media-wrap">
                  {renderMedia(mediaType2, image2, video2, videoSource2, videoUrl2, 'full-bleed-image')}
                </div>
              )}

              {caption2 && <div className="media-caption caption-font">{caption2}</div>}
            </div>

            <div className="col-9-12_lg col-3-5_sm"></div>
          </div>

          <div className="row-4 row-lg row-sm">
            <div className="col-4-12_lg col-1-5_sm"></div>

            <div className="relative col-4-12_lg col-3-5_sm out-of-opacity">
              {(image3 || video3) && (
                <div className="media-3 media-wrap">
                  {renderMedia(mediaType3, image3, video3, videoSource3, videoUrl3, 'regular')}
                </div>
              )}

              {caption3 && <div className="media-caption caption-font">{caption3}</div>}
            </div>

            <div className="col-4-12_lg col-1-5_sm"></div>
          </div>
        </section>
      )}

      {layout === 'layout-2' && (
        <section className="staggered-images-block h-pad layout-2">
          <div className="row-1 row-lg">
            <div className="col-1 col-7-12_lg out-of-view">
              <div className="text-wrap max-width-big-text">
                {heading && <h2 className="heading cta-font">{heading}</h2>}
                {body && <div className="h2"><PortableText value={body} components={portableTextComponents} /></div>}
              </div>
            </div>

            {/* Desktop only */}
            <div className="col-2 relative col-3-12_lg desktop out-of-opacity">
              {(image1 || video1) && (
                <div className="media-1 media-wrap">
                  {renderMedia(mediaType1, image1, video1, videoSource1, videoUrl1, 'full-bleed-image')}
                </div>
              )}

              {caption1 && <div className="media-caption caption-font">{caption1}</div>}
            </div>

            <div className="col-2-12_lg"></div>
          </div>

          {/* Tablet & Mobile only */}
          <div className="row-2 row-lg row-sm">
            <div className="col-6-12_lg col-3-5_sm"></div>

            <div className="relative col-3-12_lg col-2-5_sm out-of-opacity">
              {(image1 || video1) && (
                <div className="media-1 media-wrap">
                  {renderMedia(mediaType1, image1, video1, videoSource1, videoUrl1, 'full-bleed-image')}
                </div>
              )}

              {caption1 && <div className="media-caption caption-font">{caption1}</div>}
            </div>

            <div className="col-2-12_lg col-0-5_sm"></div>
          </div>

          <div className="row-3 row-lg row-sm">
            <div className="relative col-5-12_lg col-2-5_sm out-of-opacity">
              {(image2 || video2) && (
                <div className="media-2 media-wrap">
                  {renderMedia(mediaType2, image2, video2, videoSource2, videoUrl2, 'full-bleed-image')}
                </div>
              )}

              {caption2 && <div className="media-caption caption-font">{caption2}</div>}
            </div>

            <div className="col-7-12_lg col-3-5_sm"></div>
          </div>

          <div className="row-4 row-lg row-sm">
            <div className="col-8-12_lg col-2-5_sm"></div>

            <div className="relative col-4-12_lg col-3-5_sm out-of-opacity">
              {(image3 || video3) && (
                <div className="media-3 media-wrap">
                  {renderMedia(mediaType3, image3, video3, videoSource3, videoUrl3, 'regular')}
                </div>
              )}

              {caption3 && <div className="media-caption caption-font">{caption3}</div>}
            </div>
          </div>
        </section>
      )}

      {layout === 'layout-3' && (
        <section className="staggered-images-block h-pad layout-3">
          <div className="row-1">
            <div className="text-wrap max-width-big-text out-of-view">
              {heading && <h2 className="heading cta-font">{heading}</h2>}
              {body && <div className="h2"><PortableText value={body} components={portableTextComponents} /></div>}
            </div>
          </div>

          <div className="row-2 row-lg row-sm">
            <div className="col-8-12_lg col-2-5_sm"></div>

            <div className="relative col-4-12_lg col-3-5_sm out-of-opacity">
              {(image1 || video1) && (
                <div className="media-1 media-wrap">
                  {renderMedia(mediaType1, image1, video1, videoSource1, videoUrl1, 'full-bleed-image')}
                </div>
              )}

              {caption1 && <div className="media-caption caption-font">{caption1}</div>}
            </div>
          </div>

          <div className="row-3 row-lg row-sm">
            <div className="relative col-5-12_lg col-3-5_sm out-of-opacity">
              {(image2 || video2) && (
                <div className="media-2 media-wrap">
                  {renderMedia(mediaType2, image2, video2, videoSource2, videoUrl2, 'full-bleed-image')}
                </div>
              )}

              {caption2 && <div className="media-caption caption-font">{caption2}</div>}
            </div>

            <div className="col-7-12_lg col-2-5_sm"></div>
          </div>

          <div className="row-4 row-lg row-sm">
            <div className="col-6-12_lg col-3-5_sm"></div>

            <div className="relative col-3-12_lg col-2-5_sm out-of-opacity">
              {(image3 || video3) && (
                <div className="media-3 media-wrap">
                  {renderMedia(mediaType3, image3, video3, videoSource3, videoUrl3, 'regular')}
                </div>
              )}

              {caption3 && <div className="media-caption caption-font">{caption3}</div>}
            </div>

            <div className="col-3-12_lg desktop"></div>
          </div>
        </section>
      )}
    </>
  )
}
