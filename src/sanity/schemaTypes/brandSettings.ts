import { defineField } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const brandSettingsType = {
  name: 'brandSettings',
  title: 'Brand Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({ 
      name: 'brandCategories',
      title: 'Brand Categories',
      description:
        'Add categories used by Brands. Use "Create new" to add a category and upload its SVG icon.',
      type: 'array',
      validation: (Rule) => Rule.unique(),
      of: [
        {
          type: 'reference',
          to: [{ type: 'brandCategory' }],
          options: {
            disableNew: false,
          },
        }
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Brand Settings',
        media: CogIcon,
      }
    },
  },
}
