import { PortableText } from '@portabletext/react'
import { PortableTextBlock } from '../types/sanity'
import { portableTextComponents } from '../utils/portableTextComponents'

type TextBlockProps = {
  heading?: string
  body?: PortableTextBlock[]
}

export default function TextBlock({ heading, body }: TextBlockProps) {
  return (
    <section className="text-block h-pad">
      <div className="text-wrap max-width-big-text out-of-view">
        {heading && <h2 className="heading cta-font">{heading}</h2>}
        
        {body && <div className="h2"><PortableText value={body} components={portableTextComponents} /></div>}
      </div>
    </section>
  )
}
