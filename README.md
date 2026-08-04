# @pipeworx/bioregistry

[Bioregistry](https://bioregistry.io) MCP — meta-registry of biomedical identifier prefixes (~1500 prefixes from UniProt, ChEBI, HPO, MONDO, RxNorm, etc.). Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `prefix(prefix)` — prefix metadata (URL templates, providers, license)
- `search(query, limit?)` — substring search over prefixes
- `resolve(curie)` — resolve a CURIE (e.g. `chebi:24867`) to a provider URL
- `prefixes(limit?, offset?)` — paginate over all prefixes

## Data source

`https://bioregistry.io/api/`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "bioregistry": {
      "url": "https://gateway.pipeworx.io/bioregistry/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Bioregistry data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
