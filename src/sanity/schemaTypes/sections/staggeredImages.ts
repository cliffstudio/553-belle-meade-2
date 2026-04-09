// @ts-nocheck
// staggeredImages.ts
import { defineType, defineField } from 'sanity'
import { ImagesIcon } from '@sanity/icons'
export default defineType({
  name: 'staggeredImages',
  title: 'Staggered Images',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({ name: 'heading', type: 'string' }),
    defineField({ name: 'body', type: 'richPortableText' }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Layout 1 (portrait + square + landscape)', value: 'layout-1' },
          { title: 'Layout 2 (square + portrait + portrait)', value: 'layout-2' },
          { title: 'Layout 3 (landscape + portrait + landscape)', value: 'layout-3' }
        ]
      },
      initialValue: 'layout-1'
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
      name: 'caption1', 
      title: 'Caption',
      type: 'string',
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
      name: 'caption2', 
      title: 'Caption',
      type: 'string',
      fieldset: 'media2'
    }),
    defineField({ 
      name: 'mediaType3',
      title: 'Media Type',
      type: 'string', 
      initialValue: 'image',
      options: { list: ['image','video'] },
      fieldset: 'media3'
    }),
    defineField({ 
      name: 'image3', 
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
      hidden: ({ parent }) => parent?.mediaType3 !== 'image',
      fieldset: 'media3'
    }),
    defineField({
      name: 'videoSource3',
      title: 'Video Source',
      type: 'string',
      initialValue: 'file',
      options: { 
        list: [
          { title: 'Upload File', value: 'file' },
          { title: 'Video URL', value: 'url' }
        ]
      },
      hidden: ({ parent }) => parent?.mediaType3 !== 'video',
      fieldset: 'media3'
    }),
    defineField({ 
      name: 'video3', 
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
      hidden: ({ parent }) => parent?.mediaType3 !== 'video' || parent?.videoSource3 === 'url',
      fieldset: 'media3'
    }),
    defineField({
      name: 'videoUrl3',
      title: 'Video URL',
      type: 'url',
      description: 'Enter a direct URL to a video file (e.g., https://example.com/video.mp4)',
      validation: (Rule) => Rule.uri({
        scheme: ['http', 'https']
      }),
      hidden: ({ parent }) => parent?.mediaType3 !== 'video' || parent?.videoSource3 !== 'url',
      fieldset: 'media3'
    }),
    defineField({
      name: 'videoPlaceholder3',
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
      hidden: ({ parent }) => parent?.mediaType3 !== 'video',
      fieldset: 'media3'
    }),
    defineField({ 
      name: 'caption3', 
      title: 'Caption',
      type: 'string',
      fieldset: 'media3'
    }),
  ],
  fieldsets: [
    {
      name: 'media1',
      title: 'Media Tile 1'
    },
    {
      name: 'media2',
      title: 'Media Tile 2'
    },
    {
      name: 'media3',
      title: 'Media Tile 3'
    }
  ],
  preview: {
    prepare() {
      return {
        title: 'Staggered Images'
      }
    }
  }
})
