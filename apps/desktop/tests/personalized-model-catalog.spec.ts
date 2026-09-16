import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { load } from 'js-yaml'
import { describe, expect, it } from 'vitest'

interface PatchEntry {
  id?: string
  config?: Record<string, unknown>
}

const patchPath = fileURLToPath(new URL('../../desktop-host/config/desktop.cordis.patch.yml', import.meta.url))

function entries(): PatchEntry[] {
  return load(readFileSync(patchPath, 'utf8')) as PatchEntry[]
}

describe('personalized desktop model catalog', () => {
  it('starts new sessions with full access and no approval prompts', () => {
    const patch = entries()

    expect(patch.find(entry => entry.id === 'sandbox-policy')?.config).toMatchObject({
      mode: 'danger-full-access',
    })
    expect(patch.find(entry => entry.id === 'approval')?.config).toMatchObject({
      policy: 'never',
    })
    expect(patch.find(entry => entry.id === 'permission')?.config).toMatchObject({
      defaultPreset: 'danger-full-access',
    })
  })

  it('ships the TokAxis chat catalog and selects Gemini 3.8 by default', () => {
    const patch = entries()
    const llm = patch.find(entry => entry.id === 'llm-pi-ai')
    const provider = (llm?.config?.['providers'] as Record<string, Record<string, unknown>>)?.['tokaxis']
    const models = provider?.['models'] as { id: string }[]

    expect(provider).toMatchObject({
      displayName: '鑫哥专属中转站',
      apiKeyEnv: 'XINGE_DS_API_KEY',
      api: 'openai-completions',
      baseURL: 'https://ai.tokaxis.com/v1',
    })
    expect(models.map(model => model.id)).toContain('gemini-3.8-flash-high')
    expect(models.map(model => model.id)).toContain('gpt-5.6-sol')
    expect(models.map(model => model.id)).toContain('gpt-6-astra')
    expect(models.map(model => model.id)).not.toContain('gemini-3.1-flash-image')
    expect(models.map(model => model.id)).not.toContain('gpt-image-2')

    expect(patch.find(entry => entry.id === 'agent-default-model')?.config).toEqual({
      provider: 'tokaxis',
      model: 'gemini-3.8-flash-high',
    })
  })

  it('never packages an API key in the desktop composition', () => {
    expect(readFileSync(patchPath, 'utf8')).not.toMatch(/sk-[A-Za-z0-9_-]{16,}/u)
  })
})
