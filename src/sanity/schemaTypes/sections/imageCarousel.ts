// sections/imageCarousel.ts
// @ts-nocheck
import { defineType, defineField } from 'sanity'

/** Value passed to Rule.custom for Sanity image fields */
interface ImageFieldValue {
  asset?: { _ref?: string }
}

/** Context passed to Rule.custom in Sanity */
interface CustomValidationContext {
  getClient: (options: { apiVersion: string }) => { fetch: (query: string, params: Record<string, unknown>) => Promise<{ size?: number } | null> }
}

export default defineType({
  name: 'imageCarousel',
  title: 'Image Carousel',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string'
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'richPortableText'
    }),
    defineField({ 
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'imageWithCaption',
          title: 'Image or Video',
          fields: [
            {
              name: 'mediaType',
              title: 'Media Type',
              type: 'string',
              initialValue: 'image',
              options: {
                list: [
                  { title: 'Image', value: 'image' },
                  { title: 'Video', value: 'video' }
                ]
              }
            },
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alt Text',
                  description: 'Important for accessibility and SEO.',
                },
              ],
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              validation: (Rule) => Rule.custom(async (file: any, context) => {
                if (!file?.asset?._ref) {
                  return true as const;
                }
                
                try {
                  const client = context.getClient({ apiVersion: '2025-05-08' })
                  const asset = await client.fetch('*[_id == $id][0]', { id: file.asset._ref })
                } catch {
                  // If we can't fetch the asset yet (e.g., during upload), skip validation
                }
                
                return true as const;
              }),
              hidden: ({ parent }) => parent?.mediaType !== 'image'
            },
            {
              name: 'videoSource',
              title: 'Video Source',
              type: 'string',
              initialValue: 'file',
              options: { 
                list: [
                  { title: 'Upload File', value: 'file' },
                  { title: 'Video URL', value: 'url' }
                ]
              },
              hidden: ({ parent }) => parent?.mediaType !== 'video'
            },
            {
              name: 'video',
              title: 'Video File',
              type: 'file',
              description: 'Please upload .mp4 files',
              options: { 
                accept: 'video/mp4' 
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              validation: (Rule) => Rule.custom(async (file: any, context) => {
                if (!file?.asset?._ref) {
                  return true as const;
                }
                
                try {
                  const client = context.getClient({ apiVersion: '2025-05-08' })
                  const asset = await client.fetch('*[_id == $id][0]', { id: file.asset._ref })

                  const filename = asset?.originalFilename || '';
                  if (filename && !filename.toLowerCase().endsWith('.mp4')) {
                    return 'Only .mp4 files are allowed';
                  }
                } catch {
                  // If we can't fetch the asset yet (e.g., during upload), skip validation
                }
                
                return true as const;
              }),
              hidden: ({ parent }) => parent?.mediaType !== 'video' || parent?.videoSource === 'url'
            },
            {
              name: 'videoUrl',
              title: 'Video URL',
              type: 'url',
              description: 'Enter a direct URL to a video file (e.g., https://example.com/video.mp4)',
              validation: (Rule) => Rule.uri({
                scheme: ['http', 'https']
              }),
              hidden: ({ parent }) => parent?.mediaType !== 'video' || parent?.videoSource !== 'url'
            },
            {
              name: 'videoPlaceholder',
              title: 'Video Placeholder',
              type: 'image',
              description: 'Uploading the first frame of the video here will ensure users always see content if the video doesn\'t load immediately. Upload image files',
              validation: (Rule) => Rule.custom(async (file: ImageFieldValue, context: CustomValidationContext) => {
                if (!file?.asset?._ref) {
                  return true as const;
                }
                try {
                  const client = context.getClient({ apiVersion: '2025-05-08' })
                  const asset = await client.fetch('*[_id == $id][0]', { id: file.asset._ref })
                } catch {
                }
                return true as const;
              }),
              hidden: ({ parent }) => parent?.mediaType !== 'video'
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string'
            },
            {
              name: 'imageSize',
              title: 'Image Size',
              type: 'string',
              options: {
                list: [
                  { title: '16:9 (Landscape)', value: '16:9' },
                  { title: '1:1 (Square)', value: '1:1' },
                  { title: '4:3 (Landscape)', value: '4:3' },
                  { title: '2:3 (Portrait)', value: '2:3' },
                ]
              },
              hidden: ({ parent }) => parent?.mediaType !== 'image'
            },
          ],
          preview: {
            select: {
              mediaType: 'mediaType',
              title: 'image.asset.title',
              subtitle: 'image.asset.originalFilename',
              videoTitle: 'video.asset.originalFilename',
              media: 'image'
            },
            prepare(selection) {
              const { mediaType, title, subtitle, videoTitle, media } = selection
              if (mediaType === 'video') {
                return {
                  title: videoTitle || 'Untitled Video',
                  subtitle: 'Video',
                  media: media
                }
              }
              return {
                title: title || subtitle || 'Untitled Image',
                subtitle: title && subtitle ? subtitle : null,
                media: media
              }
            }
          }
        }
      ]
    }),
  ],
})
