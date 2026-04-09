// /schemas/objects/link.ts
import { defineType, defineField } from 'sanity'
import { LinkIcon, LaunchIcon } from '@sanity/icons'

export default defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  options: {
    collapsible: false,
    collapsed: false,
  },
  fields: [
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      initialValue: 'internal',
      options: { 
        list: ['internal', 'external', 'jump'] 
      }
    }),
    defineField({ 
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Optional: If left empty, the page title will be used for internal links',
      hidden: ({ parent }) => parent?.linkType === 'jump'
    }),
    defineField({ 
      name: 'href',
      title: 'Href',
      type: 'url',
      hidden: ({ parent }) => parent?.linkType !== 'external'
    }),
    defineField({
      name: 'pageLink',
      title: 'Page Link',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => parent?.linkType === 'external' || parent?.linkType === 'jump'
    }),
    defineField({
      name: 'jumpLink',
      title: 'Jump Link',
      type: 'string',
      description: 'The ID of the element to jump to eg. #spaces',
      hidden: ({ parent }) => parent?.linkType !== 'jump'
    }),
  ],
  preview: {
    select: {
      linkType: 'linkType',
      label: 'label',
      pageTitle: 'pageLink.title',
      href: 'href',
      jumpLink: 'jumpLink',
    },
    prepare({ linkType, label, pageTitle, href, jumpLink }) {
      const title =
        label?.trim() ||
        (linkType === 'internal' ? pageTitle : '') ||
        (linkType === 'external' ? href : '') ||
        (linkType === 'jump' ? jumpLink : '') ||
        'Untitled'

      const media = linkType === 'external' ? LaunchIcon : LinkIcon

      return {
        title,
        media,
      }
    },
  },
})
