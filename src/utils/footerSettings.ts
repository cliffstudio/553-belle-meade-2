import { clientNoCdn } from '../../sanity.client'
import { footerQuery, leftMenuQuery, rightMenuQuery } from '../sanity/lib/queries'
import { FooterSettings } from '../types/footerSettings'

// Type for menu from menuType schema
type Menu = {
  _id: string
  title: string
  items: {
    itemType: 'pageLink' | 'titleWithSubItems'
    pageLink?: {
      _id: string
      title?: string
      slug?: string
    }
    heading?: string
    subItems?: {
      pageLink: {
        _id: string
        title?: string
        slug?: string
      }
    }[]
  }[]
}

export async function getFooterSettings(): Promise<FooterSettings | null> {
  try {
    // Use non-CDN client to ensure fresh footer content bypasses Sanity CDN caching
    const footer = await clientNoCdn.fetch(footerQuery, {}, {
      next: { revalidate: 0 }
    })
    return footer
  } catch (error) {
    console.error('Error fetching footer settings:', error)
    return null
  }
}

export async function getLeftMenu(): Promise<Menu | null> {
  try {
    // Use non-CDN client to ensure fresh menu content bypasses Sanity CDN caching
    const menu = await clientNoCdn.fetch(leftMenuQuery, {}, {
      next: { revalidate: 0 }
    })
    return menu
  } catch (error) {
    console.error('Error fetching left menu:', error)
    return null
  }
}

export async function getRightMenu(): Promise<Menu | null> {
  try {
    // Use non-CDN client to ensure fresh menu content bypasses Sanity CDN caching
    const menu = await clientNoCdn.fetch(rightMenuQuery, {}, {
      next: { revalidate: 0 }
    })
    return menu
  } catch (error) {
    console.error('Error fetching right menu:', error)
    return null
  }
}
