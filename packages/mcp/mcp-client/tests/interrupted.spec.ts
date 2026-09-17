/** Real Loader + subprocess recovery, including cancellation ignored by the external server. */
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { entryListSchema } from '@deepseek-ai/cordis-plugin-include'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import * as mcp from '@deepseek-ai/dsh-mcp-client'
import type { EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import { load } from 'js-yaml'
import { afterEach, expect, it, vi } from 'vitest'

const cleanup: Array<() => Promise<void>> = []
afterEach(async () => { for (const dispose of cleanup.splice(0).reverse()) await dispose() })
let sequence = 0
async function boot(restart = true, timeoutMs = 200) {
  const dir = mkdtempSync(join(tmpdir(), 'mcp-interrupted-'))
  cleanup.push(async () => { rmSync(dir, { recursive: true, force: true }) })
  const journal = join(dir, 'events')
  const ctx = new Context()
  cleanup.push(async () => { await ctx.fiber.dispose() })
  const fixture = new URL('./fixtures/interrupted.cordis.yml', import.meta.url)
  ctx.baseUrl = fixture.href
  await ctx.plugin(Loader)
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  ctx.loader.builtins.interruptedMcp = mcp
  const rows = load(readFileSync(fixture, 'utf8'), { schema: entryListSchema }) as EntryOptions[]
  const row = rows[0]!
  // Resolve fixture arguments explicitly so Windows paths retain drive letters.
  row.config = { ...row.config as Record<string, unknown>, command: process.execPath, args: [fileURLToPath(new URL('./fixtures/interrupted-server.ts', import.meta.url)), journal], restartOnInterruptedCall: restart, toolCallTimeoutMs: timeoutMs }
  const id = await ctx.loader.create(row)
  const events = () => readFileSync(journal, 'utf8').trim().split('\n')
  const call = (name: string, signal = new AbortController().signal) => ctx.tools.execute({
    signal, callId: ToolCallId(`interrupted-${++sequence}`), name: `mcp__recovery__${name}`, arguments: {},
  })
  return { ctx, id, events, call }
}

it('replaces a timed-out server without replaying the call and quiesces disposal', async () => {
  const { ctx, id, events, call } = await boot()
  const oldPid = Number(events()[0]!.split(' ')[1])
  const result = await call('hang')
  expect(result.isError).toBe(true)
  expect(JSON.stringify(result)).toContain('旧连接已清理并重建')
  expect(() => process.kill(oldPid, 0)).toThrow()
  expect(events().filter(e => e.startsWith('start '))).toHaveLength(2)
  expect(events().filter(e => e.endsWith(' hang'))).toHaveLength(1)
  expect((await call('state')).isError).toBe(false)
  const newPid = Number(events().filter(e => e.startsWith('start '))[1]!.split(' ')[1])
  await ctx.loader.remove(id)
  expect(ctx.tools.schemas()).toEqual([])
  expect(() => process.kill(newPid, 0)).toThrow()
})

it('replaces a canceled server even when the server ignores cancellation', async () => {
  const { events, call } = await boot(true, 60_000)
  const controller = new AbortController()
  const result = call('hang', controller.signal)
  await vi.waitFor(() => { expect(events().some(e => e.endsWith(' hang'))).toBe(true) })
  controller.abort()
  await result
  expect(events().filter(e => e.startsWith('start '))).toHaveLength(2)
  expect((await call('state')).isError).toBe(false)
})

it('does not replace ordinary tool errors or servers without the opt-in', async () => {
  const enabled = await boot()
  expect((await enabled.call('fail')).isError).toBe(true)
  expect(enabled.events().filter(e => e.startsWith('start '))).toHaveLength(1)
  const { events, call } = await boot(false)
  expect((await call('fail')).isError).toBe(true)
  expect((await call('hang')).isError).toBe(true)
  expect(events().filter(e => e.startsWith('start '))).toHaveLength(1)
})

it('shares one replacement across concurrent interrupted calls', async () => {
  const { events, call } = await boot()
  const results = await Promise.all([call('hang'), call('hang')])
  expect(results.every(result => result.isError)).toBe(true)
  expect(events().filter(e => e.startsWith('start '))).toHaveLength(2)
  expect((await call('state')).isError).toBe(false)
})
