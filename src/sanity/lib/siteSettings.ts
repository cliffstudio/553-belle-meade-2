import { cache } from 'react'
import { clientNoCdn } from '../../../sanity.client'
import { metadataQuery } from './queries'

type SiteSettings = {
  _id?: string
  title?: string | null
  description?: string | null
  socialimage?: {
    asset?: { _ref: string; _type: string }
    hotspot?: unknown
    crop?: unknown
  }
}

const FALLBACK_TITLE = 'Belle Meade Village'
const FALLBACK_DESCRIPTION =
  'Belle Meade Village – luxury living and heritage in Nashville.'

/**
 * Cached fetch of site settings (SEO defaults). Dedupes within the same request.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  try {
    const settings = await clientNoCdn.fetch<SiteSettings | null>(metadataQuery, {}, { next: { revalidate: 0 } })
    return settings
  } catch {
    return null
  }
})

export function getDefaultTitle(settings: SiteSettings | null): string {
  return settings?.title?.trim() || FALLBACK_TITLE
}

export function getDefaultDescription(settings: SiteSettings | null): string {
  return settings?.description?.trim() || FALLBACK_DESCRIPTION
}
