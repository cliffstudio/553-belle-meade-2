'use client'

import React, { useEffect, useRef, useState } from 'react'
import Lottie from 'lottie-react'
import type { LottieRefCurrentProps } from 'lottie-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'

const TEXT_PAUSE_MS = 2500
const FADE_OUT_MS = 1200

interface FooterLottieAnimationProps {
  footerRef: React.RefObject<HTMLElement | null>
}

export default function FooterLottieAnimation({ footerRef }: FooterLottieAnimationProps) {
  const [animationData, setAnimationData] = useState<object | null>(null)
  const [hasTriggeredFirstPlay, setHasTriggeredFirstPlay] = useState(false)
  const [showLottieText, setShowLottieText] = useState(false)
  const [isAnimationFadedOut, setIsAnimationFadedOut] = useState(false)
  const [playKey, setPlayKey] = useState(0)
  const lottieRef = useRef<LottieRefCurrentProps | null>(null)
  const pauseTimerRef = useRef<number | NodeJS.Timeout | null>(null)
  const playTimerRef = useRef<number | NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetch('/animations/logo-a-3s.json')
      .then((res) => res.json())
      .then(setAnimationData)
  }, [])

  useEffect(() => {
    if (!animationData || !footerRef?.current) return
    gsap.registerPlugin(ScrollTrigger)

    const trigger = ScrollTrigger.create({
      trigger: footerRef.current,
      start: 'top center',
      onEnter: () => setHasTriggeredFirstPlay(true),
      once: true,
    })

    return () => trigger.kill()
  }, [animationData, footerRef])

  useEffect(() => {
    if (!animationData) return
    if (playKey === 0 && !hasTriggeredFirstPlay) return
    const id = setTimeout(() => lottieRef.current?.play(), 100)
    return () => clearTimeout(id)
  }, [animationData, playKey, hasTriggeredFirstPlay])

  useEffect(() => {
    if (!showLottieText) return

    pauseTimerRef.current = window.setTimeout(() => {
      setShowLottieText(false)
      setIsAnimationFadedOut(true)

      playTimerRef.current = window.setTimeout(() => {
        setPlayKey((k) => k + 1)
        setIsAnimationFadedOut(false)
        playTimerRef.current = null
      }, FADE_OUT_MS)
    }, TEXT_PAUSE_MS)

    return () => {
      if (pauseTimerRef.current) {
        window.clearTimeout(pauseTimerRef.current)
        pauseTimerRef.current = null
      }
    }
  }, [showLottieText])

  useEffect(() => {
    return () => {
      if (playTimerRef.current) {
        window.clearTimeout(playTimerRef.current)
        playTimerRef.current = null
      }
    }
  }, [])

  if (!animationData) return null

  const showLottie = hasTriggeredFirstPlay || playKey > 0

  return (
    <div className="footer-animation-wrap">
      <div className={`footer-lottie-wrapper${isAnimationFadedOut ? ' footer-lottie-wrapper--faded-out' : ''}`}>
        {showLottie ? (
          <Lottie
            key={playKey}
            lottieRef={lottieRef}
            animationData={animationData}
            loop={false}
            className="footer-lottie"
            onComplete={() => setShowLottieText(true)}
          />
        ) : (
          <div className="footer-lottie-placeholder" aria-hidden />
        )}
      </div>

      <p className={`footer-lottie-text${showLottieText ? ' footer-lottie-text--visible' : ''}`}>
        The Roots of Iris City
      </p>

      <Link href="/heritage" />
    </div>
  )
}
