/* eslint-disable @next/next/no-img-element */

import React from 'react'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { SanityImage } from '../types/sanity'

type SocialLink = {
  _key?: string
  icon?: SanityImage
  link?: string
}

type InstagramFeedProps = {
  title?: string
  socialLinks?: SocialLink[]
}

type InstagramTempImage = {
  src: string
  alt: string
}

const tempInstagramImages: InstagramTempImage[] = [
  { src: '/temp-insta-images/Rectangle%20268.jpg', alt: 'Instagram placeholder 1' },
  { src: '/temp-insta-images/Rectangle%20282.jpg', alt: 'Instagram placeholder 2' },
  { src: '/temp-insta-images/Rectangle%20283.jpg', alt: 'Instagram placeholder 3' },
  { src: '/temp-insta-images/Rectangle%20287.jpg', alt: 'Instagram placeholder 4' },
  { src: '/temp-insta-images/Rectangle%20288.jpg', alt: 'Instagram placeholder 5' },
  { src: '/temp-insta-images/Rectangle%20289.jpg', alt: 'Instagram placeholder 6' },
]

const InstagramFeed: React.FC<InstagramFeedProps> = ({ title, socialLinks = [] }) => {
  const validLinks = socialLinks.filter((item) => item?.icon && item?.link)

  if (!title && validLinks.length === 0 && tempInstagramImages.length === 0) {
    return null
  }

  return (
    <section className="instagram-feed-block h-pad">
      <div className="top-wrap">
        {title && <h2 className="heading out-of-view">{title}</h2>}

        {validLinks.length > 0 && (
          <div className="social-links desktop">
            {validLinks.map((item, index) => (
              <div
                key={item._key ?? `${item.link ?? 'social'}-${index}`}
                className="social-link-item out-of-opacity"
              >
                {item.icon && (
                  <img
                    src={urlFor(item.icon).url()}
                    alt={item.icon?.alt ?? 'Social icon'}
                    className="icon-image"
                  />
                )}
                <a href={item.link} target="_blank" rel="noopener noreferrer"></a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="instagram-carousel out-of-opacity">
        <div className="instagram-carousel__track" aria-hidden="true">
          {[...tempInstagramImages, ...tempInstagramImages].map((image, index) => (
            <div className="instagram-carousel__item" key={`${image.src}-${index}`}>
              <img src={image.src} alt={image.alt} className="full-bleed-image" />
            </div>
          ))}
        </div>
      </div>

      {validLinks.length > 0 && (
        <div className="social-links mobile">
          {validLinks.map((item, index) => (
            <div
              key={item._key ?? `${item.link ?? 'social'}-${index}`}
              className="social-link-item out-of-opacity"
            >
              {item.icon && (
                <img
                  src={urlFor(item.icon).url()}
                  alt={item.icon?.alt ?? 'Social icon'}
                  className="icon-image"
                />
              )}
              <a href={item.link} target="_blank" rel="noopener noreferrer"></a>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default InstagramFeed
