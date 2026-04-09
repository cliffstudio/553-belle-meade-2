// /schemas/objects/richPortableText.ts
import { defineType } from 'sanity'
export default defineType({
  name: 'richPortableText',
  title: 'Rich Text',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [{ title: 'Normal', value: 'normal' }, { title: 'H2', value: 'h2' }, { title: 'H3', value: 'h3' }, { title: 'Quote', value: 'blockquote' }],
      lists: [{ title: 'Bulleted', value: 'bullet' }],
      marks: { 
        decorators: [{ title: 'Strong', value: 'strong' }, { title: 'Emphasis', value: 'em' }], 
        annotations: [
          {
            type: 'object',
            name: 'link',
            title: 'Link',
            fields: [
              {
                type: 'string',
                name: 'href',
                title: 'URL',
              },
              {
                type: 'boolean',
                name: 'blank',
                title: 'Open in new tab',
              },
            ],
          },
        ],
      },
    },
  ],
})
