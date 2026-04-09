type LinkType = 'internal' | 'external' | 'jump' | undefined

export const getExternalLinkProps = (linkType?: LinkType) =>
  linkType === 'external'
    ? { target: '_blank' as const, rel: 'noopener noreferrer' as const }
    : {}
