// @ts-nocheck
// sections/stackedMediaText.ts
import { defineType, defineField } from 'sanity'
import { StackIcon } from '@sanity/icons'
export default defineType({
  name: 'stackedMediaText',
  title: 'Stacked Text & Media',
  type: 'object',
  icon: StackIcon,
  fields: [
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'layout-1',
      options: { 
        list: [
          { title: 'Layout 1 (Text Left, Media Right)', value: 'layout-1' },
          { title: 'Layout 2 (Media Top, Text Bottom)', value: 'layout-2' },
        ]
      }
    }),
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
      name: 'cta', 
      title: 'CTA',
      type: 'link'
    }),
    defineField({ 
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      initialValue: 'image',
      options: { list: ['image','video'] }
    }),
    defineField({
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
      validation: (Rule) => Rule.custom(async (file, context) => {
        if (!file?.asset?._ref) {
          return true;
        }
        
        try {
          const client = context.getClient({ apiVersion: '2025-05-08' })
          const asset = await client.fetch('*[_id == $id][0]', { id: file.asset._ref })
        } catch {
          // If we can't fetch the asset yet (e.g., during upload), skip validation
        }
        
        return true;
      }),
      hidden: ({ parent }) => parent?.mediaType !== 'image'
    }),
    defineField({
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
    }),
    defineField({ 
      name: 'video',
      title: 'Video File',
      type: 'file',
      description: 'Please upload .mp4 files',
      options: {
        accept: 'video/mp4'
      },
      validation: (Rule) => Rule.custom(async (file, context) => {
        if (!file?.asset?._ref) {
          return true;
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
        
        return true;
      }),
      hidden: ({ parent }) => parent?.mediaType !== 'video' || parent?.videoSource === 'url'
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'Enter a direct URL to a video file (e.g., https://example.com/video.mp4)',
      validation: (Rule) => Rule.uri({
        scheme: ['http', 'https']
      }),
      hidden: ({ parent }) => parent?.mediaType !== 'video' || parent?.videoSource !== 'url'
    }),
    defineField({
      name: 'videoPlaceholder',
      title: 'Video Placeholder',
      type: 'image',
      description: 'Uploading the first frame of the video here will ensure users always see content if the video doesn\'t load immediately. Upload image files',
      validation: (Rule) => Rule.custom(async (file, context) => {
        if (!file?.asset?._ref) {
          return true;
        }
        try {
          const client = context.getClient({ apiVersion: '2025-05-08' })
          const asset = await client.fetch('*[_id == $id][0]', { id: file.asset._ref })
        } catch {
        }
        return true;
      }),
      hidden: ({ parent }) => parent?.mediaType !== 'video'
    }),
    defineField({ 
      name: 'showControls',
      title: 'Show Video Controls',
      type: 'boolean',
      initialValue: false,
      hidden: ({ parent }) => parent?.mediaType !== 'video'
    }),
    defineField({
      name: 'backgroundColour',
      title: 'Background Colour',
      type: 'string',
      initialValue: 'None',
      options: {
        list: ['None', 'Lilac', 'Green', 'Tan']
      },
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Stacked Text & Media',
      }
    }
  }
})
