import type {StructureResolver} from 'sanity/structure'
import { CogIcon, SearchIcon } from '@sanity/icons'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Belle Meade Village')
    .items([
      S.documentTypeListItem('page').title('Pages'),
      S.documentTypeListItem('press').title('Press'),
      S.documentTypeListItem('events').title('Events'),
      S.documentTypeListItem('brands').title('Brands'),
      S.documentTypeListItem('testimonials').title('Testimonials'),
      S.divider(),
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings'),
        ),
      S.listItem()
        .title('Brand Settings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('brandSettings')
            .documentId('brandSettings'),
        ),
      S.documentTypeListItem('menu').title('Menu'),
      S.listItem()
        .title('Search')
        .icon(SearchIcon)
        .child(
          S.document()
            .schemaType('search')
            .documentId('search'),
        ),
      S.documentTypeListItem('footer').title('Footer'),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          ![
            'page',
            'press',
            'events',
            'brands',
            'testimonials',
            'menu',
            'footer',
            'metaData',
            'siteSettings',
            'brandSettings',
            'brandCategory',
            'search',
          ].includes(item.getId()!),
      ),
    ])
