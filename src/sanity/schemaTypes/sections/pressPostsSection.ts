import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'pressPostsSection',
  title: 'Press Posts Section',
  type: 'object',
  fields: [
    defineField({
      name: 'post1',
      title: 'Press Post 1',
      type: 'reference',
      to: [{ type: 'press' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'post2',
      title: 'Press Post 2',
      type: 'reference',
      to: [{ type: 'press' }],
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'layout-1',
      options: {
        list: [
          { title: 'Layout 1 (4 cols + 2 spacer + 6 cols)', value: 'layout-1' },
          { title: 'Layout 2 (5 cols + 2 spacer + 5 cols)', value: 'layout-2' },
          // { title: 'Layout 3 (5 cols + 1 spacer + 6 cols)', value: 'layout-3' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      post1Title: 'post1.title',
      post2Title: 'post2.title',
      layout: 'layout',
    },
    prepare({ post1Title, post2Title, layout }) {
      const layoutNames: Record<string, string> = {
        'layout-1': 'Layout 1',
        'layout-2': 'Layout 2',
        // 'layout-3': 'Layout 3',
      }
      return {
        title: 'Press Posts Section',
        subtitle: `${post1Title || 'No post 1'} & ${post2Title || 'No post 2'} • ${layoutNames[layout] || layout}`,
      }
    },
  },
})
