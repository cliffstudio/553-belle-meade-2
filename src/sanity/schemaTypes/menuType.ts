import { defineType, defineField } from 'sanity'
import { MenuIcon } from '@sanity/icons'

export const menuType = defineType({
  name: 'menu',
  title: 'Menu',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Menu Title',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Menu Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ 
              name: 'itemType', 
              title: 'Item Type', 
              type: 'string',
              options: {
                list: [
                  { title: 'Page Link', value: 'pageLink' },
                  { title: 'Title with Sub-items', value: 'titleWithSubItems' }
                ]
              },
            }),
            defineField({
              name: 'pageLink',
              type: 'reference',
              to: [{ type: 'page' }],
              hidden: ({ parent }) => parent?.itemType !== 'pageLink'
            }),
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              hidden: ({ parent }) => parent?.itemType !== 'titleWithSubItems'
            }),
            defineField({
              name: 'subItems',
              title: 'Sub-items',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'pageLink',
                      type: 'reference',
                      to: [{ type: 'page' }],
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'pageLink.title',
                    },
                    prepare(selection) {
                      const { title } = selection
                      return {
                        title: title || 'Untitled',
                      }
                    },
                  },
                },
              ],
              hidden: ({ parent }) => parent?.itemType !== 'titleWithSubItems'
            }),
          ],
          preview: {
            select: {
              title: 'pageLink.title',
              itemType: 'itemType',
              heading: 'heading',
            },
            prepare(selection) {
              const { title, itemType, heading } = selection
              if (itemType === 'pageLink') {
                return {
                  title: title || 'Untitled',
                }
              }
              if (itemType === 'titleWithSubItems') {
                return {
                  title: heading || 'Untitled',
                }
              }
              return {
                title: 'Untitled',
              }
            },
          },
        },
      ],
    }),
  ],
}) 