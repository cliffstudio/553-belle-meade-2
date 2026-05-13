/**
 * Structural typing for Sanity’s array `Rule` in `validation: (Rule) => …`.
 * Use when exporting `flexibleContentAtMostOne…` helpers from block schemas.
 */
export type FlexibleContentArrayRule = {
  custom: (fn: (modules: unknown) => true | string) => FlexibleContentArrayRule
}
