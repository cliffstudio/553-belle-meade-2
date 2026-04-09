import { defineType, defineField, defineArrayMember } from 'sanity'
import { TextIcon, EnvelopeIcon, ChevronDownIcon, BlockContentIcon } from '@sanity/icons'

export default defineType({
	type: 'object',
	title: 'Form',
	name: 'form',
	icon: EnvelopeIcon,
	fields: [
		defineField({
			type: 'string',
			title: 'Title',
			name: 'title',
		}),
		defineField({
			type: 'richPortableText',
			title: 'Introduction',
			name: 'introduction',
		}),
		defineField({
			type: 'array',
			title: 'Form Fields',
			name: 'formFields',
			of: [
				defineArrayMember({
					type: 'object',
					title: 'Text',
					name: 'textInput',
					fields: [
						defineField({
							type: 'string',
							title: 'Label',
							name: 'label',
							// validation: Rule => Rule.required()
						}),
						defineField({
							type: 'boolean',
							title: 'Required',
							name: 'required',
						}),
            defineField({
              type: 'boolean',
              title: 'Half Width',
              name: 'halfWidth',
              initialValue: false,
            }),
					],
					preview: {
						select: {
							label: 'label',
							required: 'required',
						},
						prepare(selection) {
							const { label, required } = selection
							return {
								title: label,
								subtitle: required ? 'Required' : '',
								media: TextIcon
							}
						}
					}
				}),
				defineArrayMember({
					type: 'object',
					title: 'Email',
					name: 'emailInput',
					fields: [
						defineField({
							type: 'string',
							title: 'Label',
							name: 'label',
							// validation: Rule => Rule.required()
						}),
						defineField({
							type: 'boolean',
							title: 'Required',
							name: 'required',
						}),
            defineField({
              type: 'boolean',
              title: 'Half Width',
              name: 'halfWidth',
              initialValue: false,
            }),
					],
					preview: {
						select: {
							label: 'label',
							required: 'required',
						},
						prepare(selection) {
							const { label, required } = selection
							return {
								title: label,
								subtitle: required ? 'Required' : '',
								media: EnvelopeIcon
							}
						}
					}
				}),
				defineArrayMember({
					type: 'object',
					title: 'Textarea',
					name: 'textarea',
					fields: [
						defineField({
							type: 'string',
							title: 'Label',
							name: 'label',
							// validation: Rule => Rule.required()
						}),
						defineField({
							type: 'boolean',
							title: 'Required',
							name: 'required',
						}),
					],
					preview: {
						select: {
							label: 'label',
							required: 'required',
						},
						prepare(selection) {
							const { label, required } = selection
							return {
								title: label,
								subtitle: required ? 'Required' : '',
								media: BlockContentIcon
							}
						}
					}
				}),
				defineArrayMember({
					type: 'object',
					title: 'Dropdown',
					name: 'select',
					fields: [
						defineField({
							type: 'string',
							title: 'Label',
							name: 'label',
							// validation: Rule => Rule.required()
						}),
						defineField({
							type: 'array',
							title: 'Options',
							name: 'options',
							of: [
								defineArrayMember({
									type: 'string',
									title: 'Option',
									name: 'option',
									// validation: Rule => Rule.required()
								}),
							],
						}),
						defineField({
							type: 'boolean',
							title: 'Required',
							name: 'required',
						}),
            defineField({
              type: 'boolean',
              title: 'Half Width',
              name: 'halfWidth',
              initialValue: false,
            }),
					],
					preview: {
						select: {
							label: 'label',
							required: 'required',
						},
						prepare(selection) {
							const { label, required } = selection
							return {
								title: label,
								subtitle: required ? 'Required' : '',
								media: ChevronDownIcon
							}
						}
					}
				}),
			]
		}),
		defineField({
			type: 'string',
			title: 'Submit button label',
			name: 'submitLabel',
			initialValue: 'Submit',
		}),
		defineField({
			type: 'text',
			title: 'Success message',
			name: 'successMessage',
			rows: 2,
			initialValue: `Thank you for getting in touch!`,
		}),
		defineField({
			type: 'string',
			title: 'Admin Notification Email',
			name: 'adminNotificationEmail',
			description: 'Email address that receives form submissions',
			initialValue: 'info@bmvillage.com',
		}),
	],
  preview: {
    prepare() {
      return {
        title: 'Form',
      }
    }
  }
})