import { defineType } from 'sanity'
import { flexibleContentAtMostOneBrandDirectoryValidation } from '../sections/brandDirectory'
import { flexibleContentAtMostOneHeroValidation } from '../sections/flexibleHeroSection'
import { flexibleContentAtMostOneInstagramFeedValidation } from '../sections/instagramFeed'
import { flexibleContentAtMostOneLeasingMapValidation } from '../sections/leasingMap'
import { flexibleContentAtMostOneVirtualTourEmbedValidation } from '../sections/virtualTourEmbed'
import { flexibleContentAtMostOneVillageMapValidation } from '../sections/villageMap'
import type { FlexibleContentArrayRule } from '../utils/flexibleContentArrayRule'

const flexibleContentBlockValidations = [
  flexibleContentAtMostOneHeroValidation,
  flexibleContentAtMostOneInstagramFeedValidation,
  flexibleContentAtMostOneBrandDirectoryValidation,
  flexibleContentAtMostOneLeasingMapValidation,
  flexibleContentAtMostOneVillageMapValidation,
  flexibleContentAtMostOneVirtualTourEmbedValidation,
]

export default defineType({
  name: 'flexibleContent',
  title: 'Content Blocks',
  type: 'array',
  validation: (Rule) =>
    flexibleContentBlockValidations.reduce(
      (acc, addValidation) =>
        addValidation(acc as FlexibleContentArrayRule) as FlexibleContentArrayRule,
      Rule as FlexibleContentArrayRule,
    ) as typeof Rule,
  of: [
    { type: 'flexibleHeroSection', title: 'Hero' },
    { type: 'textBlock', title: 'Text Block' },
    { type: 'instagramFeed', title: 'Instagram Feed' },
    { type: 'brandDirectory', title: 'Brand Directory' },
    { type: 'linkTiles', title: 'Link Tiles' },
    { type: 'stackedMediaText', title: 'Stacked Text & Media' },
    { type: 'fullWidthMedia', title: 'Full Width Media' },
    { type: 'smallMediaText', title: 'Small Text & Media' },
    { type: 'largeMediaText', title: 'Large Text & Media' },
    { type: 'imageMasonry', title: 'Image Masonry' },
    { type: 'staggeredImages', title: 'Staggered Images' },
    { type: 'ctaBanner', title: 'CTA Banner' },
    { type: 'leasingMap', title: 'Leasing Map' },
    { type: 'villageMap', title: 'Village Map' },
    { type: 'form', title: 'Form' },
    { type: 'virtualTourEmbed', title: 'Virtual Tour' },
    { type: 'issuuEmbed', title: 'Issuu Embed' },
    { type: 'architects', title: 'Text Grid' },
    { type: 'slideshowWithBorder', title: 'Slideshow With Border' },
    { type: 'fullWidthSlideshow', title: 'Full Width Slideshow' },
  ],
  options: {
    sortable: true,
  }
})

