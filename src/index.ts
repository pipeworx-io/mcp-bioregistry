interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Bioregistry MCP.
 */


const BASE = 'https://bioregistry.io/api';
const UA = 'pipeworx-mcp-bioregistry/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'prefix',
    description: 'Prefix metadata.',
    inputSchema: {
      type: 'object',
      properties: { prefix: { type: 'string', description: 'e.g. "chebi", "hpo"' } },
      required: ['prefix'],
    },
  },
  {
    name: 'search',
    description: 'Substring search over prefixes.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' }, limit: { type: 'number' } },
      required: ['query'],
    },
  },
  {
    name: 'resolve',
    description: 'Resolve a CURIE (prefix:id) to a provider URL.',
    inputSchema: {
      type: 'object',
      properties: { curie: { type: 'string', description: 'e.g. "chebi:24867"' } },
      required: ['curie'],
    },
  },
  {
    name: 'prefixes',
    description: 'Paginate over all prefixes.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
        offset: { type: 'number' },
      },
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'prefix':
      return brGet(`/registry/${encodeURIComponent(reqStr(args, 'prefix', '"chebi"').toLowerCase())}`);
    case 'search': {
      const q = reqStr(args, 'query', '"chebi"').toLowerCase();
      const all = (await brGet(`/registry/`)) as Record<string, { prefix: string; name: string; description?: string }>;
      const matches = Object.values(all).filter((e) =>
        e.prefix.toLowerCase().includes(q) ||
        e.name?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q),
      );
      const limit = Math.min(500, Math.max(1, (args.limit as number) ?? 25));
      return { query: q, count: matches.length, results: matches.slice(0, limit) };
    }
    case 'resolve': {
      const c = reqStr(args, 'curie', '"chebi:24867"');
      return brGet(`/reference/${encodeURIComponent(c)}`);
    }
    case 'prefixes': {
      const all = (await brGet(`/registry/`)) as Record<string, unknown>;
      const arr = Object.values(all);
      const offset = Math.max(0, (args.offset as number) ?? 0);
      const limit = Math.min(1000, Math.max(1, (args.limit as number) ?? 100));
      return { total: arr.length, prefixes: arr.slice(offset, offset + limit) };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function brGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (res.status === 404) throw new Error('Bioregistry: not found');
  if (!res.ok) throw new Error(`Bioregistry: ${res.status}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
