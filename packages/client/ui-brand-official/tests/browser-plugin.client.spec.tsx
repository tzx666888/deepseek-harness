// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { apply, inject } from '../src/client/index.ts'
import {
  LocalBrandName, LocalPlanetBrandMark, OfficialBrandMark, OfficialBrandName,
} from '../src/client/Brand.tsx'
import { apply as hostApply } from '../src/index.ts'

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

const HOLES = [
  'sidebar.brand.mark',
  'sidebar.brand.name',
] as const

const HERO_HOLE = 'conversation.hero.brand.mark'

async function bench(declare = true) {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const dictionaries = new Map<string, { zh: Record<string, string>; en: Record<string, string> }>()
  ctx.provide('locale', {
    register: (namespace: string, dictionary: { zh: Record<string, string>; en: Record<string, string> }) => {
      dictionaries.set(namespace, dictionary)
      return () => { dictionaries.delete(namespace) }
    },
    bind: (namespace: string) => (key: string) => dictionaries.get(namespace)?.zh[key] ?? key,
  } as never)
  const slots = ctx.get('slots') as SlotRegistry
  const declareHoles = () => slots.register({
    name: 'root',
    children: Object.fromEntries([...HOLES, HERO_HOLE].map(name => [name, { kind: 'single', scope: 'root' }])),
  } as never, () => null)
  const disposeHoles = declare ? declareHoles() : undefined
  return { ctx, slots, declareHoles, disposeHoles }
}

describe('official browser-brand plugin', () => {
  it('keeps the host Loader entry inert', () => {
    expect(hostApply).not.toThrow()
  })

  it('declares only the slot service it uses', () => {
    expect(inject).toEqual(['slots', 'locale'])
  })

  it('fills both local-build mark surfaces and replaces the metadata-bearing fallback name', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    const subject = await bench()
    await subject.ctx.plugin({ inject: [...inject], apply }).await()
    expect(subject.slots.entries('sidebar.brand.mark')).toHaveLength(1)
    expect(subject.slots.entries('sidebar.brand.name')).toHaveLength(1)
    expect(subject.slots.entries(HERO_HOLE)).toHaveLength(1)
  })

  it('fills declarations before or after apply and removes every occupant on teardown', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'official')
    const before = await bench()
    const fiber = before.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(1)

    before.disposeHoles?.()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(0)
    before.declareHoles()
    await Promise.resolve()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(1)

    await fiber.dispose()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(0)

    const after = await bench(false)
    await after.ctx.plugin({ inject: [...inject], apply }).await()
    for (const hole of HOLES) expect(after.slots.entries(hole)).toHaveLength(0)
    after.declareHoles()
    await Promise.resolve()
    for (const hole of HOLES) expect(after.slots.entries(hole)).toHaveLength(1)
  })

  it('leaves the conversation hero on its declaring fallback even in official builds', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'official')
    const subject = await bench()
    await subject.ctx.plugin({ inject: [...inject], apply }).await()
    expect(subject.slots.entries(HERO_HOLE)).toHaveLength(0)
  })

  it('renders the official name independently from both requested mark sizes', () => {
    const name = render(<OfficialBrandName />)
    expect(name.container.querySelector('svg')?.getAttribute('viewBox')).toBe('26 0 156 24')
    name.unmount()

    const mark = render(<OfficialBrandMark size={34} />)
    expect(mark.container.querySelector('svg')?.getAttribute('width')).toBe('34')
    mark.rerender(<OfficialBrandMark size={24} />)
    expect(mark.container.querySelector('svg')?.getAttribute('width')).toBe('24')
  })

  it('renders the local planet mark at an enlarged compact size', () => {
    const mark = render(<LocalPlanetBrandMark size={34} />)
    const planet = mark.container.querySelector('[data-local-brand-mark="planet"]')
    expect(planet?.textContent).toBe('🪐')
    expect(planet?.getAttribute('aria-hidden')).toBe('true')
    expect((planet as HTMLElement | null)?.style.fontSize).toBe('39px')
    expect((planet as HTMLElement | null)?.style.height).toBe('34px')
    expect((planet as HTMLElement | null)?.style.width).toBe('34px')
    expect((planet as HTMLElement | null)?.style.filter)
      .toBe('hue-rotate(235deg) saturate(1.65) contrast(1.08) drop-shadow(0 0 3px rgb(139 92 246 / 55%))')
  })

  it('renders the local name without a build-version badge', () => {
    const name = render(<LocalBrandName name="鑫哥专属" />)
    expect(name.container.textContent).toBe('鑫哥专属')
    expect(name.container.querySelector('[data-local-brand-name="true"]')).not.toBeNull()
    expect(name.container.querySelector('.buildVersion')).toBeNull()
  })
})
