// sections/architects.ts
import { defineType, defineField } from 'sanity'
import { UsersIcon } from '@sanity/icons'

export default defineType({
  name: 'architects',
  title: 'Text Grid',
  type: 'object',
  icon: UsersIcon,
  fields: [
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
    defineField({ 
      name: 'architects',
      title: 'Text Block',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'architect',
          title: 'Text Block',
          fields: [
            {
              name: 'name',
              title: 'Name',
              type: 'string',
            },
            {
              name: 'bio',
              title: 'Bio',
              type: 'richPortableText'
            },
            { 
              name: 'cta',
              title: 'CTA',
              type: 'link'
            },
          ],
          preview: {
            select: {
              title: 'name'
            },
          }
        }
      ]
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Text Grid'
      }
    }
  }
})
