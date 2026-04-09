export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-05-08'

export const dataset = 'production'

// Validate dataset format
if (dataset && !/^[a-z0-9-]+$/.test(dataset)) {
  throw new Error(
    `Invalid Sanity dataset: "${dataset}". Dataset can only contain lowercase letters (a-z), numbers (0-9), and dashes (-).`
  )
}

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

// Validate project ID format
if (projectId && !/^[a-z0-9-]+$/.test(projectId)) {
  throw new Error(
    `Invalid Sanity project ID: "${projectId}". Project ID can only contain lowercase letters (a-z), numbers (0-9), and dashes (-).`
  )
}

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
