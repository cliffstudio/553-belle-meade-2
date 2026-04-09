// src/app/studio/[[...index]]/page.tsx
'use client'
import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'
import { useEffect, useState } from 'react'

export default function StudioPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Suppress React prop warnings for Sanity Studio components
    // This is a known issue with Sanity Studio v4 and React 19
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      const firstArg = args[0]
      const argStrings = args
        .filter((arg): arg is string => typeof arg === 'string')
        .join(' ')

      if (
        typeof firstArg === 'string' &&
        firstArg.includes('React does not recognize') &&
        (firstArg.includes('isSelected') || argStrings.includes('isSelected'))
      ) {
        return // Suppress this specific warning
      }
      originalError.apply(console, args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <NextStudio 
      config={config}
      unstable_noAuthBoundary={false}
    />
  )
}
