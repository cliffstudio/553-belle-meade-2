export type SectionBackgroundColour = 'None' | 'Lilac' | 'Green' | 'Tan'

export const getSectionBackgroundColor = (
  colour?: SectionBackgroundColour
): string | undefined => {
  switch (colour) {
    case 'Lilac':
      return '#E3DDE7'
    case 'Green':
      return '#C4C7B2'
    case 'Tan':
      return '#E6D3C3'
    default:
      return undefined
  }
}
