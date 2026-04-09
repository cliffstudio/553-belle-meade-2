import { defineType } from 'sanity'

export default defineType({
  name: 'flexibleContent',
  title: 'Content Blocks',
  type: 'array',
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

