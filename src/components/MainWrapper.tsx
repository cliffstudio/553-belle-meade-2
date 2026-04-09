'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useState } from 'react'
import { client } from '../../sanity.client'
import { groq } from 'next-sanity'

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [pageType, setPageType] = useState<string>('home')
  
  // Generate page-specific class based on pathname
  const getPageClass = () => {
    // Remove leading slash, trailing slash, and convert to kebab-case
    const cleanPath = pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-')
    
    if (cleanPath === '') return 'page-home'
    return `page-${cleanPath}`
  }

  // Scroll to top on route change - useLayoutEffect runs before paint/animations
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Fetch page data to get the correct pageType
  useEffect(() => {
    const fetchPageType = async () => {
      if (pathname === '/' || pathname === '') {
        setPageType('home')
        return
      }

      try {
        // Remove leading slash and get the slug
        const slug = pathname.replace(/^\//, '')
        
        // Fetch the page data to get the pageType
        const pageData = await client.fetch(groq`
          *[_type == "page" && slug.current == $slug][0] {
            pageType
          }
        `, { slug })
        
        if (pageData?.pageType) {
          setPageType(pageData.pageType)
        } else {
          // Fallback to pathname-based pageType
          const fallbackPageType = pathname.split('/')[1] || 'home'
          setPageType(fallbackPageType)
        }
      } catch (error) {
        console.error('Error fetching page type:', error)
        // Fallback to pathname-based pageType
        const fallbackPageType = pathname.split('/')[1] || 'home'
        setPageType(fallbackPageType)
      }
    }

    fetchPageType()
  }, [pathname])

  const pageTypeClass = `page-template-${pageType}`

  return (
    <main className={`${getPageClass()} ${pageTypeClass}`}>
      {children}
    </main>
  )
}
