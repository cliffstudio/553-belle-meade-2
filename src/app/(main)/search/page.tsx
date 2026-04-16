/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import type { Metadata } from 'next'
import { groq } from 'next-sanity'
import { clientNoCdn } from '../../../../sanity.client'
import { urlFor } from '../../../sanity/utils/imageUrlBuilder'
import SearchResultsLazyLoad from '../../../components/SearchResultsLazyLoad'

type SearchPageResult = {
  _id: string
  _type: 'page' | 'brands' | 'events' | 'press'
  title?: string
  slug?: string
  summary?: string
  image?: {
    asset?: {
      _ref?: string
    }
    alt?: string
    hotspot?: {
      x: number
      y: number
    }
  }
}

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const revalidate = 0

export async function generateMetadata(props: SearchPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams
  const rawQuery = searchParams.q
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery || '').trim()

  if (!query) {
    return {
      title: 'Search',
      description: 'Search Belle Meade Village content.',
    }
  }

  return {
    title: `Search results for "${query}"`,
    description: `Search results for "${query}" on Belle Meade Village.`,
  }
}

const getResultHref = (result: SearchPageResult) => {
  const slug = result.slug || ''
  if (result._type === 'page') return `/${slug}`
  if (result._type === 'brands') return `/brands/${slug}`
  if (result._type === 'events') return `/events/${slug}`
  return `/press/${slug}`
}

const getResultLabel = (type: SearchPageResult['_type']) => {
  if (type === 'page') return 'Page'
  if (type === 'brands') return 'Brand'
  if (type === 'events') return 'Events'
  return 'Press'
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams
  const rawQuery = searchParams.q
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery || '').trim()

  let results: SearchPageResult[] = []

  if (query.length >= 2) {
    const escapedQuery = query.toLowerCase().replace(/[*?[\]]/g, '')
    const searchPattern = `*${escapedQuery}*`

    results = await clientNoCdn.fetch<SearchPageResult[]>(
      groq`
        *[
          (
            _type == "page" &&
            defined(slug.current) &&
            !(_id in path("drafts.**")) &&
            (
              string::lower(coalesce(title, "")) match $pattern ||
              string::lower(coalesce(seo.metaTitle, "")) match $pattern
            )
          ) ||
          (
            _type == "brands" &&
            defined(slug.current) &&
            !(_id in path("drafts.**")) &&
            (
              string::lower(coalesce(title, "")) match $pattern ||
              string::lower(coalesce(shortDescription, "")) match $pattern
            )
          ) ||
          (
            _type == "events" &&
            defined(slug.current) &&
            !(_id in path("drafts.**")) &&
            (
              string::lower(coalesce(title, "")) match $pattern ||
              string::lower(coalesce(eventLocation, "")) match $pattern
            )
          ) ||
          (
            _type == "press" &&
            defined(slug.current) &&
            !(_id in path("drafts.**")) &&
            (
              string::lower(coalesce(title, "")) match $pattern ||
              string::lower(coalesce(excerpt, "")) match $pattern
            )
          )
        ] | order(_updatedAt desc) [0...100] {
          _id,
          _type,
          title,
          "slug": slug.current,
          "summary": select(
            _type == "brands" => shortDescription,
            _type == "events" => eventLocation,
            _type == "press" => excerpt,
            seo.metaDescription
          ),
          "image": select(
            _type == "page" => thumbnailImage,
            _type == "brands" => coalesce(thumbnailImage, featuredImage),
            _type == "events" => coalesce(thumbnailImage, featuredImage),
            _type == "press" => coalesce(thumbnailImage, featuredImage),
            null
          )
        }
      `,
      { pattern: searchPattern },
      { next: { revalidate: 0 } }
    )
  }

  return (
    <section className="search-page h-pad row-lg">
      <SearchResultsLazyLoad query={query} resultCount={results.length} />
      <div className="col-2-12_lg"></div>

      <div className="inner-wrap col-8-12_lg">
        <div className="search-page-header">
          {query && <h2 className="search-page-query">Search results for &ldquo;{query}&rdquo;</h2>}
        </div>

        {results.length === 0 ? (
          <p className="search-page-status">No results found.</p>
        ) : (
          <div className="search-page-results">
            {results.map((result) => (
              <div key={result._id} className="search-page-result">
                {result.image?.asset?._ref ? (
                  <div className="search-page-result-media">
                    <img 
                      data-src={urlFor(result.image).url()}
                      alt={result.image?.alt || result.title || 'Search result image'}
                      className="lazy full-bleed-image"
                      style={{
                        objectPosition: result.image?.hotspot
                          ? `${result.image.hotspot.x * 100}% ${result.image.hotspot.y * 100}%`
                          : "center",
                      }}
                    />
                    <div className="loading-overlay" />
                  </div>
                ) : (
                  <div className="search-page-result-media search-page-result-media-placeholder" />
                )}

                <div className="search-page-result-content">
                  <p className="search-page-result-label cta-font uppercase">{getResultLabel(result._type)}</p>
                  <h2 className="search-page-result-title">{result.title || 'Untitled'}</h2>
                  {result.summary && <p className="search-page-result-summary">{result.summary}</p>}
                  <div className="search-page-result-cta cta-font underline-link link cream">
                    <a href={getResultHref(result)}>Learn more</a>
                    <svg xmlns="http://www.w3.org/org/2000/svg" viewBox="0 0 15 27">
                      <path d="M1 1L13.5 13.5L0.999999 26"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="col-2-12_lg"></div>
    </section>
  )
}
