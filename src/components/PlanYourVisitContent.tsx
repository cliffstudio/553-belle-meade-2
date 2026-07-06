'use client'

import React from 'react'
import { PortableTextBlock, SanityImage } from '../types/sanity'
import PlanYourVisit from './PlanYourVisit'

interface PlanYourVisitDetailItem {
  _key?: string
  subtitle?: string
  body?: PortableTextBlock[]
}

interface PlanYourVisitDetail {
  _key?: string
  heading?: string
  items?: PlanYourVisitDetailItem[]
}

interface PlanYourVisitContentProps {
  title?: string
  heading?: string
  body?: PortableTextBlock[]
  details?: PlanYourVisitDetail[]
  images?: SanityImage[]
}

const PlanYourVisitContent: React.FC<PlanYourVisitContentProps> = ({
  title,
  heading,
  body,
  details,
  images,
}) => {
  return (
    <>
      <section className="hero-media-block layout-2 flex items-center justify-center text-white">
        <div className="inner-wrap h-pad out-of-view">
          {title && <h1>{title}</h1>}
        </div>
      </section>

      <PlanYourVisit
        planYourVisitHeading={heading}
        planYourVisitBody={body}
        planYourVisitDetails={details}
        planYourVisitImages={images}
        showMap
        sectionClassName="plan-your-visit-content"
      />
    </>
  )
}

export default PlanYourVisitContent
