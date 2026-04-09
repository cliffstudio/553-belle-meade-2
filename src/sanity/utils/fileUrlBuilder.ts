import { dataset, projectId } from '../env'

export type SanityFile = {
  asset?: {
    _ref: string
    _type: string
  }
}

export const fileUrlFor = (file: SanityFile | undefined): string => {
  if (!file?.asset?._ref) {
    return ''
  }
  
  // Construct Sanity file URL
  // Format: https://cdn.sanity.io/files/{projectId}/{dataset}/{assetId}
  // The assetId includes the file extension with a hyphen (e.g., "e1951b8dbc8dbd5aaaae088afe0d73b34c8e5780-svg")
  // We need to convert the hyphen to a dot for the actual URL
  const assetId = file.asset._ref.replace('file-', '')
  
  // Replace the last hyphen with a dot to get the file extension
  // For SVG files: "hash-svg" becomes "hash.svg"
  const lastHyphenIndex = assetId.lastIndexOf('-')
  if (lastHyphenIndex !== -1) {
    const hash = assetId.substring(0, lastHyphenIndex)
    const extension = assetId.substring(lastHyphenIndex + 1)
    return `https://cdn.sanity.io/files/${projectId}/${dataset}/${hash}.${extension}`
  }
  
  // Fallback: return with the asset ID as-is
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${assetId}`
}
