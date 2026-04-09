// src/app/(main)/[...slug]/page.tsx
import DynamicPage from '../../../components/DynamicPage'
import { client, clientNoCdn } from '../../../../sanity.client'
import { pageSlugsQuery, pageQuery } from '../../../sanity/lib/queries'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { buildMetadata } from '../../../utils/metadata'

interface PageProps {
  params: Promise<{
    slug: string[]
  }>
}

export async function generateStaticParams() {
  // Keep CDN for build-time static generation
  const pages = await client.fetch(pageSlugsQuery)
  
  return pages
    .filter((page: { slug: { current: string } }) => {
      // Exclude press posts from this route since they have their own dedicated route
      return !page.slug.current.startsWith('press/') || page.slug.current === 'press'
    })
    .map((page: { slug: { current: string } }) => ({
      slug: page.slug.current.split('/'),
    }))
}

// Ensure fresh content for dynamic pages
export const revalidate = 0

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug.join('/')
  
  // Check if this is a press post route and return not found metadata
  if (slug.startsWith('press/') && slug !== 'press') {
    return {}
  }
  
  // Fetch page data to get metadata
  const page = await clientNoCdn.fetch(pageQuery, { slug }, {
    next: { revalidate: 0 }
  })

  if (!page) {
    return {}
  }

  return buildMetadata(page.seo, page.title)
}

export default async function Page({ params }: PageProps) {
  // Convert array to string for the slug
  const resolvedParams = await params
  const slug = resolvedParams.slug.join('/')
  
  // Check if this is a press post route and redirect to not found
  // since press posts should be handled by the dedicated press/[slug] route
  if (slug.startsWith('press/') && slug !== 'press') {
    return notFound()
  }
  
  return <DynamicPage params={Promise.resolve({ slug })} />
}
