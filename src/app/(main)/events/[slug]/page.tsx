import { notFound } from 'next/navigation'
import { client, clientNoCdn } from '../../../../../sanity.client'
import { eventsPostQuery, eventsPostsQuery } from '../../../../sanity/lib/queries'
import EventsPost from '../../../../components/EventsPost'
import BodyClassProvider from '../../../../components/BodyClassProvider'
import type { Metadata } from 'next'
import { buildMetadata } from '../../../../utils/metadata'

interface EventsPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  // Keep CDN for build-time static generation (runs at build time, CDN is fine)
  const posts = await client.fetch(`
    *[_type == "events"] {
      "slug": slug.current
    }
  `)
  
  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }))
}

export const revalidate = 0 // Ensure fresh content for Events posts

export async function generateMetadata({ params }: EventsPostPageProps): Promise<Metadata> {
  const resolvedParams = await params
  
  // Fetch post data to get metadata
  const post = await clientNoCdn.fetch(eventsPostQuery, { slug: resolvedParams.slug }, {
    next: { revalidate: 0 }
  })

  if (!post) {
    return {}
  }

  return buildMetadata(post.seo, post.title)
}

export default async function EventsPostPage({ params }: EventsPostPageProps) {
  const resolvedParams = await params
  
  // Use non-CDN client to ensure fresh content bypasses Sanity CDN caching
  const [post, allPosts] = await Promise.all([
    clientNoCdn.fetch(eventsPostQuery, { slug: resolvedParams.slug }, {
      next: { revalidate: 0 }
    }),
    clientNoCdn.fetch(eventsPostsQuery, {}, {
      next: { revalidate: 0 }
    })
  ])

  if (!post) {
    notFound()
  }

  // Find the current post index and determine next post
  const currentIndex = allPosts.findIndex((p: { slug: { current: string } }) => p.slug.current === resolvedParams.slug)
  const nextPost = currentIndex !== -1 && currentIndex < allPosts.length - 1 
    ? allPosts[currentIndex + 1] 
    : allPosts[0] // If on last post, go to first post

  return (
    <>
      <BodyClassProvider 
        pageType="events-post" 
        slug={post.slug?.current} 
      />
      <EventsPost 
        {...post} 
        nextPostSlug={nextPost?.slug?.current}
        nextPostTitle={nextPost?.title}
      />
    </>
  )
}
