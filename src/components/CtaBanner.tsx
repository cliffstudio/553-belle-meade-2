// components/sections/CtaBanner.tsx
import { getLinkInfo } from '../utils/getLinkInfo'
import { getExternalLinkProps } from '../utils/getExternalLinkProps'
import type { CtaLink } from '../types/link'

type CtaBannerProps = {
  cta?: CtaLink
}

export default function CtaBanner({ cta }: CtaBannerProps) {
  const { text, href } = getLinkInfo(cta)
  
  if (!href) return null

  return (
    <section className="cta-banner-block">
      <div className="inner-wrap h-pad relative out-of-view">
        <div className="h2 link-text">{text}</div>

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 27">
          <path d="M1 1L13.5 13.5L0.999999 26"/>
        </svg>

        <a 
          href={href} 
          {...getExternalLinkProps(cta?.linkType)}
        ></a>
      </div>
    </section>
  )
}
