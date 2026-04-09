import { PortableText } from '@portabletext/react'
import { PortableTextBlock } from '../types/sanity'
import { portableTextComponents } from '../utils/portableTextComponents'

type SimpleTextBlockProps = {
  title?: string
  text?: PortableTextBlock[]
}

export default function SimpleTextBlock({ title, text }: SimpleTextBlockProps) {
  return (
    <section className="simple-text-block h-pad">
      <div className="text-wrap">
        {title && <h3 className="heading">{title}</h3>}

        {text && text.length > 0 && (
          <div className="text-content">
            <PortableText value={text} components={portableTextComponents} />
          </div>
        )}
      </div>
    </section>
  )
}
