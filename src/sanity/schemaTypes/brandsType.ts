import { defineType, defineField, ALL_FIELDS_GROUP } from 'sanity'
import { BlockContentIcon, CaseIcon } from '@sanity/icons'

export const brandsType = defineType({
  name: 'brands',
  title: 'Brands',
  type: 'document',
  icon: CaseIcon,
  groups: [
    {
      ...ALL_FIELDS_GROUP,
      hidden: true,
    },
    {
      name: 'thumbnail',
      title: 'Thumbnail',
    },
    {
      name: 'pageContent',
      title: 'Page Content',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'thumbnail',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
      group: 'thumbnail',
    }),
    defineField({
      name: 'brandCategory',
      title: 'Brand Category',
      type: 'reference',
      to: [{ type: 'brandCategory' }],
      options: {
        filter:
          '_id in *[_type == "brandSettings" && (_id == "brandSettings" || _id == "drafts.brandSettings")][0].brandCategories[]._ref',
      },
      validation: (Rule) => Rule.required(),
      group: 'thumbnail',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'string',
      group: 'thumbnail',
    }),
    defineField({
      name: 'thumbnailImage',
      title: 'Thumbnail Image',
      type: 'image',
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
      group: 'thumbnail',
    }),
    defineField({
      name: 'openingHours',
      title: 'Opening Hours',
      type: 'richPortableText',
      group: 'thumbnail',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'richPortableText',
      group: 'thumbnail',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
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
      group: 'pageContent',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'richPortableText',
      group: 'pageContent',
    }),
    defineField({ 
      name: 'details',
      title: 'Details',
      type: 'array',
      description: 'Additional details about the brand. Opening hours and address are automatically added to this list.',
      validation: (Rule) => Rule.max(5),
      of: [
        {
          type: 'object',
          name: 'detail',
          title: 'Detail',
          fields: [
            defineField({
              name: 'detailHeading',
              title: 'Heading',
              type: 'string'
            }),
            defineField({
              name: 'detailBody',
              title: 'Body',
              type: 'richPortableText'
            }),
          ],
          preview: {
            select: {
              title: 'detailHeading',
            },
            prepare(selection) {
              const { title } = selection
              return {
                title: title || 'Detail',
                media: BlockContentIcon,
              }
            }
          }
        }
      ],
      group: 'pageContent',
    }),
    defineField({
      name: 'locationImage',
      title: 'Location Image',
      type: 'image',
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
      group: 'pageContent',
    }),
    defineField({
      name: 'desktopLayout',
      title: 'Desktop Layout',
      type: 'string',
      initialValue: 'layout-1',
      options: { 
        list: [
          { title: 'Layout 1 (Portrait Image)', value: 'layout-1' },
          { title: 'Layout 2 (Landscape Image)', value: 'layout-2' },
        ]
      },
      group: 'pageContent',
    }),
    defineField({
      name: 'mobileLayout',
      title: 'Mobile Layout',
      type: 'string',
      initialValue: 'layout-1',
      options: { 
        list: [
          { title: 'Layout 1 (Image at Top)', value: 'layout-1' },
          { title: 'Layout 2 (Image at Bottom)', value: 'layout-2' },
        ]
      },
      group: 'pageContent',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      description: 'Override title, description and image for search and social. Empty = use Site Settings.',
      group: 'pageContent',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      thumbnailImage: 'thumbnailImage',
      featuredImage: 'featuredImage',
    },
    prepare(selection) {
      const { title, thumbnailImage, featuredImage } = selection
      return {
        title,
        media: thumbnailImage || featuredImage,
      }
    },
  },
  orderings: [
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [
        { field: 'title', direction: 'asc' }
      ]
    },
    {
      title: 'Title Z-A',
      name: 'titleDesc',
      by: [
        { field: 'title', direction: 'desc' }
      ]
    }
  ]
})
