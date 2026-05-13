// sections/textBlock.ts
import { defineType, defineField } from 'sanity'
import { sectionAnchorIdField } from '../fields/sectionAnchorIdField'
import { TextIcon } from '@sanity/icons'
export default defineType({
  name: 'textBlock',
  title: 'Text Block',
  type: 'object',
  icon: TextIcon,
  fields: [
    sectionAnchorIdField,
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string'
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'richPortableText'
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Text Block'
      }
    }
  }
})
