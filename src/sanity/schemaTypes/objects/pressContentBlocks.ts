import { defineType } from 'sanity'

export default defineType({
  name: 'pressContentBlocks',
  title: 'Press Content Blocks',
  type: 'array',
  of: [
    {
      type: 'pressPostsSection',
      title: 'Press Posts Section'
    },
    {
      type: 'testimonialSection',
      title: 'Testimonial Section'
    },
  ],
  options: {
    sortable: true,
  }
})
