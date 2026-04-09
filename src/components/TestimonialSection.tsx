'use client'

import React from 'react'

interface Testimonial {
  _id: string
  name: string
  source?: string
  backgroundColour?: string
}

interface TestimonialSectionProps {
  testimonial?: Testimonial
}

const TestimonialSection: React.FC<TestimonialSectionProps> = ({
  testimonial
}) => {
  if (!testimonial) {
    return null
  }

  const renderTestimonialCard = (testimonial: Testimonial) => (
    <>
      <div className="source cta-font">{testimonial.source}</div>
      <h2 className="quote">&ldquo;{testimonial.name}&rdquo;</h2>
    </>
  )

  return (
    <section className="testimonial-row" style={{ backgroundColor: testimonial.backgroundColour }}>
      <div className="row-lg h-pad">
        <div className="col-3-12_lg desktop"></div>

        <div className="col-6-12_lg out-of-opacity">
          {renderTestimonialCard(testimonial)}
        </div>

        <div className="col-3-12_lg desktop"></div>
      </div>
    </section>
  )
}

export default TestimonialSection
