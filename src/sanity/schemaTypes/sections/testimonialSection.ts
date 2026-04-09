import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'testimonialSection',
  title: 'Testimonial Section',
  type: 'object',
  fields: [
    defineField({
      name: 'testimonial',
      title: 'Testimonial',
      type: 'reference',
      to: [{ type: 'testimonials' }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      testimonialName: 'testimonial.name',
      testimonialSource: 'testimonial.source',
    },
    prepare({ testimonialName, testimonialSource }) {
      const preview = testimonialName 
        ? testimonialName.substring(0, 50) + (testimonialName.length > 50 ? '...' : '')
        : 'No testimonial'
      return {
        title: 'Testimonial Section',
        subtitle: `${preview}${testimonialSource ? ` • ${testimonialSource}` : ''}`,
      }
    },
  },
})
