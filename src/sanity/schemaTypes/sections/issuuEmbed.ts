// sections/issuuEmbed.ts
import { defineType, defineField } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

export default defineType({
  name: 'issuuEmbed',
  title: 'Issuu Embed',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'src',
      title: 'Embed Source URL',
      type: 'url',
      description: 'IMPORTANT: Use the iframe embed URL (starts with https://e.issuu.com/embed.html), NOT the regular publication URL. To get this URL, click "Share" on the Issuu publication, then copy the "Embed" code and extract the src URL from the iframe tag.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The title attribute for the iframe',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Issuu Embed'
      }
    }
  }
})
