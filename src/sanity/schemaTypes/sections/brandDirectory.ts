import { defineField, defineType } from 'sanity'
import { CaseIcon } from '@sanity/icons'

export default defineType({
  name: 'brandDirectory',
  title: 'Brand Directory',
  type: 'object',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'preselectedBrandCategory',
      title: 'Preselected Brand Category',
      description: 'Optional. Select a category to have it preselected when the block loads.',
      type: 'reference',
      to: [{ type: 'brandCategory' }],
      options: {
        filter:
          '_id in *[_type == "brandSettings" && (_id == "brandSettings" || _id == "drafts.brandSettings")][0].brandCategories[]._ref',
      },
    }),
  ],
  preview: {
    select: {
      categoryName: 'preselectedBrandCategory.name',
    },
    prepare({ categoryName }) {
      return {
        title: 'Brand Directory',
        subtitle: categoryName ? `Preselected: ${categoryName}` : 'No preselected category',
      }
    },
  },
})
