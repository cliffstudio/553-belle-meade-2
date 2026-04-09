import { defineType, defineField } from 'sanity'
import { StarIcon } from '@sanity/icons'

export const testimonialsType = defineType({
  name: 'testimonials',
  title: 'Testimonials',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Testimonial',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
    }),
    defineField({
      name: 'backgroundColour',
      title: 'Background Colour',
      type: 'string',
      initialValue: '#E6D3C3',
      options: { 
        list: [
          { title: 'Burgundy', value: '#581B25' },
          { title: 'Tan', value: '#E6D3C3' },
          { title: 'Light Purple', value: '#E3DDE7' },
          { title: 'Green', value: '#C4C7B2' },
        ]
      }
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'source',
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title: title ? title.substring(0, 50) + (title.length > 50 ? '...' : '') : 'No testimonial',
        subtitle: subtitle || 'No source',
      }
    },
  },
})
