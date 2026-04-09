/**
 * Sanity CLI configuration – used for dataset and schema commands.
 * Uses the same env vars as the Studio (see src/sanity/env.ts).
 */
import { defineCliConfig } from 'sanity/cli'
import { dataset, projectId } from './src/sanity/env'

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
})
