// /schemas/sections/ctaBanner.ts
import { defineType, defineField } from 'sanity'
import { BoltIcon } from '@sanity/icons'

export default defineType({
  name: 'ctaBanner',
  title: 'CTA Banner',
  type: 'object',
  icon: BoltIcon,
  fields: [
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
