import { defineField, defineType } from 'sanity'
import { CaseIcon } from '@sanity/icons'

export const brandCategoryType = defineType({
  name: 'brandCategory',
  title: 'Brand Category',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
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
        if (!file?.asset?._ref) return true

        try {
          const client = context.getClient({ apiVersion: '2025-05-08' })
          const asset = await client.fetch('*[_id == $id][0]{mimeType}', {id: file.asset._ref})
          if (asset?.mimeType !== 'image/svg+xml') {
            return 'Only SVG files are allowed for this icon field.'
          }
        } catch {
          // If we can't fetch the asset yet (e.g., during upload), skip validation
        }

        return true
      }),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'icon',
    },
  },
})
