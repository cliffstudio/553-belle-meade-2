// /schemas/sections/ctaBanner.ts
import { defineType, defineField } from 'sanity'
import { sectionAnchorIdField } from '../fields/sectionAnchorIdField'
import { BoltIcon } from '@sanity/icons'

export default defineType({
  name: 'ctaBanner',
  title: 'CTA Banner',
  type: 'object',
  icon: BoltIcon,
  fields: [
    sectionAnchorIdField,
    defineField({
      name: 'cta',
      title: 'CTA',
      type: 'link'
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'CTA Banner',
      }
    }
  }
})
