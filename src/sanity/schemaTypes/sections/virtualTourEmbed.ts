import { defineField, defineType } from 'sanity'
import { VideoIcon } from '@sanity/icons'
import { sectionAnchorIdField } from '../fields/sectionAnchorIdField'
import type { FlexibleContentArrayRule } from '../utils/flexibleContentArrayRule'

export default defineType({
  name: 'virtualTourEmbed',
  title: 'Virtual Tour',
  type: 'object',
  icon: VideoIcon,
  fields: [
    sectionAnchorIdField,
    defineField({
      name: 'internalNote',
      title: 'Internal Note',
      type: 'string',
      hidden: true,
      initialValue: 'virtual-tour-embed',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Virtual Tour',
      }
    }
  }
})

/** Use on the `flexibleContent` array — at most one Virtual Tour block per page. */
export const flexibleContentAtMostOneVirtualTourEmbedValidation = (
  Rule: FlexibleContentArrayRule,
) =>
  Rule.custom((modules) => {
    if (!modules || !Array.isArray(modules)) return true

    const count = modules.filter(
      (item) => (item as { _type?: string })._type === 'virtualTourEmbed',
    ).length

    if (count > 1) {
      return 'Virtual Tour can only be added once per page'
    }

    return true
  })
