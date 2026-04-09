import { PortableTextBlock } from './sanity'
import { CtaLink } from './link'

export type FooterItem = {
  heading?: string
  text?: PortableTextBlock[]
}

export type Footer = {
  title?: string
  column1?: FooterItem[]
  column2?: CtaLink[]
  column3?: CtaLink[]
  newsletterText?: PortableTextBlock[]
}

export type FooterSettings = Footer
