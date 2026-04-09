import { dataset, projectId } from '../env'
import { SanityVideo, SanityVideoUrl } from '../../types/sanity'

export const videoUrlFor = (video: SanityVideo | SanityVideoUrl | undefined): string => {
  // If it's already a URL string, return it directly
  if (typeof video === 'string') {
    return video
  }
  
  // If it's a Sanity video file, construct the URL
  if (!video?.asset?._ref) {
    return ''
  }
  
  // Construct Sanity video URL
  // Format: https://cdn.sanity.io/files/{projectId}/{dataset}/{assetId}
  // The assetId includes the file extension with a hyphen (e.g., "e1951b8dbc8dbd5aaaae088afe0d73b34c8e5780-mp4")
  // We need to convert the hyphen to a dot for the actual URL
  const assetId = video.asset._ref.replace('file-', '')
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${assetId.replace('-mp4', '.mp4')}`
}
