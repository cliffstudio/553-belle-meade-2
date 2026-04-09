"use client"

import React from 'react'

type VideoControlsProps = {
  isPlaying: boolean
  isMuted: boolean
  onPlayPause: () => void
  onMute: () => void
  onFullscreen: (e: React.MouseEvent) => void
  className?: string
  style?: React.CSSProperties
  showControls?: boolean
  controlsRef?: React.Ref<HTMLDivElement>
}

const VideoControls = React.forwardRef<HTMLDivElement, VideoControlsProps>(({
  isPlaying,
  isMuted,
  onPlayPause,
  onMute,
  onFullscreen,
  className = '',
  style,
  showControls = true
}, ref) => {
  if (!showControls) return null

  return (
    <div ref={ref} className={`video-controls ${showControls ? 'visible' : ''} ${className}`} style={style}>
      <div className="play-pause-button" onClick={onPlayPause}>
        <svg className={`pause ${isPlaying ? 'active' : ''} button`} xmlns="http://www.w3.org/2000/svg" width="11" height="20" viewBox="0 0 11 20">
          <line x1="0.5" x2="0.5" y2="20"/>
          <line x1="10.5" x2="10.5" y2="20"/>
        </svg>
        <svg className={`play ${!isPlaying ? 'active' : ''} button`} xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 17 20">
          <path d="M16.0137005,10L.5,19.125V.874023l15.5137005,9.125977Z"/>
        </svg>
      </div>
      <div className="full-screen-button" onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onFullscreen(e)
      }} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
        <svg className="button active" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" style={{ pointerEvents: 'auto' }}>
          <path d="M1 9V1H9"/>
          <path d="M1 13V21H9"/>
          <path d="M21 9V1H13"/>
          <path d="M21 13V21H13"/>
        </svg>
      </div>
      <div className="volume-button" onClick={onMute}>
        <svg className={`mute button ${!isMuted ? 'active' : ''}`} xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23">
          <path d="M2.02539 14.876L2.03068 8.44525H5.75376L12.5177 2.69141V20.4607L5.74846 14.876H2.02539Z"/>
          <path d="M15.0615 7.66797C16.204 8.69055 16.9231 10.1766 16.9231 11.8306C16.9231 13.4308 16.25 14.8739 15.1715 15.8921"/>
          <path d="M17.9004 18.5992C19.7904 16.9548 20.9852 14.5319 20.9852 11.8299C20.9852 9.06625 19.7352 6.59452 17.7698 4.94922"/>
        </svg>

        <svg className={`volume button ${isMuted ? 'active' : ''}`} xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23">
          <path d="M2.02539 14.876L2.03068 8.44525H5.75376L12.5177 2.69141V20.4607L5.74846 14.876H2.02539Z"/>
          <line x1="0.353553" y1="0.646447" x2="22.3536" y2="22.6464"/>
          <path d="M15.0615 7.66797C16.204 8.69055 16.9231 10.1766 16.9231 11.8306C16.9231 13.4308 16.25 14.8739 15.1715 15.8921"/>
          <path d="M17.9004 18.5992C19.7904 16.9548 20.9852 14.5319 20.9852 11.8299C20.9852 9.06625 19.7352 6.59452 17.7698 4.94922"/>
        </svg>
      </div>
    </div>
  )
})

VideoControls.displayName = 'VideoControls'

export default VideoControls
