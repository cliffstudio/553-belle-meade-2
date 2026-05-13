import { defineField, defineType } from 'sanity'
import { sectionAnchorIdField } from '../fields/sectionAnchorIdField'
import type { FlexibleContentArrayRule } from '../utils/flexibleContentArrayRule'
import { CaseIcon } from '@sanity/icons'

export default defineType({
  name: 'brandDirectory',
  title: 'Brand Directory',
  type: 'object',
  icon: CaseIcon,
  fields: [
    sectionAnchorIdField,
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

/** Use on the `flexibleContent` array — at most one Brand Directory block per page. */
export const flexibleContentAtMostOneBrandDirectoryValidation = (
  Rule: FlexibleContentArrayRule,
) =>
  Rule.custom((modules) => {
    if (!modules || !Array.isArray(modules)) return true

    const count = modules.filter(
      (item) => (item as { _type?: string })._type === 'brandDirectory',
    ).length

    if (count > 1) {
      return 'Brand Directory can only be added once per page'
    }

    return true
  })
