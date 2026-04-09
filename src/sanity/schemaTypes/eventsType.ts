import { defineType, defineField } from 'sanity'
import { BlockContentIcon, CalendarIcon } from '@sanity/icons'

export const eventsType = defineType({
  name: 'events',
  title: 'Events',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnailImage',
      title: 'Thumbnail Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Important for accessibility and SEO.',
        },
      ],
      validation: (Rule) => Rule.custom(async (file, context): Promise<true | string> => {
        if (!file?.asset?._ref) return true
        
        try {
          const client = context.getClient({ apiVersion: '2025-05-08' })
          await client.fetch('*[_id == $id][0]', { id: file.asset._ref })
        } catch {
          // If we can't fetch the asset yet (e.g., during upload), skip validation
        }
        return true
      }),
    }),
    defineField({
      name: 'eventStartDateTime',
      title: 'Start Date & Time',
      type: 'datetime',
      options: {
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eventEndDateTime',
      title: 'End Date & Time',
      type: 'datetime',
      options: {
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
      },
      validation: (Rule) =>
        Rule.required().custom((endDateTime, context): true | string => {
          const startDateTime = (context.document as { eventStartDateTime?: string })?.eventStartDateTime
          if (!endDateTime || !startDateTime) return true
          if (new Date(endDateTime).getTime() <= new Date(startDateTime).getTime()) {
            return 'End date/time must be after start date/time.'
          }
          return true
        }),
    }),
    defineField({
      name: 'eventLocation',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Important for accessibility and SEO.',
        },
      ],
      validation: (Rule) => Rule.custom(async (file, context): Promise<true | string> => {
        if (!file?.asset?._ref) return true
        
        try {
          const client = context.getClient({ apiVersion: '2025-05-08' })
          await client.fetch('*[_id == $id][0]', { id: file.asset._ref })
        } catch {
          // If we can't fetch the asset yet (e.g., during upload), skip validation
        }
        return true
      }),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'richPortableText',
    }),
    defineField({ 
      name: 'cta', 
      title: 'CTA',
      type: 'link' 
    }),
    defineField({ 
      name: 'details',
      title: 'Details',
      type: 'array',
      validation: (Rule) => Rule.max(5),
      of: [
        {
          type: 'object',
          name: 'detail',
          title: 'Detail',
          fields: [
            defineField({
              name: 'detailHeading',
              title: 'Heading',
              type: 'string'
            }),
            defineField({
              name: 'detailBody',
              title: 'Body',
              type: 'richPortableText'
            }),
          ],
          preview: {
            select: {
              title: 'detailHeading',
            },
            prepare(selection) {
              const { title } = selection
              return {
                title: title || 'Detail',
                media: BlockContentIcon,
              }
            }
          }
        }
      ]
    }),
    defineField({
      name: 'desktopLayout',
      title: 'Desktop Layout',
      type: 'string',
      initialValue: 'layout-1',
      options: { 
        list: [
          { title: 'Layout 1 (Portrait Image)', value: 'layout-1' },
          { title: 'Layout 2 (Landscape Image)', value: 'layout-2' },
        ]
      }
    }),
    defineField({
      name: 'mobileLayout',
      title: 'Mobile Layout',
      type: 'string',
      initialValue: 'layout-1',
      options: { 
        list: [
          { title: 'Layout 1 (Image at Top)', value: 'layout-1' },
          { title: 'Layout 2 (Image at Bottom)', value: 'layout-2' },
        ]
      }
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      description: 'Override title, description and image for search and social. Empty = use Site Settings.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      eventStartDateTime: 'eventStartDateTime',
      eventEndDateTime: 'eventEndDateTime',
      thumbnailImage: 'thumbnailImage',
      featuredImage: 'featuredImage',
    },
    prepare(selection) {
      const { title, eventStartDateTime, eventEndDateTime, thumbnailImage, featuredImage } = selection
      const start = eventStartDateTime ? new Date(eventStartDateTime).toLocaleString() : ''
      const end = eventEndDateTime ? new Date(eventEndDateTime).toLocaleString() : ''
      return {
        title,
        subtitle: `${start}${end ? ` - ${end}` : ''}`,
        media: thumbnailImage || featuredImage,
      }
    },
  },
  orderings: [
    {
      title: 'Event Start Date & Time, New',
      name: 'eventStartDateTimeDesc',
      by: [
        { field: 'eventStartDateTime', direction: 'desc' }
      ]
    },
    {
      title: 'Event Start Date & Time, Old',
      name: 'eventStartDateTimeAsc',
      by: [
        { field: 'eventStartDateTime', direction: 'asc' }
      ]
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [
        { field: 'title', direction: 'asc' }
      ]
    }
  ]
})
