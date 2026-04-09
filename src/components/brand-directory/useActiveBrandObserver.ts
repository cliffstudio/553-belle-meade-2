import { RefCallback, useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface UseActiveBrandObserverOptions {
  itemCount: number
}

export function useActiveBrandObserver({ itemCount }: UseActiveBrandObserverOptions) {
  const [activeIndex, setActiveIndex] = useState(0)
  const rowRefs = useRef<Array<HTMLElement | null>>([])
  const visibleMapRef = useRef<Map<number, number>>(new Map())

  const setRowRef = useCallback((index: number): RefCallback<HTMLElement> => {
    return (node) => {
      rowRefs.current[index] = node
    }
  }, [])

  useEffect(() => {
    setActiveIndex(0)
    visibleMapRef.current.clear()
  }, [itemCount])

  useEffect(() => {
    if (itemCount === 0) return
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const indexAttr = (entry.target as HTMLElement).dataset.index
          const index = Number(indexAttr)
          if (!Number.isFinite(index)) return

          if (entry.isIntersecting) {
            visibleMapRef.current.set(index, Math.abs(entry.boundingClientRect.top))
          } else {
            visibleMapRef.current.delete(index)
          }
        })

        if (visibleMapRef.current.size === 0) return

        let nextIndex = activeIndex
        let minDistance = Number.POSITIVE_INFINITY

        visibleMapRef.current.forEach((distance, index) => {
          if (distance < minDistance) {
            minDistance = distance
            nextIndex = index
          }
        })

        setActiveIndex(nextIndex)
      },
      {
        root: null,
        rootMargin: '-35% 0px -50% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    )

    rowRefs.current.slice(0, itemCount).forEach((node) => {
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [activeIndex, itemCount])

  return useMemo(
    () => ({
      activeIndex: Math.min(activeIndex, Math.max(itemCount - 1, 0)),
      setRowRef,
    }),
    [activeIndex, itemCount, setRowRef]
  )
}
