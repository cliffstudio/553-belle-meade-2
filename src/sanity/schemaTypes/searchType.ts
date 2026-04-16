import { defineField } from 'sanity'
import { SearchIcon } from '@sanity/icons'

export const searchType = {
  name: 'search',
  title: 'Search',
  type: 'document',
  icon: SearchIcon,
  fields: [
    defineField({
      name: 'recommendations',
      title: 'Recommendations',
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
            defineField({ 
              name: 'image', 
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alt Text',
                  description: 'Important for accessibility and SEO.',
                },
              ],
              validation: (Rule) =>
                Rule.custom(async (file, context): Promise<true | string> => {
                if (!file?.asset?._ref) {
                  return true
                }
                
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
              name: 'caption', 
              title: 'Caption',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'pageLink.title',
              media: 'image',
            },
            prepare(selection) {
              const { title, media } = selection
              return {
                title: title || 'Untitled',
                media: media,
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Search',
        media: SearchIcon,
      }
    },
  },
}
