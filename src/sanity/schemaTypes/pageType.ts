import { defineType, defineField } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnailImage',
      title: 'Thumbnail Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Important for accessibility and SEO.',
        },
      ],
      validation: (Rule) => Rule.custom(async (file, context): Promise<true | string> => {
        if (!file?.asset?._ref) return true
        
        try {
          const client = context.getClient({ apiVersion: '2025-05-08' })
          await client.fetch('*[_id == $id][0]', { id: file.asset._ref })
        } catch {
          // If we can't fetch the asset yet (e.g., during upload), skip validation
        }
        return true
      }),
    }),
    defineField({
      name: 'pageType',
      type: 'string',
      options: {
        list: [
          { title: 'Sign In', value: 'sign-in' },
          { title: 'Heritage', value: 'heritage' },
          { title: 'Carousel', value: 'carousel' },
          { title: 'Gallery', value: 'gallery' },
          { title: 'Press', value: 'press' },
          { title: 'Events', value: 'events' },
          { title: 'Text', value: 'text' },
          { title: 'Plan Your Visit', value: 'plan-your-visit' },
          { title: 'General', value: 'general' },
        ],
      },
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      description: 'Override title, description and image for search and social. Empty = use Site Settings.',
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'flexibleContent',
      description: 'Add and arrange content blocks to build your page',
      hidden: ({ document }) => {
        // Only show for general pages or pages without a specific pageType
        const pageType = document?.pageType
        return !!(pageType && pageType !== 'general')
      },
    }),
    
    // Sign In specific fields
    defineField({
      name: 'signInPageEnabled',
      title: 'Enable Sign In page',
      type: 'boolean',
      initialValue: false,
      hidden: ({ document }) => document?.pageType !== 'sign-in',
    }),
    defineField({
      name: 'signInHero',
      title: 'Hero',
      type: 'signInHeroMedia',
      hidden: ({ document }) => document?.pageType !== 'sign-in',
    }),
    
    // Heritage specific fields
    defineField({
      name: 'heritageTextWithArtefacts',
      title: 'Text with Artefacts',
      type: 'textWithArtefacts',
      hidden: ({ document }) => document?.pageType !== 'heritage',
    }),
    defineField({
      name: 'heritageFullWidthMedia',
      title: 'Full Width Media',
      type: 'fullWidthMedia',
      hidden: ({ document }) => document?.pageType !== 'heritage',
    }),
    defineField({
      name: 'heritageTextWithArtefacts2',
      title: 'Text with Artefacts 2',
      type: 'textWithArtefacts',
      hidden: ({ document }) => document?.pageType !== 'heritage',
    }),
    defineField({
      name: 'heritageImageCarousel',
      title: 'Image Carousel',
      type: 'imageCarousel',
      hidden: ({ document }) => document?.pageType !== 'heritage',
    }),
    defineField({
      name: 'heritageCta',
      title: 'CTA Banner',
      type: 'ctaBanner',
      hidden: ({ document }) => document?.pageType !== 'heritage',
    }),

    // Carousel specific fields
    defineField({
      name: 'carouselTextWithArtefacts',
      title: 'Text with Artefacts',
      type: 'textWithArtefacts',
      hidden: ({ document }) => document?.pageType !== 'carousel',
    }),
    defineField({
      name: 'carouselFullWidthMedia',
      title: 'Full Width Media',
      type: 'fullWidthMedia',
      hidden: ({ document }) => document?.pageType !== 'carousel',
    }),
    defineField({
      name: 'carouselImageMasonry',
      title: 'Image Masonry',
      type: 'imageMasonry',
      hidden: ({ document }) => document?.pageType !== 'carousel',
    }),
    defineField({
      name: 'carouselCta',
      title: 'CTA Banner',
      type: 'ctaBanner',
      hidden: ({ document }) => document?.pageType !== 'carousel',
    }),

    // Gallery specific fields
    defineField({
      name: 'galleryImages',
      title: 'Images',
      type: 'gallery',
      hidden: ({ document }) => document?.pageType !== 'gallery',
    }),
    defineField({
      name: 'galleryCta',
      title: 'CTA Banner',
      type: 'ctaBanner',
      hidden: ({ document }) => document?.pageType !== 'gallery',
    }),

    // Press specific fields
    defineField({
      name: 'pressHero',
      title: 'Hero',
      type: 'heroMedia',
      hidden: ({ document }) => document?.pageType !== 'press',
    }),
    defineField({
      name: 'pressContentBlocks',
      title: 'Press Content Blocks',
      type: 'pressContentBlocks',
      description: 'Add and arrange press posts and testimonials',
      hidden: ({ document }) => document?.pageType !== 'press',
    }),
    defineField({
      name: 'pressCta',
      title: 'CTA Banner',
      type: 'ctaBanner',
      hidden: () => true, // CTA banner removed from press pages
    }),

    // Events specific fields
    defineField({
      name: 'eventsContentBlocks',
      title: 'Events Content Blocks',
      type: 'eventsContentBlocks',
      description: 'Add and arrange events sections',
      hidden: ({ document }) => document?.pageType !== 'events',
    }),

    // Text specific fields
    defineField({
      name: 'textHero',
      title: 'Hero',
      type: 'flexibleHeroSection',
      hidden: ({ document }) => document?.pageType !== 'text',
    }),
    defineField({
      name: 'textBlocks',
      title: 'Text Blocks',
      type: 'array',
      of: [{ type: 'simpleTextBlock' }],
      hidden: ({ document }) => document?.pageType !== 'text',
    }),

    // Plan Your Visit specific fields
    defineField({
      name: 'planYourVisitHeading',
      title: 'Heading',
      type: 'string',
      hidden: ({ document }) => document?.pageType !== 'plan-your-visit',
    }),
    defineField({
      name: 'planYourVisitBody',
      title: 'Body',
      type: 'richPortableText',
      hidden: ({ document }) => document?.pageType !== 'plan-your-visit',
    }),
    defineField({
      name: 'planYourVisitDetails',
      title: 'Details',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
            }),
            defineField({
              name: 'items',
              title: 'Items',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'subtitle',
                      title: 'Subtitle',
                      type: 'string',
                    }),
                    defineField({
                      name: 'body',
                      title: 'Body',
                      type: 'richPortableText',
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'subtitle',
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: {
              title: 'heading',
            },
          },
        },
      ],
      hidden: ({ document }) => document?.pageType !== 'plan-your-visit',
    }),
    defineField({
      name: 'planYourVisitImages',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image' }],
      hidden: ({ document }) => document?.pageType !== 'plan-your-visit',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
