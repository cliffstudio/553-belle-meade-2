import { notFound } from 'next/navigation'
import { client, clientNoCdn } from '../../../../../sanity.client'
import { brandsPostQuery, brandsPostsQuery } from '../../../../sanity/lib/queries'
import BrandsPost from '../../../../components/BrandsPost'
import BodyClassProvider from '../../../../components/BodyClassProvider'
import type { Metadata } from 'next'
import { buildMetadata } from '../../../../utils/metadata'

interface BrandsPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const posts = await client.fetch(`
    *[_type == "brands"] {
      "slug": slug.current
    }
  `)
  
  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }))
}

export const revalidate = 0

export async function generateMetadata({ params }: BrandsPostPageProps): Promise<Metadata> {
  const resolvedParams = await params
  
  const post = await clientNoCdn.fetch(brandsPostQuery, { slug: resolvedParams.slug }, {
    next: { revalidate: 0 }
  })

  if (!post) {
    return {}
  }

  return buildMetadata(post.seo, post.title)
}

export default async function BrandsPostPage({ params }: BrandsPostPageProps) {
  const resolvedParams = await params
  
  const [post, allPosts] = await Promise.all([
    clientNoCdn.fetch(brandsPostQuery, { slug: resolvedParams.slug }, {
      next: { revalidate: 0 }
    }),
    clientNoCdn.fetch(brandsPostsQuery, {}, {
      next: { revalidate: 0 }
    })
  ])

  if (!post) {
    notFound()
  }

  const currentIndex = allPosts.findIndex((p: { slug: { current: string } }) => p.slug.current === resolvedParams.slug)
  const nextPost = currentIndex !== -1 && currentIndex < allPosts.length - 1 
    ? allPosts[currentIndex + 1] 
    : allPosts[0]

  return (
    <>
      <BodyClassProvider 
        pageType="brands-post" 
        slug={post.slug?.current} 
      />
      <BrandsPost 
        {...post} 
        nextPostSlug={nextPost?.slug?.current}
        nextPostTitle={nextPost?.title}
      />
    </>
  )
}
