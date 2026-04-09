export type PageReference = {
  _ref?: string
  _type?: 'reference'
  slug?: string
  title?: string
}

export type CtaLink = {
  linkType?: 'internal' | 'external' | 'jump'
  label?: string
  href?: string
  pageLink?: PageReference
  jumpLink?: string
}
