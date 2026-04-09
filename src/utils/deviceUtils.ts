/**
 * Detect iOS devices (iPhone, iPad, iPod).
 * iPad Pro on iOS 13+ reports as MacIntel with maxTouchPoints > 1.
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false
  const userAgent = window.navigator.userAgent.toLowerCase()
  const platform = window.navigator.platform?.toLowerCase() ?? ''
  return (
    /iphone|ipad|ipod/.test(userAgent) ||
    (platform === 'macintel' && navigator.maxTouchPoints > 1)
  )
}
