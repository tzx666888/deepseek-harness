/** Protocol fixture that ignores cancellation while its simulated connection is pending. */
import { appendFileSync } from 'node:fs'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

const journal = process.argv[2]!
appendFileSync(journal, `start ${process.pid}\n`)
// oxlint-disable-next-line typescript/no-deprecated -- Raw protocol fixture deliberately ignores cancellation during initialization.
const server = new Server({ name: 'pending-connection', version: '1' }, { capabilities: { tools: {} } })
let pending: Promise<never> | undefined
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: ['state', 'hang', 'fail'].map(name => ({ name, inputSchema: { type: 'object' as const } })),
}))
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  appendFileSync(journal, `call ${process.pid} ${request.params.name}\n`)
  if (request.params.name === 'hang') pending = new Promise(() => {})
  if (pending) await pending
  return { content: [{ type: 'text', text: String(process.pid) }], isError: request.params.name === 'fail' }
})
await server.connect(new StdioServerTransport())
