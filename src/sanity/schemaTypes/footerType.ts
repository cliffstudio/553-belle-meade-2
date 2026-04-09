import { defineType, defineField } from 'sanity'
import { MenuIcon, TextIcon } from '@sanity/icons'

export const footerType = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Footer Title',
      type: 'string',
    }),
    defineField({
      name: 'column1',
      title: 'Column 1',
      type: 'array',
      of: [
        {
          type: 'object',
          icon: TextIcon,
          fields: [
            defineField({ 
              name: 'heading',
              type: 'string' 
            }),
            defineField({ 
              name: 'text', 
              type: 'richPortableText' 
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'column2',
      title: 'Column 2',
      type: 'array',
      of: [{ type: 'link' }],
    }),
    defineField({
      name: 'column3',
      title: 'Column 3',
      type: 'array',
      of: [{ type: 'link' }],
    }),
  ],
})
