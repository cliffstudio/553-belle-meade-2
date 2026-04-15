// src/sanity/lib/queries.ts
import { groq } from 'next-sanity'

/**
 * Consolidated query system using smart conditionals
 * Only fetches data for the specific page type, improving performance
 */

// Reusable fragments for consistency and maintainability
// Note: These are template strings, not groq template literals, so they can be safely interpolated
const imageFragment = `{
  asset {
    _ref,
    _type
  },
  alt,
  hotspot,
  crop
}`

const videoFragment = `{
  asset {
    _ref,
    _type
  }
}`

const videoSourceFragment = `videoSource, videoUrl`

const linkFragment = `{
  linkType,
  label,
  href,
  jumpLink,
  pageLink {
    _ref,
    _type,
    "slug": *[_type == "page" && _id == ^._ref][0].slug.current,
    "title": *[_type == "page" && _id == ^._ref][0].title
  }
}`

// Flexible content block fragments
// Main flexible content fragment - queries all possible fields for all block types
const flexibleContentFragment = `[] {
  _type,
  _key,
  // LinkTiles fields
  numberOfTiles,
  linkTile1 {
    mediaType,
    image ${imageFragment},
    video ${videoFragment},
    ${videoSourceFragment},
    showControls,
    cta ${linkFragment}
  },
  linkTile2 {
    mediaType,
    image ${imageFragment},
    video ${videoFragment},
    ${videoSourceFragment},
    showControls,
    cta ${linkFragment}
  },
  linkTile3 {
    mediaType,
    image ${imageFragment},
    video ${videoFragment},
    ${videoSourceFragment},
    showControls,
    cta ${linkFragment}
  },
  linkTile4 {
    mediaType,
    image ${imageFragment},
    video ${videoFragment},
    ${videoSourceFragment},
    showControls,
    cta ${linkFragment}
  },
  linkTile5 {
    mediaType,
    image ${imageFragment},
    video ${videoFragment},
    ${videoSourceFragment},
    showControls,
    cta ${linkFragment}
  },
  linkTile6 {
    mediaType,
    image ${imageFragment},
    video ${videoFragment},
    ${videoSourceFragment},
    showControls,
    cta ${linkFragment}
  },
  linkTile7 {
    mediaType,
    image ${imageFragment},
    video ${videoFragment},
    ${videoSourceFragment},
    showControls,
    cta ${linkFragment}
  },
  // StackedMediaText fields
  layout,
  heading,
  subheading,
  body,
  cta ${linkFragment},
  backgroundColour,
  mediaType,
  image ${imageFragment},
  video ${videoFragment},
  videoSource,
  videoUrl,
  showControls,
  // FlexibleHeroSection fields
  desktopTitle,
  mobileTitle,
  backgroundMediaType,
  desktopBackgroundImage ${imageFragment},
  mobileBackgroundImage ${imageFragment},
  desktopBackgroundVideo ${videoFragment},
  videoSource,
  desktopBackgroundVideoUrl,
  desktopBackgroundVideoPlaceholder ${imageFragment},
  overlayDarkness,
  cta ${linkFragment},
  // ImageMasonry fields
  mediaType1,
  image1 ${imageFragment},
  video1 ${videoFragment},
  videoSource1,
  videoUrl1,
  mediaType2,
  image2 ${imageFragment},
  video2 ${videoFragment},
  videoSource2,
  videoUrl2,
  // StaggeredImages fields
  caption1,
  caption2,
  caption3,
  mediaType3,
  image3 ${imageFragment},
  video3 ${videoFragment},
  videoSource3,
  videoUrl3,
  // Architects fields
  architects[] {
    name,
    bio,
    cta ${linkFragment}
  },
  // LeasingMap fields
  floors[] {
    label,
    mobileLabel,
    desktopImage ${imageFragment},
    mobileImage ${imageFragment},
    desktopSpacesOverlayImage {
      asset {
        _ref,
        _type
      }
    },
    mobileSpacesOverlayImage {
      asset {
        _ref,
        _type
      }
    },
    spots[] {
      id,
      title,
      description,
      image ${imageFragment},
      desktopMarkerImage ${imageFragment},
      mobileMarkerImage ${imageFragment},
      desktopPosition {
        top,
        left
      },
      mobilePosition {
        top,
        left
      }
    }
  },
  // Form fields
  title,
  introduction,
  formFields,
  submitLabel,
  successMessage,
  adminNotificationEmail,
  // IssuuEmbed fields
  src,
  title,
  // InstagramFeed fields
  socialLinks[] {
    _key,
    icon ${imageFragment},
    link
  },
  // SlideshowWithBorder fields
  slides[] {
    _key,
    mediaType,
    image ${imageFragment},
    video ${videoFragment},
    videoSource,
    videoUrl,
    videoPlaceholder ${imageFragment},
    "heading": coalesce(heading, title),
    subheading,
    body,
    cta ${linkFragment}
  },
  // EventsBlock fields
  events,
  gridLayout,
  customEvents[]-> {
    _id,
    title,
    slug,
    eventStartDateTime,
    eventEndDateTime,
    eventLocation,
    thumbnailImage ${imageFragment}
  },
  "allEvents": select(
    _type == "eventsBlock" => *[_type == "events" && defined(slug.current)] | order(eventStartDateTime asc) {
      _id,
      title,
      slug,
      eventStartDateTime,
      eventEndDateTime,
      eventLocation,
      thumbnailImage ${imageFragment}
    },
    null
  ),
  // BrandDirectory fields
  preselectedBrandCategory-> {
    _id,
    name
  },
  "brandCategories": select(
    _type == "brandDirectory" => *[_type == "brandSettings" && (_id == "brandSettings" || _id == "drafts.brandSettings")][0].brandCategories[]-> {
      _id,
      name
    },
    null
  ),
  "allBrands": select(
    _type == "brandDirectory" => *[_type == "brands" && defined(slug.current)] | order(title asc) {
      _id,
      _createdAt,
      title,
      shortDescription,
      slug,
      thumbnailImage ${imageFragment},
      "details": array::compact([
        select(openingHours != null => {
          "detailHeading": "Opening Hours",
          "detailBody": openingHours
        }),
        select(address != null => {
          "detailHeading": "Address",
          "detailBody": address
        }),
        ...coalesce(details, [])[] {
          detailHeading,
          detailBody
        }
      ]),
      brandCategory-> {
        _id,
        name,
        icon ${imageFragment}
      }
    },
    null
  )
}`

// Press content blocks fragment - only for press pages
const pressContentBlocksFragment = `[] {
  _type,
  _key,
  // PressPostsSection fields
  post1-> {
    _id,
    title,
    slug,
    publishedAt,
    thumbnailType,
    thumbnailImage ${imageFragment},
    thumbnailLogo ${imageFragment},
    thumbnailBackgroundColour,
    excerpt,
    featuredImage ${imageFragment},
    content,
    source,
    sourceUrl,
    layout
  },
  post2-> {
    _id,
    title,
    slug,
    publishedAt,
    thumbnailType,
    thumbnailImage ${imageFragment},
    thumbnailLogo ${imageFragment},
    thumbnailBackgroundColour,
    excerpt,
    featuredImage ${imageFragment},
    content,
    source,
    sourceUrl,
    layout
  },
  layout,
  // TestimonialSection fields
  testimonial-> {
    _id,
    name,
    source,
    backgroundColour
  }
}`

// Lightweight query to check if sign-in page is enabled (avoids redirect loops when disabled)
export const signInPageEnabledQuery = groq`
  *[_type == "page" && slug.current == "sign-in"][0].signInPageEnabled
`

// Main page query with conditional field fetching
export const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    pageType,
    seo {
      metaTitle,
      metaDescription,
      socialImage ${imageFragment}
    },
    
    // Sign In fields
    pageType == "sign-in" => {
      signInPageEnabled,
      signInHero {
        backgroundMediaType,
        desktopBackgroundImage ${imageFragment},
        mobileBackgroundImage ${imageFragment},
        desktopBackgroundVideo ${videoFragment},
        videoSource,
        desktopBackgroundVideoUrl,
        desktopBackgroundVideoPlaceholder ${imageFragment},
        overlayDarkness
      }
    },
    
    // Heritage fields
    pageType == "heritage" => {
      heritageTextWithArtefacts {
        layout,
        desktopTitle,
        mobileTitle,
        backgroundMediaType,
        desktopBackgroundImage ${imageFragment},
        mobileBackgroundImage ${imageFragment},
        desktopBackgroundVideo ${videoFragment},
        desktopBackgroundVideoPlaceholder ${imageFragment},
        showControls,
        overlayDarkness,
        body,
        body2,
        carouselIcon ${imageFragment},
        artefact1 {
          image ${imageFragment},
          hoverImage ${imageFragment},
          caption,
          title,
          description
        },
        artefact2 {
          image ${imageFragment},
          hoverImage ${imageFragment},
          caption,
          title,
          description
        },
        artefact3 {
          image ${imageFragment},
          hoverImage ${imageFragment},
          caption,
          title,
          description
        },
        artefact4 {
          image ${imageFragment},
          hoverImage ${imageFragment},
          caption,
          title,
          description
        }
      },
      heritageTextWithArtefacts2 {
        layout,
        desktopTitle,
        mobileTitle,
        backgroundMediaType,
        desktopBackgroundImage ${imageFragment},
        mobileBackgroundImage ${imageFragment},
        desktopBackgroundVideo ${videoFragment},
        desktopBackgroundVideoPlaceholder ${imageFragment},
        showControls,
        overlayDarkness,
        body,
        body2,
        carouselIcon ${imageFragment},
        artefact1 {
          image ${imageFragment},
          hoverImage ${imageFragment},
          caption,
          title,
          description
        },
        artefact2 {
          image ${imageFragment},
          hoverImage ${imageFragment},
          caption,
          title,
          description
        },
        artefact3 {
          image ${imageFragment},
          hoverImage ${imageFragment},
          caption,
          title,
          description
        },
        artefact4 {
          image ${imageFragment},
          hoverImage ${imageFragment},
          caption,
          title,
          description
        }
      },
      heritageImageCarousel {
        heading,
        body,
        images[] {
          mediaType,
          image ${imageFragment},
          video ${videoFragment},
          videoSource,
          videoUrl,
          caption,
          imageSize
        }
      },
      heritageCta {
        cta ${linkFragment}
      }
    },

    // Carousel fields
    pageType == "carousel" => {
      carouselTextWithArtefacts {
        layout,
        desktopTitle,
        mobileTitle,
        backgroundMediaType,
        desktopBackgroundImage ${imageFragment},
        mobileBackgroundImage ${imageFragment},
        desktopBackgroundVideo ${videoFragment},
        desktopBackgroundVideoPlaceholder ${imageFragment},
        showControls,
        overlayDarkness,
        body,
        body2,
        carouselIcon ${imageFragment},
        artefact1 {
          image ${imageFragment},
          hoverImage ${imageFragment},
          caption,
          title,
          description
        },
        artefact2 {
          image ${imageFragment},
          hoverImage ${imageFragment},
          caption,
          title,
          description
        },
        artefact3 {
          image ${imageFragment},
          hoverImage ${imageFragment},
          caption,
          title,
          description
        },
        artefact4 {
          image ${imageFragment},
          hoverImage ${imageFragment},
          caption,
          title,
          description
        }
      },
      carouselFullWidthMedia {
        mediaType,
        image ${imageFragment},
        video ${videoFragment},
        showControls
      },
      carouselImageMasonry {
        heading,
        body,
        cta ${linkFragment},
        layout,
        mediaType1,
        image1 ${imageFragment},
        video1 ${videoFragment},
        videoSource1,
        videoUrl1,
        mediaType2,
        image2 ${imageFragment},
        video2 ${videoFragment},
        videoSource2,
        videoUrl2
      },
      carouselCta {
        cta ${linkFragment}
      }
    },

    // Gallery fields
    pageType == "gallery" => {
      galleryImages {
        images[] {
          image ${imageFragment},
          caption,
          imageSize
        }
      },
      galleryCta {
        cta ${linkFragment}
      }
    },

    // Press fields
    pageType == "press" => {
      pressHero {
        layout,
        desktopTitle,
        mobileTitle,
        backgroundMediaType,
        desktopBackgroundImage ${imageFragment},
        mobileBackgroundImage ${imageFragment},
        desktopBackgroundVideo ${videoFragment},
        videoSource,
        desktopBackgroundVideoUrl,
        desktopBackgroundVideoPlaceholder ${imageFragment},
        showControls,
        overlayDarkness,
        cta ${linkFragment}
      },
      pressContentBlocks ${pressContentBlocksFragment}
    },

    // Events fields
    pageType == "events" => {
      eventsContentBlocks ${flexibleContentFragment}
    },

    // Text fields
    pageType == "text" => {
      textHero {
        layout,
        desktopTitle,
        mobileTitle,
        backgroundMediaType,
        desktopBackgroundImage ${imageFragment},
        mobileBackgroundImage ${imageFragment},
        desktopBackgroundVideo ${videoFragment},
        videoSource,
        desktopBackgroundVideoUrl,
        desktopBackgroundVideoPlaceholder ${imageFragment},
        showControls,
        overlayDarkness,
        cta ${linkFragment}
      },
      textBlocks[] {
        title,
        text
      }
    },
    
    // General page fields (flexible content blocks)
    pageType == "general" => {
      contentBlocks ${flexibleContentFragment}
    },

    // Plan Your Visit page fields
    pageType == "plan-your-visit" => {
      planYourVisitHeading,
      planYourVisitBody,
      planYourVisitDetails[] {
        _key,
        heading,
        items[] {
          _key,
          subtitle,
          body
        }
      },
      planYourVisitImages[] ${imageFragment}
    }
    
    // Add new page types here following the same pattern:
    // pageType == "newPageType" => {
    //   newPageTypeField1 { ... },
    //   newPageTypeField2 { ... }
    // }
  }
`

// Simplified queries for specific use cases

export const pageSlugsQuery = groq`
  *[_type == "page"] {
    slug
  }
`

// Footer and menu queries
export const footerQuery = groq`
  *[_type == "footer"][0] {
    _id,
    title,
    newsletterText,
    column1[] {
      heading,
      text
    },
    column2[] {
      linkType,
      label,
      href,
      jumpLink,
      "isExternal": linkType == "external",
      pageLink-> {
        title,
        "slug": slug.current
      }
    },
    column3[] {
      linkType,
      label,
      href,
      jumpLink,
      "isExternal": linkType == "external",
      pageLink-> {
        title,
        "slug": slug.current
      }
    }
  }
`

export const leftMenuQuery = groq`
  *[_type == "menu" && title == "Left Menu"][0] {
    _id,
    title,
    items[] {
      itemType,
      pageLink-> {
        _id,
        title,
        "slug": slug.current
      },
      heading,
      subItems[] {
        pageLink-> {
          _id,
          title,
          "slug": slug.current
        }
      }
    }
  }
`

export const rightMenuQuery = groq`
  *[_type == "menu" && title == "Right Menu"][0] {
    _id,
    title,
    items[] {
      itemType,
      pageLink-> {
        _id,
        title,
        "slug": slug.current
      },
      heading,
      subItems[] {
        pageLink-> {
          _id,
          title,
          "slug": slug.current
        }
      }
    }
  }
`

// Metadata query (from Site Settings)
export const metadataQuery = groq`
  *[_type == "siteSettings"][0] {
    _id,
    title,
    description,
    socialimage ${imageFragment}
  }
`

// Press queries
export const pressPostsQuery = groq`
  *[_type == "press"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    thumbnailType,
    thumbnailImage ${imageFragment},
    thumbnailLogo ${imageFragment},
    thumbnailBackgroundColour,
    excerpt,
    featuredImage ${imageFragment},
    content,
    source,
    sourceUrl,
    layout
  }
`

export const pressPostQuery = groq`
  *[_type == "press" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    thumbnailType,
    thumbnailImage ${imageFragment},
    thumbnailLogo ${imageFragment},
    thumbnailBackgroundColour,
    excerpt,
    featuredImage ${imageFragment},
    content,
    source,
    sourceUrl,
    layout,
    seo {
      metaTitle,
      metaDescription,
      socialImage ${imageFragment}
    }
  }
`

// Events queries
export const eventsPostsQuery = groq`
  *[_type == "events"] | order(eventStartDateTime desc) {
    _id,
    title,
    slug,
    eventStartDateTime,
    eventEndDateTime,
    eventLocation,
    thumbnailImage ${imageFragment},
    featuredImage ${imageFragment},
    "desktopLayout": coalesce(desktopLayout, layout),
    "mobileLayout": coalesce(mobileLayout, layout),
    details[] {
      detailHeading,
      detailBody
    },
    content,
    cta ${linkFragment}
  }
`

export const eventsPostQuery = groq`
  *[_type == "events" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    eventStartDateTime,
    eventEndDateTime,
    eventLocation,
    thumbnailImage ${imageFragment},
    featuredImage ${imageFragment},
    "desktopLayout": coalesce(desktopLayout, layout),
    "mobileLayout": coalesce(mobileLayout, layout),
    details[] {
      detailHeading,
      detailBody
    },
    content,
    cta ${linkFragment},
    seo {
      metaTitle,
      metaDescription,
      socialImage ${imageFragment}
    }
  }
`

// Brands queries
export const brandsPostsQuery = groq`
  *[_type == "brands"] | order(title asc) {
    _id,
    title,
    slug,
    thumbnailImage ${imageFragment},
    featuredImage ${imageFragment},
    locationImage ${imageFragment},
    desktopLayout,
    mobileLayout,
    "details": array::compact([
      select(openingHours != null => {
        "detailHeading": "Opening Hours",
        "detailBody": openingHours
      }),
      select(address != null => {
        "detailHeading": "Address",
        "detailBody": address
      }),
      ...coalesce(details, [])[] {
        detailHeading,
        detailBody
      }
    ]),
    content
  }
`

export const brandsPostQuery = groq`
  *[_type == "brands" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    thumbnailImage ${imageFragment},
    featuredImage ${imageFragment},
    locationImage ${imageFragment},
    desktopLayout,
    mobileLayout,
    "details": array::compact([
      select(openingHours != null => {
        "detailHeading": "Opening Hours",
        "detailBody": openingHours
      }),
      select(address != null => {
        "detailHeading": "Address",
        "detailBody": address
      }),
      ...coalesce(details, [])[] {
        detailHeading,
        detailBody
      }
    ]),
    content,
    seo {
      metaTitle,
      metaDescription,
      socialImage ${imageFragment}
    }
  }
`
