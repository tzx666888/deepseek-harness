/** Official DeepSeek Harness occupants for the generic browser-brand slots. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: pulls the locale service merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { LocalBrandName, LocalPlanetBrandMark, OfficialBrandMark, OfficialBrandName } from './Brand.tsx'
import { en, NS, zh, type BrandKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Personalized product name. */
    brandOfficial: BrandKey
  }
}

/** Required services: the UI slot registry and locale runtime. */
export const inject = ['slots', 'locale']

/**
 * Fill the official sidebar brand slots, or the custom local-build tiger mark
 * in both compact product-mark surfaces.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-brand-official: dictionaries')
  if (process.env.DSH_CLIENT_BUILD_PROFILE === 'official') {
    ctx.slots.inject('sidebar.brand.mark', () =>
      ctx.slots.inject('sidebar.brand.name', function* () {
        yield ctx.slots.register({ name: 'sidebar.brand.mark' }, OfficialBrandMark)
        yield ctx.slots.register({ name: 'sidebar.brand.name' }, OfficialBrandName)
      }))
    return
  }

  ctx.slots.inject('sidebar.brand.mark', () =>
    ctx.slots.register({ name: 'sidebar.brand.mark' }, LocalPlanetBrandMark))
  const LocalizedBrandName = () => LocalBrandName({ name: ctx.locale.bind(NS)('localName') })
  ctx.slots.inject('sidebar.brand.name', () =>
    ctx.slots.register({ name: 'sidebar.brand.name' }, LocalizedBrandName))
  ctx.slots.inject('conversation.hero.brand.mark', () =>
    ctx.slots.register({ name: 'conversation.hero.brand.mark' }, LocalPlanetBrandMark))
}
