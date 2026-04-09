import { PortableTextBlock } from '@sanity/types'
import { SanityImage } from '../../types/sanity'

export interface BrandDirectoryCategory {
  _id: string
  name?: string
  icon?: SanityImage
}

export interface BrandDirectoryItem {
  id: string
  title: string
  href: string
  image?: SanityImage
  category?: BrandDirectoryCategory
  openingHours?: PortableTextBlock[]
  address?: PortableTextBlock[]
}
