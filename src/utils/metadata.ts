import type { Metadata } from 'next'
import { urlFor } from '../sanity/utils/imageUrlBuilder'
import { getSiteSettings, getDefaultTitle, getDefaultDescription } from '../sanity/lib/siteSettings'

interface PageSEO {
  metaTitle?: string | null
  metaDescription?: string | null
  socialImage?: {
    asset?: {
      _ref: string
      _type: string
    }
    hotspot?: unknown
    crop?: unknown
  }
}

function getSocialImageUrl(source: { asset?: { _ref: string }; hotspot?: unknown; crop?: unknown } | null | undefined): string | undefined {
  if (!source?.asset?._ref) return undefined
  return urlFor(source).width(1200).height(630).url()
}

/**
 * Builds page metadata. When a custom SEO title is set it is used as the full title.
 * Otherwise the title is "page document title | site title".
 */
export async function buildMetadata(
  pageSEO?: PageSEO | null,
  pageTitle?: string | null
): Promise<Metadata> {
  const site = await getSiteSettings()
  const siteTitle = getDefaultTitle(site)
  const defaultDescription = getDefaultDescription(site)

  const customTitle = pageSEO?.metaTitle?.trim()
  const fullTitle = customTitle
    ? customTitle
    : `${pageTitle?.trim() || siteTitle} | ${siteTitle}`

  const description = pageSEO?.metaDescription?.trim() || defaultDescription

  // Prefer page social image, fall back to site settings social image
  const socialImageUrl =
    getSocialImageUrl(pageSEO?.socialImage) ?? getSocialImageUrl(site?.socialimage)

  return {
    title: fullTitle,
    description: description === defaultDescription ? undefined : description,
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      locale: 'en_US',
      siteName: siteTitle,
      ...(socialImageUrl && {
        images: [
          {
            url: socialImageUrl,
            width: 1200,
            height: 630,
            alt: fullTitle,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      ...(socialImageUrl && { images: [socialImageUrl] }),
    },
  }
}
