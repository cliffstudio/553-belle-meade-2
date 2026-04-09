import LazyLoad from 'vanilla-lazyload'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let lazyLoadInstance: any = null

export default function mediaLazyloading() {
  if (lazyLoadInstance) {
    // Re-observe elements to catch any new lazy-loaded content
    lazyLoadInstance.update()
    return lazyLoadInstance
  }

  lazyLoadInstance = new LazyLoad({
    threshold: 500,
    callback_loaded: (el: HTMLElement) => {
      // Hide loading overlays quickly since we already have the aspect ratio
      setTimeout(() => {
        hideSiblings(el, '.loading-overlay')
        hideChildren(el, '.loading-overlay')
      }, 50)

      setTimeout(() => {
        hideSiblings(el, '.video-placeholder')
        hideChildren(el, '.video-placeholder')
      }, 250)
      
      // Trigger a custom event for orientation updates
      el.dispatchEvent(new CustomEvent('imageLoaded'))
    },
  })

  return lazyLoadInstance
}

function hideSiblings(el: HTMLElement, selector: string) {
  const siblings = Array.from(el.parentElement?.children || [])
  siblings.forEach((sibling) => {
    if (sibling !== el && sibling.matches(selector)) {
      sibling.classList.add('hidden')
    }
  })
}

function hideChildren(el: HTMLElement, selector: string) {
  const children = el.querySelectorAll(selector)
  children.forEach((child) => {
    child.classList.add('hidden')
  })
}
