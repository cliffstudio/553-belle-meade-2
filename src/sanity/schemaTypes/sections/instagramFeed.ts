// sections/instagramFeed.ts
import { defineType, defineField } from 'sanity'
import { HashIcon } from '@sanity/icons'

export default defineType({
  name: 'instagramFeed',
  title: 'Instagram Feed',
  type: 'object',
  icon: HashIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string'
    }),
    defineField({ 
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          title: 'Detail',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'image',
              description: 'Only SVG files are allowed for this icon field.',
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alt Text',
                  description: 'Important for accessibility and SEO.',
                },
              ],
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              validation: (Rule) => Rule.custom(async (file: any, context) => {
                if (!file?.asset?._ref) {
                  return true as const;
                }
                
                try {
                  const client = context.getClient({ apiVersion: '2025-05-08' })
                  const asset = await client.fetch('*[_id == $id][0]{mimeType}', { id: file.asset._ref })
                  if (asset?.mimeType !== 'image/svg+xml') {
                    return 'Only SVG files are allowed for this icon field.'
                  }
                } catch {
                  // If we can't fetch the asset yet (e.g., during upload), skip validation
                }
                
                return true as const;
              }),
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'url'
            }),
          ],
          preview: {
            select: {
              title: 'link',
              image: 'icon',
            },
            prepare(selection) {
              const { title, image } = selection
              return {
                title: title || 'Social Link',
                media: image,
              }
            }
          }
        }
      ]
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: 'Instagram Feed',
        subtitle: title || 'No title',
      }
    }
  }
})
