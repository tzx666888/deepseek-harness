/** Product-name copy for the personalized local build. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'brandOfficial'

/** Simplified Chinese dictionary. */
export const zh = {
  localName: '鑫哥专属',
} satisfies Record<string, string>

/** Keys shared by every language. */
export type BrandKey = keyof typeof zh

/** English dictionary. */
export const en = {
  localName: 'Xinge Exclusive',
} satisfies Record<BrandKey, string>
