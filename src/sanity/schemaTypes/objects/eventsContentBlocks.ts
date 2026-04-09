import { defineType } from 'sanity'

export default defineType({
  name: 'eventsContentBlocks',
  title: 'Events Content Blocks',
  type: 'array',
  of: [
    {
      type: 'eventsBlock',
      title: 'Events Block',
    },
  ],
  options: {
    sortable: true,
  },
})
