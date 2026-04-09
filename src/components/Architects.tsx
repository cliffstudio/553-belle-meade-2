import { PortableText } from '@portabletext/react'
import { PortableTextBlock } from '../types/sanity'
import { portableTextComponents } from '../utils/portableTextComponents'
import { getLinkInfo } from '../utils/getLinkInfo'
import { getExternalLinkProps } from '../utils/getExternalLinkProps'
import type { CtaLink } from '../types/link'

type Architect = {
  name: string
  bio: PortableTextBlock[]
  cta: CtaLink
}

type ArchitectsProps = {
  heading?: string
  body?: PortableTextBlock[]
  architects?: Architect[]
}

export default function Architects({ heading, body, architects }: ArchitectsProps) {
  if (!architects || architects.length === 0) {
    return null
  }

  return (
    <section className="text-grid-block h-pad">
      <div className="inner-wrap row-lg">
        {heading && (
          <div className="col-4-12_lg out-of-view">
            <h2 className="heading">{heading}</h2>

            {body && (
              <div className="body">
                <PortableText value={body} components={portableTextComponents} />
              </div>
            )}
          </div>
        )}

        <div className="architects-grid col-8-12_lg">
          {architects.map((architect, index) => {
            const { text, href } = getLinkInfo(architect.cta)
            
            return (
              <div key={index} className="architect-item out-of-view">
                <div className="architect-content">
                  {architect.name && (
                    <h3 className="architect-name">{architect.name}</h3>
                  )}
                  {architect.bio && (
                    <div className="architect-bio">
                      <PortableText value={architect.bio} components={portableTextComponents} />
                    </div>
                  )}
                  {href && <div className="cta-font underline-link link">
                    <a href={href} {...getExternalLinkProps(architect.cta?.linkType)}>{text}</a>

                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
                      <path d="M1 1L13.5 13.5L0.999999 26"/>
                    </svg>
                  </div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
