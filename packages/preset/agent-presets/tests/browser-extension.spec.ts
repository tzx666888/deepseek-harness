/** Boots the shipped browser row through Loader against the pinned MCP executable. */
import { readFileSync } from 'node:fs'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { entryListSchema } from '@deepseek-ai/cordis-plugin-include'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import * as mcp from '@deepseek-ai/dsh-mcp-client'
import type { EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import { load } from 'js-yaml'
import { afterEach, describe, expect, it, vi } from 'vitest'

const contexts: Context[] = []
afterEach(async () => {
  await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
  vi.unstubAllEnvs()
})

function browserRow(): EntryOptions {
  const entries = load(readFileSync(new URL('../presets/cordis/agent.cordis.yml', import.meta.url), 'utf8'), {
    schema: entryListSchema,
  }) as EntryOptions[]
  const row = entries.find(entry => entry.id === 'browser-extension')
  if (row === undefined) throw new Error('missing shipped browser extension row')
  return row
}

async function boot() {
  const ctx = new Context()
  contexts.push(ctx)
  ctx.baseUrl = new URL('../presets/cordis/', import.meta.url).href
  await ctx.plugin(Loader)
  await ctx.plugin(SystemPrompt, { personaPrefix: '' })
  await ctx.plugin(ToolRuntime)
  // A builtin selects the source-plane plugin without importing stale lib output.
  ctx.loader.builtins.browserMcp = mcp
  const id = await ctx.loader.create({ ...browserRow(), name: 'cordis:browserMcp' })
  return { ctx, id }
}

describe('Chrome extension adapter', () => {
  it('registers actual browser schemas and removes them on disposal', async () => {
    vi.stubEnv('DSH_ENABLE_BROWSER_EXTENSION', '1')
    const { ctx, id } = await boot()
    const names = ctx.tools.schemas().map(tool => tool.name)
    expect(names).toContain('mcp__browser__browser_snapshot')
    expect(names).toContain('mcp__browser__browser_tabs')
    expect(names).toContain('mcp__browser__browser_fill_form')
    expect(names).not.toContain('mcp__browser__browser_evaluate')
    expect(names).not.toContain('mcp__browser__browser_run_code')
    expect(names).not.toContain('mcp__browser__browser_file_upload')
    await ctx.loader.remove(id)
    expect(ctx.tools.schemas()).toEqual([])
  })

  it('does not add browser control to ordinary CLI profiles', async () => {
    vi.stubEnv('DSH_ENABLE_BROWSER_EXTENSION', undefined)
    const { ctx } = await boot()
    expect(ctx.tools.schemas()).toEqual([])
  })

  it('uses a local pinned runtime and a finite tool deadline', () => {
    const row = browserRow()
    expect(row.config).toMatchObject({
      serverName: 'browser', transport: 'stdio', toolCallTimeoutMs: 45000,
      failOnStartupError: true,
      restartOnInterruptedCall: true,
    })
    const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
      dependencies: Record<string, string>
    }
    expect(manifest.dependencies['@playwright/mcp']).toBe('0.0.81')
  })
})
