import React from 'react'
import LinkTiles from './LinkTiles'
import StackedMediaText from './StackedMediaText'
import FlexibleHeroSection from './FlexibleHeroSection'
import TextBlock from './TextBlock'
import FullWidthMedia from './FullWidthMedia'
import LargeMediaText from './LargeMediaText'
import ImageMasonry from './ImageMasonry'
import StaggeredImages from './StaggeredImages'
import SmallMediaText from './SmallMediaText'
import CtaBanner from './CtaBanner'
import Architects from './Architects'
import PressPostsSection from './PressPostsSection'
import TestimonialSection from './TestimonialSection'
import LeasingMap from './LeasingMap'
import Form from './Form'
import VirtualTourEmbed from './VirtualTourEmbed'
import IssuuEmbed from './IssuuEmbed'
import SlideshowWithBorder from './SlideshowWithBorder'
import FullWidthSlideshow from './FullWidthSlideshow'
import InstagramFeed from './InstagramFeed'
import EventsBlock from './EventsBlock'
import BrandDirectory from './BrandDirectory'

interface ContentBlock {
  _type: string
  _key?: string
  [key: string]: unknown
}

interface FlexibleContentProps {
  contentBlocks: ContentBlock[]
}

type BlockComponent = React.ComponentType<Record<string, unknown>>

const blockComponents: Record<string, BlockComponent> = {
  flexibleHeroSection: FlexibleHeroSection as BlockComponent,
  linkTiles: LinkTiles as BlockComponent,
  stackedMediaText: StackedMediaText as BlockComponent,
  textBlock: TextBlock as BlockComponent,
  fullWidthMedia: FullWidthMedia as BlockComponent,
  largeMediaText: LargeMediaText as BlockComponent,
  imageMasonry: ImageMasonry as BlockComponent,
  staggeredImages: StaggeredImages as BlockComponent,
  smallMediaText: SmallMediaText as BlockComponent,
  ctaBanner: CtaBanner as BlockComponent,
  architects: Architects as BlockComponent,
  pressPostsSection: PressPostsSection as BlockComponent,
  testimonialSection: TestimonialSection as BlockComponent,
  leasingMap: LeasingMap as BlockComponent,
  form: Form as BlockComponent,
  issuuEmbed: IssuuEmbed as BlockComponent,
  slideshowWithBorder: SlideshowWithBorder as BlockComponent,
  fullWidthSlideshow: FullWidthSlideshow as BlockComponent,
  instagramFeed: InstagramFeed as BlockComponent,
  eventsBlock: EventsBlock as BlockComponent,
  brandDirectory: BrandDirectory as BlockComponent,
}

const FlexibleContent: React.FC<FlexibleContentProps> = ({ contentBlocks }) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return null
  }

  return (
    <div className="flexible-content">
      {contentBlocks.map((block, index) => {
        const key = block._key || `block-${index}`
        if (block._type === 'virtualTourEmbed') {
          return <VirtualTourEmbed key={key} />
        }

        const Component = blockComponents[block._type]
        if (!Component) {
          console.warn(`Unknown content block type: ${block._type}`)
          return null
        }

        return <Component key={key} {...(block as Record<string, unknown>)} />
      })}
    </div>
  )
}

export default FlexibleContent

