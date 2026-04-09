// sections/simpleTextBlock.ts
import { defineType, defineField } from 'sanity'
export default defineType({
  name: 'simpleTextBlock',
  title: 'Text Block',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string'
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'richPortableText'
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: 'Text Block',
        subtitle: title || 'No title',
      }
    }
  }
})
