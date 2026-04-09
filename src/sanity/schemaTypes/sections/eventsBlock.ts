// sections/eventsBlock.ts
import { defineType, defineField } from 'sanity'
import { CalendarIcon } from '@sanity/icons'

export default defineType({
  name: 'eventsBlock',
  title: 'Events Block',
  type: 'object',
  icon: CalendarIcon,
  fields: [
    defineField({ 
      name: 'subheading',
      title: 'Subheading',
      type: 'string'
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string'
    }),
    defineField({
      name: 'backgroundColour',
      title: 'Background Colour',
      type: 'string',
      initialValue: 'none',
      options: { 
        list: [
          { title: 'None', value: 'none' },
          { title: 'Light Purple', value: 'light-purple' },
          { title: 'Tan', value: 'tan' },
          { title: 'Green', value: 'green' },
        ]
      }
    }),
    defineField({
      name: 'gridLayout',
      title: 'Grid Layout',
      type: 'string',
      initialValue: 'columns-2',
      options: { 
        list: [
          { title: '2 columns', value: 'columns-2' },
          { title: '3 columns', value: 'columns-3' },
          { title: '4 columns', value: 'columns-4' },
        ]
      }
    }),
    defineField({
      name: 'events',
      title: 'Events',
      type: 'string',
      initialValue: 'this-week',
      options: { 
        list: [
          { title: 'This Week', value: 'this-week' },
          { title: 'This Month', value: 'this-month' },
          { title: 'Custom', value: 'custom' },
        ]
      }
    }),
    defineField({
      name: 'customEvents',
      title: 'Custom Events',
      type: 'array',
      hidden: ({ parent }) => parent?.events !== 'custom',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const selection = (context.parent as { events?: string } | undefined)?.events
          if (selection === 'custom' && (!value || value.length === 0)) {
            return 'Select at least one event when "Custom" is selected.'
          }
          return true
        }),
      of: [
        defineField({
          name: 'event',
          title: 'Event',
          type: 'reference',
          to: [{ type: 'events' }],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'heading',
    },
    prepare({ title }) {
      return {
        title: 'Events Block',
        subtitle: title || 'No title',
      }
    }
  }
})
