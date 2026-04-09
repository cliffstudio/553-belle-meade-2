/**
 * Sanity Studio config. Studio is mounted at the /studio URL route (see src/app/studio/[[...index]]/page.tsx).
 * Single workspace uses the production dataset.
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schemaTypes} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'

const sharedConfig = {
  schema: {
    types: schemaTypes,
  },
  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: apiVersion}),
  ],
}

export default defineConfig({
  name: 'default',
  title: 'Studio',
  projectId,
  dataset,
  basePath: '/studio',
  ...sharedConfig,
})
