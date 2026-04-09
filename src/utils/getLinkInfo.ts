import type { CtaLink } from '../types/link'

type LinkInfo = {
  text: string
  href: string
}

export const getLinkInfo = (cta?: CtaLink): LinkInfo => {
  if (!cta) return { text: '', href: '' }

  if (cta.linkType === 'external') {
    return { text: cta.label || cta.href || '', href: cta.href || '' }
  }

  if (cta.linkType === 'jump') {
    return { text: cta.label || cta.jumpLink || '', href: cta.jumpLink || '' }
  }

  return {
    text: cta.label || cta.pageLink?.title || '',
    href: cta.pageLink?.slug ? `/${cta.pageLink.slug}` : '',
  }
}
