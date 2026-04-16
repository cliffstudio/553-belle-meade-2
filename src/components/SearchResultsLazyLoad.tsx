'use client'

import { useEffect } from 'react'
import mediaLazyloading from '../utils/lazyLoad'

type SearchResultsLazyLoadProps = {
  query: string
  resultCount: number
}

export default function SearchResultsLazyLoad({ query, resultCount }: SearchResultsLazyLoadProps) {
  useEffect(() => {
    // Ensure lazy loader observes images inserted by server-rendered search results.
    const timer = setTimeout(() => {
      mediaLazyloading()
    }, 0)

    return () => clearTimeout(timer)
  }, [query, resultCount])

  return null
}
