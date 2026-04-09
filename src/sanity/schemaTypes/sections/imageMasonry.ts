// @ts-nocheck
// imageMasonry.ts
import { defineType, defineField } from 'sanity'
import { ThLargeIcon } from '@sanity/icons'
export default defineType({
  name: 'imageMasonry',
  title: 'Image Masonry',
  type: 'object',
  icon: ThLargeIcon,
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
      name: 'cta',
      title: 'CTA',
      type: 'link'
    }),
    defineField({
      name: 'layout',
      title: 'Image Layout',
      type: 'string',
      initialValue: 'layout-1',
      options: {
        list: [
          { title: 'Layout 1 (3 cols + 2 spacer + 7 cols)', value: 'layout-1' },
          { title: 'Layout 2 (1 spacer + 4 cols + 2 spacer + 5 cols)', value: 'layout-2' },
          { title: 'Layout 3 (4 cols + 2 spacer + 6 cols)', value: 'layout-3' }
        ]
      }
    }),
    defineField({ 
      name: 'mediaType1', 
      title: 'Media Type',
      type: 'string', 
      initialValue: 'image',
      options: { list: ['image','video'] },
      fieldset: 'media1'
    }),
    defineField({ 
      name: 'image1', 
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
      hidden: ({ parent }) => parent?.mediaType1 !== 'image',
      fieldset: 'media1'
    }),
    defineField({
      name: 'videoSource1',
      title: 'Video Source',
      type: 'string',
      initialValue: 'file',
      options: { 
        list: [
          { title: 'Upload File', value: 'file' },
          { title: 'Video URL', value: 'url' }
        ]
      },
      hidden: ({ parent }) => parent?.mediaType1 !== 'video',
      fieldset: 'media1'
    }),
    defineField({ 
      name: 'video1', 
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
      hidden: ({ parent }) => parent?.mediaType1 !== 'video' || parent?.videoSource1 === 'url',
      fieldset: 'media1'
    }),
    defineField({
      name: 'videoUrl1',
      title: 'Video URL',
      type: 'url',
      description: 'Enter a direct URL to a video file (e.g., https://example.com/video.mp4)',
      validation: (Rule) => Rule.uri({
        scheme: ['http', 'https']
      }),
      hidden: ({ parent }) => parent?.mediaType1 !== 'video' || parent?.videoSource1 !== 'url',
      fieldset: 'media1'
    }),
    defineField({
      name: 'videoPlaceholder1',
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
      hidden: ({ parent }) => parent?.mediaType1 !== 'video',
      fieldset: 'media1'
    }),
    defineField({ 
      name: 'mediaType2',
      title: 'Media Type',
      type: 'string', 
      initialValue: 'image',
      options: { list: ['image','video'] },
      fieldset: 'media2'
    }),
    defineField({ 
      name: 'image2', 
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
      hidden: ({ parent }) => parent?.mediaType2 !== 'image',
      fieldset: 'media2'
    }),
    defineField({
      name: 'videoSource2',
      title: 'Video Source',
      type: 'string',
      initialValue: 'file',
      options: { 
        list: [
          { title: 'Upload File', value: 'file' },
          { title: 'Video URL', value: 'url' }
        ]
      },
      hidden: ({ parent }) => parent?.mediaType2 !== 'video',
      fieldset: 'media2'
    }),
    defineField({ 
      name: 'video2', 
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
      hidden: ({ parent }) => parent?.mediaType2 !== 'video' || parent?.videoSource2 === 'url',
      fieldset: 'media2'
    }),
    defineField({
      name: 'videoUrl2',
      title: 'Video URL',
      type: 'url',
      description: 'Enter a direct URL to a video file (e.g., https://example.com/video.mp4)',
      validation: (Rule) => Rule.uri({
        scheme: ['http', 'https']
      }),
      hidden: ({ parent }) => parent?.mediaType2 !== 'video' || parent?.videoSource2 !== 'url',
      fieldset: 'media2'
    }),
    defineField({
      name: 'videoPlaceholder2',
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
      hidden: ({ parent }) => parent?.mediaType2 !== 'video',
      fieldset: 'media2'
    }),
    defineField({
      name: 'backgroundColour',
      title: 'Background Colour',
      type: 'string',
      initialValue: 'None',
      options: {
        list: ['None', 'Lilac', 'Green', 'Tan']
      },
      hidden: ({ parent }) => parent?.layout !== 'layout-1',
    }),
  ],
  fieldsets: [
    {
      name: 'media1',
      title: 'Media 1',
    },
    {
      name: 'media2',
      title: 'Media 2',
    }
  ],
  preview: {
    prepare() {
      return {
        title: 'Image Masonry'
      }
    }
  }
})
