import { defineField, ALL_FIELDS_GROUP } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const siteSettingsType = {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {
      ...ALL_FIELDS_GROUP,
      hidden: true,
    },
    {
      name: 'seo',
      title: 'SEO',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Site name in page titles (e.g. "Contact | Belle Meade Village"). Ignored if a page sets a custom SEO title.',
      group: 'seo',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Default description for search results and social shares.',
      group: 'seo',
    }),
    defineField({
      name: 'socialimage',
      title: 'Social Image',
      type: 'image',
      description: 'Default image for social link previews. 1200×630px.',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Important for accessibility and SEO.',
        },
      ],
      validation: (Rule) => Rule.custom(async (file, context): Promise<true | string> => {
        if (!file?.asset?._ref) return true
        
        try {
          const client = context.getClient({ apiVersion: '2025-05-08' })
          await client.fetch('*[_id == $id][0]', { id: file.asset._ref })
        } catch {
          // If we can't fetch the asset yet (e.g., during upload), skip validation
        }
        return true
      }),
      group: 'seo',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
        media: CogIcon,
      }
    },
  },
}
