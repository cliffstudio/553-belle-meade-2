import { PortableTextComponents } from '@portabletext/react'

export const portableTextComponents: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = value?.href || ''
      const blank = value?.blank
      
      // Automatically detect external links (starting with http:// or https://)
      const isExternal = href.startsWith('http://') || href.startsWith('https://')
      
      // Add target="_blank" if explicitly set to blank OR if it's an external link
      if (blank || isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        )
      }

      return <a href={href}>{children}</a>
    },
  },
}

