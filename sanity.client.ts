// sanity.client.ts
import { createClient } from 'next-sanity'
import { projectId, dataset } from './src/sanity/env'

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
