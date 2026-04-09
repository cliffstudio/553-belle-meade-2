/* eslint-disable @next/next/no-img-element */
"use client"

import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { videoUrlFor } from '../sanity/utils/videoUrlBuilder'
import { SanityImage, SanityVideo } from '../types/sanity'
import Logo from './Logo'
import StackedLogo from './StackedLogo'
import { useRef } from 'react'

type SignInHeroMediaProps = {
  backgroundMediaType?: 'image' | 'video'
  desktopBackgroundImage?: SanityImage
  mobileBackgroundImage?: SanityImage
  desktopBackgroundVideo?: SanityVideo
  videoSource?: 'file' | 'url'
  desktopBackgroundVideoUrl?: string
  desktopBackgroundVideoPlaceholder?: SanityImage
  showControls?: boolean
  overlayDarkness?: number
  auth: (formData: FormData) => Promise<void>
  redirect?: string | string[]
}

export default function SignInHeroMedia(props: SignInHeroMediaProps) {
  const { 
    backgroundMediaType = 'image',
    desktopBackgroundImage,
    mobileBackgroundImage,
    desktopBackgroundVideo,
    videoSource = 'file',
    desktopBackgroundVideoUrl,
    desktopBackgroundVideoPlaceholder,
    overlayDarkness = 0.3,
    auth,
    redirect,
  } = props

  const desktopVideoRef = useRef<HTMLVideoElement>(null)
  const mobileVideoRef = useRef<HTMLVideoElement>(null)

  // Determine the video source URL
  const getVideoSrc = () => {
    // If videoSource is explicitly 'url', use the URL
    if (videoSource === 'url') {
      if (desktopBackgroundVideoUrl) {
        return desktopBackgroundVideoUrl
      }
      // If URL is selected but no URL provided, return empty (don't fallback to file)
      return ''
    }
    // Otherwise, use the file upload
    if (desktopBackgroundVideo) {
      return videoUrlFor(desktopBackgroundVideo)
    }
    return ''
  }

  const videoSrc = getVideoSrc()
  const hasVideo = backgroundMediaType === 'video' && (desktopBackgroundVideo || desktopBackgroundVideoUrl)

  return (
    <section className="sign-in-hero-media-block full-height flex items-center text-white relative">
      {hasVideo && videoSrc && (
        <div className="fill-space-video-wrap">
          {/* Desktop Video */}
          <video
            ref={desktopVideoRef}
            src={videoSrc}
            poster={desktopBackgroundVideoPlaceholder ? urlFor(desktopBackgroundVideoPlaceholder).url() : undefined}
            className="desktop"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          
          {/* Mobile Video - using desktop video */}
          <video
            ref={mobileVideoRef}
            src={videoSrc}
            poster={desktopBackgroundVideoPlaceholder ? urlFor(desktopBackgroundVideoPlaceholder).url() : undefined}
            className="mobile"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
      )}

      {backgroundMediaType === 'image' && (desktopBackgroundImage || mobileBackgroundImage) && (
        <div className="fill-space-image-wrap">
          {/* Desktop Image */}
          {desktopBackgroundImage && (
            <img 
data-src={urlFor(desktopBackgroundImage).url()}
              alt={desktopBackgroundImage?.alt ?? ''}
              className="lazy full-bleed-image desktop"
              style={{
                objectPosition: desktopBackgroundImage?.hotspot
                  ? `${desktopBackgroundImage.hotspot.x * 100}% ${desktopBackgroundImage.hotspot.y * 100}%`
                  : "center",
              }}
            />
          )}
          
          {/* Mobile Image */}
          {mobileBackgroundImage && (
            <img
              data-src={urlFor(mobileBackgroundImage).url()}
              alt={mobileBackgroundImage?.alt ?? ''}
              className="lazy full-bleed-image mobile"
              style={{
                objectPosition: mobileBackgroundImage?.hotspot
                  ? `${mobileBackgroundImage.hotspot.x * 100}% ${mobileBackgroundImage.hotspot.y * 100}%`
                  : "center",
              }}
            />
          )}
          
          {/* Fallback to desktop image for mobile if no mobile image provided */}
          {!mobileBackgroundImage && desktopBackgroundImage && (
            <img 
data-src={urlFor(desktopBackgroundImage).url()}
              alt={desktopBackgroundImage?.alt ?? ''}
              className="lazy full-bleed-image mobile"
              style={{
                objectPosition: desktopBackgroundImage?.hotspot
                  ? `${desktopBackgroundImage.hotspot.x * 100}% ${desktopBackgroundImage.hotspot.y * 100}%`
                  : "center",
              }}
            />
          )}
          
          <div className="loading-overlay" />
        </div>
      )}

      <div className="opacity-overlay z-5" style={{ opacity: overlayDarkness }} />

      {/* Logo - always visible, no animation */}
      <div className="logo z-10 h-pad" style={{ opacity: 1 }}>
        <div className="desktop">
          <Logo />
        </div>

        <div className="mobile">
          <StackedLogo />
        </div>
      </div>

      {/* Sign-in Form */}
      <form action={auth} className="z-10">
        <input
          name="redirect"
          type="hidden"
          defaultValue={typeof redirect === 'string' ? redirect : redirect?.[0]}
        />
        <input name="password" type="password" placeholder="ENTER PASSWORD" required autoFocus />
        <button type="submit">
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 12 10">
            <line x1="0" y1="4.8535199" x2="11" y2="4.8535099"/>
            <path d="M6.4765601,9.3535204l4.5000396-4.5000005L6.4765601.353515"/>
          </svg>
        </button>
      </form>
    </section>
  )
}
