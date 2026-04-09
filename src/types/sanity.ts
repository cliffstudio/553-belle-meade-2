export type SanityImage = {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export type SanityVideo = {
  _type: 'file'
  asset: {
    _ref: string
    _type: 'reference'
  }
}

export type SanityVideoUrl = string

export type PortableTextBlock = {
  _type: string
  children: Array<{
    _type: string
    text: string
    marks?: string[]
  }>
  markDefs?: Array<{
    _type: string
    _key: string
  }>
}
