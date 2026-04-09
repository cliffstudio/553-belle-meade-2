import React from 'react'

interface IssuuEmbedProps {
  className?: string
  src?: string
  title?: string
}

export default function IssuuEmbed({ className, src, title }: IssuuEmbedProps) {
  // Don't render if either src or title is missing
  if (!src || !title) {
    return null
  }
  
  return (
    <section id="issuu-embed" className={className ? `leasing-brochure ${className}` : 'leasing-brochure h-pad'}>
      <div className="inner-wrap">
        <iframe
          allow="clipboard-write"
          sandbox="allow-top-navigation allow-top-navigation-by-user-activation allow-downloads allow-scripts allow-same-origin allow-popups allow-modals allow-popups-to-escape-sandbox allow-forms"
          allowFullScreen={true}
          style={{
            position: 'absolute',
            border: 'none',
            width: '100%',
            height: '100%',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          }}
          src={src}
          title={title}
        />
      </div>
    </section>
  )
}