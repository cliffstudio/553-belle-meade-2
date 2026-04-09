import DynamicPage from '../../components/DynamicPage'
import { getSession } from '@/sanity/utils/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { clientNoCdn } from '../../../sanity.client'
import { pageQuery, signInPageEnabledQuery } from '../../sanity/lib/queries'
import { buildMetadata } from '../../utils/metadata'

// Disable static generation for this page to ensure fresh content from Sanity
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  // Fetch the home page data to get metadata
  const page = await clientNoCdn.fetch(pageQuery, { slug: 'home' }, {
    next: { revalidate: 0 }
  })

  return buildMetadata(page?.seo, page?.title)
}

export default async function Home() {
  const session = await getSession()

  if (!session.isAuthenticated) {
    const signInEnabled = await clientNoCdn.fetch(signInPageEnabledQuery, {}, { next: { revalidate: 0 } })
    if (signInEnabled) {
      redirect("/sign-in?redirect=/")
    }
  }

  // Render the page with slug "/home" using the general page template
  return <DynamicPage params={Promise.resolve({ slug: 'home' })} />
}
