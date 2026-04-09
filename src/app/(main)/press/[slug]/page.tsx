import { notFound } from 'next/navigation'
import { client, clientNoCdn } from '../../../../../sanity.client'
import { pressPostQuery, pressPostsQuery } from '../../../../sanity/lib/queries'
import PressPost from '../../../../components/PressPost'
import BodyClassProvider from '../../../../components/BodyClassProvider'
import type { Metadata } from 'next'
import { buildMetadata } from '../../../../utils/metadata'

interface PressPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  // Keep CDN for build-time static generation (runs at build time, CDN is fine)
  const posts = await client.fetch(`
    *[_type == "press"] {
      "slug": slug.current
    }
  `)
  
  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }))
}

export const revalidate = 0 // Ensure fresh content for press posts

export async function generateMetadata({ params }: PressPostPageProps): Promise<Metadata> {
  const resolvedParams = await params
  
  // Fetch post data to get metadata
  const post = await clientNoCdn.fetch(pressPostQuery, { slug: resolvedParams.slug }, {
    next: { revalidate: 0 }
  })

  if (!post) {
    return {}
  }

  return buildMetadata(post.seo, post.title)
}

export default async function PressPostPage({ params }: PressPostPageProps) {
  const resolvedParams = await params
  
  // Use non-CDN client to ensure fresh content bypasses Sanity CDN caching
  const [post, allPosts] = await Promise.all([
    clientNoCdn.fetch(pressPostQuery, { slug: resolvedParams.slug }, {
      next: { revalidate: 0 }
    }),
    clientNoCdn.fetch(pressPostsQuery, {}, {
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
        pageType="press-post" 
        slug={post.slug?.current} 
      />
      <PressPost 
        {...post} 
        nextPostSlug={nextPost?.slug?.current}
        nextPostTitle={nextPost?.title}
      />
    </>
  )
}
