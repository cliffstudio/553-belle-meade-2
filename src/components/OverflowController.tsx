"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function OverflowController() {
  const pathname = usePathname()

  useEffect(() => {
    const isHomepage = pathname === '/' || pathname === ''

    if (!isHomepage) {
      document.documentElement.classList.add('scroll-enabled')
    }
  }, [pathname])

  return null
}
