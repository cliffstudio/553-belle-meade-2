import type { CtaLink } from '../types/link'

type LinkInfo = {
  text: string
  href: string
}

const getJumpLinkHref = (jumpLink?: string): string => {
  const trimmedJumpLink = jumpLink?.trim()

  if (!trimmedJumpLink) return ''

  return trimmedJumpLink.startsWith('#') ? trimmedJumpLink : `#${trimmedJumpLink}`
}

export const getLinkInfo = (cta?: CtaLink): LinkInfo => {
  if (!cta) return { text: '', href: '' }

  if (cta.linkType === 'external') {
    return { text: cta.label || cta.href || '', href: cta.href || '' }
  }

  if (cta.linkType === 'jump') {
    return { text: cta.label || cta.jumpLink || '', href: getJumpLinkHref(cta.jumpLink) }
  }

  return {
    text: cta.label || cta.pageLink?.title || '',
    href: cta.pageLink?.slug ? `/${cta.pageLink.slug}` : '',
  }
}
