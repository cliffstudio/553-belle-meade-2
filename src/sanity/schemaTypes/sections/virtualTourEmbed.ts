import { defineField, defineType } from 'sanity'
import { VideoIcon } from '@sanity/icons'

export default defineType({
  name: 'virtualTourEmbed',
  title: 'Virtual Tour',
  type: 'object',
  icon: VideoIcon,
  fields: [
    defineField({
      name: 'internalNote',
      title: 'Internal Note',
      type: 'string',
      hidden: true,
      initialValue: 'virtual-tour-embed',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Virtual Tour',
      }
    }
  }
})
