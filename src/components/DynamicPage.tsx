// src/components/DynamicPage.tsx
import React from 'react'
import { clientNoCdn } from '../../sanity.client'
import { pageQuery } from '../sanity/lib/queries'
import { notFound } from 'next/navigation'
import { SanityImage, SanityVideo, PortableTextBlock } from '../types/sanity'
import type { CtaLink } from '../types/link'
import BodyClassProvider from './BodyClassProvider'
import { auth } from '../app/sign-in/actions'

// Import section components
import HeroMedia from './HeroMedia'
import LinkTiles from './LinkTiles'
import FullWidthMedia from './FullWidthMedia'
import ImageMasonry from './ImageMasonry'
import StaggeredImages from './StaggeredImages'
import CtaBanner from './CtaBanner'
import SmallMediaText from './SmallMediaText'
import LargeMediaText from './LargeMediaText'
import StackedMediaText from './StackedMediaText'
import Gallery from './Gallery'
import Architects from './Architects'
import TextWithArtefacts from './TextWithArtefacts'
import ImageCarousel from './ImageCarousel'
// import ContactForm from './ContactForm'
import Form from './Form'
import LeasingMap from './LeasingMap'
import TextBlock from './TextBlock'
import FlexibleContent from './FlexibleContent'
import SimpleTextBlock from './SimpleTextBlock'
import FlexibleHeroSection from './FlexibleHeroSection'
import PlanYourVisitContent from './PlanYourVisitContent'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

import SignInHeroMedia from './SignInHeroMedia'

const sectionComponents = {
  heroMedia: HeroMedia,
  linkTiles: LinkTiles,
  fullWidthMedia: FullWidthMedia,
  imageMasonry: ImageMasonry,
  staggeredImages: StaggeredImages,
  ctaBanner: CtaBanner,
  smallMediaText: SmallMediaText,
  largeMediaText: LargeMediaText,
  stackedMediaText: StackedMediaText,
  gallery: Gallery,
  architects: Architects,
  textWithArtefacts: TextWithArtefacts,
  imageCarousel: ImageCarousel,
  // contactForm: ContactForm,
  form: Form,
  leasingMap: LeasingMap,
  textBlock: TextBlock,
  signInHeroMedia: SignInHeroMedia,
  flexibleHeroSection: FlexibleHeroSection,
  simpleTextBlock: SimpleTextBlock,
}

type PageSection = {
  _type: string
  _key: string
  [key: string]: unknown
}

type VideoSource = 'file' | 'url' | undefined
type MediaType = 'image' | 'video' | undefined
type ArchitectItem = {
  name: string
  bio: PortableTextBlock[]
  cta: CtaLink
}

type HeroLikeProps = {
  backgroundMediaType?: MediaType
  desktopBackgroundImage?: SanityImage
  mobileBackgroundImage?: SanityImage
  desktopBackgroundVideo?: SanityVideo
  videoSource?: VideoSource
  desktopBackgroundVideoUrl?: string
  desktopBackgroundVideoPlaceholder?: SanityImage
  overlayDarkness?: number
}

const getHeroLikeProps = (section: PageSection): HeroLikeProps => ({
  backgroundMediaType: section.backgroundMediaType as MediaType,
  desktopBackgroundImage: section.desktopBackgroundImage as SanityImage | undefined,
  mobileBackgroundImage: section.mobileBackgroundImage as SanityImage | undefined,
  desktopBackgroundVideo: section.desktopBackgroundVideo as SanityVideo | undefined,
  videoSource: section.videoSource as VideoSource,
  desktopBackgroundVideoUrl: section.desktopBackgroundVideoUrl as string | undefined,
  desktopBackgroundVideoPlaceholder: section.desktopBackgroundVideoPlaceholder as SanityImage | undefined,
  overlayDarkness: section.overlayDarkness as number | undefined,
})

// Helper function to add a section if it exists
const addSection = (
  sections: PageSection[],
  sectionData: unknown,
  sectionType: string,
  sectionKey: string
) => {
  if (sectionData) {
    sections.push({ ...sectionData, _type: sectionType, _key: sectionKey })
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params
  // Use non-CDN client to ensure fresh content bypasses Sanity CDN caching
  const page = await clientNoCdn.fetch(pageQuery, { slug: resolvedParams.slug }, {
    next: { revalidate: 0 }
  })

  if (!page) {
    notFound()
  }


  // Get the appropriate sections based on page type
  const getSections = () => {
    const sections: PageSection[] = []
    
    switch (page.pageType) {
      case 'sign-in':
        // Note: Sign-in pages require special handling with auth function
        // This case is for CMS-managed sign-in pages that may not need authentication
        addSection(sections, page.signInHero, 'signInHeroMedia', 'sign-in-hero')
        break
        
      case 'heritage':
        addSection(sections, page.heritageTextWithArtefacts, 'textWithArtefacts', 'heritage-text-with-artefacts')
        addSection(sections, page.heritageTextWithArtefacts2, 'textWithArtefacts', 'heritage-text-with-artefacts-2')
        addSection(sections, page.heritageImageCarousel, 'imageCarousel', 'heritage-image-carousel')
        addSection(sections, page.heritageCta, 'ctaBanner', 'heritage-cta')
        break

      case 'carousel':
        addSection(sections, page.carouselTextWithArtefacts, 'textWithArtefacts', 'carousel-text-with-artefacts')
        addSection(sections, page.carouselFullWidthMedia, 'fullWidthMedia', 'carousel-full-width-media')
        addSection(sections, page.carouselImageMasonry, 'imageMasonry', 'carousel-image-masonry')
        addSection(sections, page.carouselCta, 'ctaBanner', 'carousel-cta')
        break

      case 'gallery':
        addSection(sections, page.galleryImages, 'gallery', 'gallery-images')
        addSection(sections, page.galleryCta, 'ctaBanner', 'gallery-cta')
        break

      case 'press':
        addSection(sections, page.pressHero, 'heroMedia', 'press-hero')
        // pressContentBlocks will be rendered separately using FlexibleContent
        break

      case 'events':
        // eventsContentBlocks will be rendered separately using FlexibleContent
        break

      case 'text':
        addSection(sections, page.textHero, 'flexibleHeroSection', 'text-hero')
        if (page.textBlocks && Array.isArray(page.textBlocks)) {
          page.textBlocks.forEach((block: unknown, index: number) => {
            if (block) {
              sections.push({ ...(block as Record<string, unknown>), _type: 'simpleTextBlock', _key: `text-block-${index}` })
            }
          })
        }
        break
        
      case 'general':
        // General pages use flexible content blocks
        // No sections to add here, flexible content will be rendered separately
        break
        
      case 'architecture':
        // Architecture page type has been removed
        // Return empty sections array to prevent errors
        break
        
      default:
        // Unknown page types return empty sections
        break
    }
    
    return sections
  }

  const sections = getSections()
  
  // Handle removed page types - show not found
  if (page.pageType === 'architecture' || page.pageType === 'spaces') {
    notFound()
  }
  
  // Handle general pages with flexible content blocks
  if (page.pageType === 'general' && page.contentBlocks) {
    return (
      <>
        <BodyClassProvider 
          pageType={page.pageType} 
          slug={page.slug?.current} 
        />
        <FlexibleContent contentBlocks={page.contentBlocks || []} />
      </>
    )
  }

  // Handle Plan Your Visit pages
  if (page.pageType === 'plan-your-visit') {
    return (
      <>
        <BodyClassProvider 
          pageType={page.pageType} 
          slug={page.slug?.current} 
        />
        <PlanYourVisitContent
          title={page.title}
          heading={page.planYourVisitHeading}
          body={page.planYourVisitBody}
          details={page.planYourVisitDetails}
          images={page.planYourVisitImages}
        />
      </>
    )
  }

  // Handle press pages with press content blocks
  const pressContentBlocks = page.pageType === 'press' ? page.pressContentBlocks : null
  const eventsContentBlocks = page.pageType === 'events' ? page.eventsContentBlocks : null
  const flexibleBlocks = [pressContentBlocks, eventsContentBlocks].filter(Boolean)

  return (
    <>
      <BodyClassProvider 
        pageType={page.pageType} 
        slug={page.slug?.current} 
      />
      {sections.map((section: PageSection) => {
        const Component = sectionComponents[section._type as keyof typeof sectionComponents]
        
        if (!Component) {
          return null
        }

        // Special handling for HeroMedia component
        if (section._type === 'heroMedia') {
          const heroLikeProps = getHeroLikeProps(section)
          
          const HeroMediaComponent = Component as typeof HeroMedia
          return (
            <HeroMediaComponent 
              key={section._key} 
              layout={section.layout as 'layout-1' | 'layout-2' | undefined}
              desktopTitle={section.desktopTitle as string | undefined}
              mobileTitle={section.mobileTitle as string | undefined}
              showControls={section.showControls as boolean | undefined}
              cta={section.cta as CtaLink | undefined}
              {...heroLikeProps}
            />
          )
        }

        // Special handling for StackedMediaText component
        if (section._type === 'stackedMediaText') {
          // Extract the individual props from the section data
          const {
            layout,
            mediaType,
            image,
            video,
            videoSource,
            videoUrl,
            heading,
            body,
            cta,
            showControls,
            backgroundColour
          } = section
          
          const StackedMediaTextComponent = Component as typeof StackedMediaText
          return (
            <StackedMediaTextComponent 
              key={section._key} 
              layout={layout as 'layout-1' | 'layout-2' | undefined}
              mediaType={mediaType as MediaType}
              image={image as SanityImage | undefined}
              video={video as SanityVideo | undefined}
              videoSource={videoSource as VideoSource}
              videoUrl={videoUrl as string | undefined}
              heading={heading as string | undefined}
              body={body as PortableTextBlock[] | undefined}
              cta={cta as CtaLink | undefined}
              showControls={showControls as boolean | undefined}
              backgroundColour={backgroundColour as 'None' | 'Lilac' | 'Green' | 'Tan' | undefined}
            />
          )
        }

        // Special handling for Architects component
        if (section._type === 'architects') {
          // Extract the individual props from the section data
          const {
            heading,
            body,
            architects
          } = section
          
          const ArchitectsComponent = Component as typeof Architects
          return (
            <ArchitectsComponent 
              key={section._key} 
              heading={heading as string | undefined}
              body={body as PortableTextBlock[] | undefined}
              architects={architects as ArchitectItem[] | []}
            />
          )
        }

        // Special handling for FlexibleHeroSection component
        if (section._type === 'flexibleHeroSection') {
          const heroLikeProps = getHeroLikeProps(section)
          
          const FlexibleHeroSectionComponent = Component as typeof FlexibleHeroSection
          return (
            <FlexibleHeroSectionComponent 
              key={section._key} 
              layout={section.layout as 'layout-1' | 'layout-2' | 'layout-3' | 'homepage' | undefined}
              desktopTitle={section.desktopTitle as string | undefined}
              mobileTitle={section.mobileTitle as string | undefined}
              showControls={section.showControls as boolean | undefined}
              cta={section.cta as CtaLink | undefined}
              {...heroLikeProps}
            />
          )
        }

        // Special handling for SignInHeroMedia component
        if (section._type === 'signInHeroMedia') {
          const heroLikeProps = getHeroLikeProps(section)
          
          const SignInHeroMediaComponent = Component as typeof SignInHeroMedia
          return (
            <SignInHeroMediaComponent 
              key={section._key} 
              {...heroLikeProps}
              auth={auth}
            />
          )
        }

        // Default handling for all other components
        // TypeScript assertion to ensure proper typing for generic components
        const GenericComponent = Component as React.ComponentType<Record<string, unknown>>
        return <GenericComponent key={section._key} {...(section as Record<string, unknown>)} />
      })}
      {flexibleBlocks.map((contentBlocks, index) => (
        <FlexibleContent key={`content-blocks-${index}`} contentBlocks={contentBlocks as Array<{ _type: string; _key?: string; [key: string]: unknown }>} />
      ))}
    </>
  )
}
