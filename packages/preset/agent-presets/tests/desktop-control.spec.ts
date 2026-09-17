import { readFileSync } from 'node:fs'
import { load } from 'js-yaml'
import { entryListSchema } from '@deepseek-ai/cordis-plugin-include'
import { describe, expect, it } from 'vitest'

describe('shipped desktop control host', () => {
  it('keeps MCP discovery and actions on the authorized local process', () => {
    const entries = load(readFileSync(new URL('../presets/cordis/agent.cordis.yml', import.meta.url), 'utf8'), {
      schema: entryListSchema,
    }) as { id: string; config?: { args?: string[]; allowTools?: string[] } }[]
    const desktop = entries.find(entry => entry.id === 'desktop-control')
    expect(desktop?.config?.args).toEqual(['mcp', 'serve', '--no-remote'])
    expect(desktop?.config?.allowTools).toEqual(expect.arrayContaining(['permissions', 'list', 'see', 'window', 'click']))
    expect(desktop?.config?.allowTools).not.toContain('clipboard')
    expect(desktop?.config?.allowTools).not.toContain('agent')
  })
})
