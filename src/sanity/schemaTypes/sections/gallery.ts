// sections/gallery.ts
// @ts-nocheck
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'object',
  fields: [
    defineField({ 
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'imageWithCaption',
          title: 'Image',
          fields: [
            {
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              validation: (Rule) => Rule.custom(async (file: any, context) => {
                if (!file?.asset?._ref) {
                  return true;
                }
                
                try {
                  const client = context.getClient({ apiVersion: '2025-05-08' })
                  const asset = await client.fetch('*[_id == $id][0]', { id: file.asset._ref })
                } catch {
                  // If we can't fetch the asset yet (e.g., during upload), skip validation
                }
                
                return true;
              })
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string'
            },
            {
              name: 'imageSize',
              title: 'Image Size',
              type: 'string',
              options: {
                list: [
                  { title: '16:9 (Landscape)', value: '16:9' },
                  { title: '1:1 (Square)', value: '1:1' },
                  { title: '4:3 (Landscape)', value: '4:3' },
                  { title: '2:3 (Portrait)', value: '2:3' },
                  { title: 'Natural aspect ratio (Use for illustations only)', value: 'no-defined-size' },
                ]
              },
            },
          ],
          preview: {
            select: {
              title: 'image.asset.title',
              subtitle: 'image.asset.originalFilename',
              media: 'image'
            },
            prepare(selection) {
              const { title, subtitle, media } = selection
              return {
                title: title || subtitle || 'Untitled Image',
                subtitle: title && subtitle ? subtitle : null,
                media: media
              }
            }
          }
        }
      ]
    }),
  ],
})
