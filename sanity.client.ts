// sanity.client.ts
import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'missing-project-id'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2023-10-01',
  useCdn: true,
})

// Non-CDN client for fetching fresh content that bypasses CDN caching
// Use this when you need immediate updates without waiting for CDN propagation
export const clientNoCdn = createClient({
  projectId,
  dataset,
  apiVersion: '2023-10-01',
  useCdn: false,
})
