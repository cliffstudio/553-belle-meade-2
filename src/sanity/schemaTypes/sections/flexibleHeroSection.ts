// @ts-nocheck
// flexibleHeroSection.ts
import { defineType, defineField } from 'sanity'
import { HomeIcon } from '@sanity/icons'

export default defineType({
  name: 'flexibleHeroSection',
  title: 'Hero',
  type: 'object',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'layout-1',
      options: { 
        list: [
          { title: 'Layout 1 (Full Bleed Media & Title)', value: 'layout-1' },
          { title: 'Layout 2 (Centred Title & CTA)', value: 'layout-2' },
          { title: 'Layout 3 (Title Only)', value: 'layout-3' },
          { title: 'Homepage', value: 'homepage' }
        ]
      }
    }),
    defineField({ 
      name: 'desktopTitle', 
      title: 'Title (Desktop)',
      type: 'string',
      hidden: ({ parent }) => parent?.layout === 'homepage'
    }),
    defineField({ 
      name: 'mobileTitle',
      title: 'Title (Mobile)',
      type: 'string',
      hidden: ({ parent }) => parent?.layout === 'homepage'
    }),
    defineField({
      name: 'backgroundMediaType',
      title: 'Background Media Type',
      type: 'string',
      initialValue: 'image',
      options: { 
        list: ['image','video'] 
      },
      hidden: ({ parent }) => parent?.layout !== 'layout-1' && parent?.layout !== 'homepage'
    }),
    defineField({ 
      name: 'desktopBackgroundImage', 
      title: 'Background Image (Desktop)',
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
      hidden: ({ parent }) => (parent?.layout !== 'layout-1' && parent?.layout !== 'homepage') || parent?.backgroundMediaType !== 'image'
    }),
    defineField({ 
      name: 'mobileBackgroundImage', 
      title: 'Background Image (Mobile)',
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
      hidden: ({ parent }) => (parent?.layout !== 'layout-1' && parent?.layout !== 'homepage') || parent?.backgroundMediaType !== 'image'
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
      hidden: ({ parent }) => (parent?.layout !== 'layout-1' && parent?.layout !== 'homepage') || parent?.backgroundMediaType !== 'video'
    }),
    defineField({ 
      name: 'desktopBackgroundVideo', 
      title: 'Background Video File',
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
      hidden: ({ parent }) => (parent?.layout !== 'layout-1' && parent?.layout !== 'homepage') || parent?.backgroundMediaType !== 'video' || parent?.videoSource === 'url'
    }),
    defineField({ 
      name: 'mobileBackgroundVideo', 
      title: 'Background Video File (Mobile)',
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
      hidden: ({ parent }) => (parent?.layout !== 'layout-1' && parent?.layout !== 'homepage') || parent?.backgroundMediaType !== 'video' || parent?.videoSource === 'url'
    }),
    defineField({
      name: 'desktopBackgroundVideoUrl',
      title: 'Background Video URL (Desktop)',
      type: 'url',
      description: 'Enter a direct URL to a video file (e.g., https://example.com/video.mp4)',
      validation: (Rule) => Rule.uri({
        scheme: ['http', 'https']
      }),
      hidden: ({ parent }) => (parent?.layout !== 'layout-1' && parent?.layout !== 'homepage') || parent?.backgroundMediaType !== 'video' || parent?.videoSource !== 'url'
    }),
    defineField({
      name: 'desktopBackgroundVideoPlaceholder',
      title: 'Background Video Placeholder (Desktop)',
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
          // If we can't fetch the asset yet (e.g., during upload), skip validation
        }
        
        return true;
      }),
      hidden: ({ parent }) => (parent?.layout !== 'layout-1' && parent?.layout !== 'homepage') || parent?.backgroundMediaType !== 'video'
    }),
    defineField({
      name: 'mobileBackgroundVideoUrl',
      title: 'Background Video URL (Mobile)',
      type: 'url',
      description: 'Enter a direct URL to a video file (e.g., https://example.com/video.mp4)',
      validation: (Rule) => Rule.uri({
        scheme: ['http', 'https']
      }),
      hidden: ({ parent }) => (parent?.layout !== 'layout-1' && parent?.layout !== 'homepage') || parent?.backgroundMediaType !== 'video' || parent?.videoSource !== 'url'
    }),
    defineField({
      name: 'mobileBackgroundVideoPlaceholder',
      title: 'Background Video Placeholder (Mobile)',
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
          // If we can't fetch the asset yet (e.g., during upload), skip validation
        }
        
        return true;
      }),
      hidden: ({ parent }) => (parent?.layout !== 'layout-1' && parent?.layout !== 'homepage') || parent?.backgroundMediaType !== 'video'
    }),
    defineField({ 
      name: 'showControls',
      title: 'Show Video Controls',
      type: 'boolean', 
      initialValue: false,
      hidden: ({ parent }) => (parent?.layout !== 'layout-1' && parent?.layout !== 'homepage') || parent?.backgroundMediaType !== 'video'
    }),
    defineField({ 
      name: 'overlayDarkness', 
      title: 'Overlay Darkness',
      type: 'number', 
      description: '0–1', 
      initialValue: 0.3,
      hidden: ({ parent }) => parent?.layout !== 'layout-1' && parent?.layout !== 'homepage'
    }),
    defineField({ 
      name: 'cta', 
      title: 'CTA',
      type: 'link',
      hidden: ({ parent }) => parent?.layout !== 'layout-2'
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Hero'
      }
    }
  }
})

