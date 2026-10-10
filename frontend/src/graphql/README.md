# GraphQL documents and generated types

Put future operation documents in this folder as named `.graphql` files.
No application operations have been added yet. Codegen intentionally supports
an empty documents folder, so a temporary query is unnecessary.

With the GraphQL server running at http://localhost:4000/, run from `frontend/`:

```sh
npm run codegen
```

The only generated source file is `generated.ts`. Never edit it manually.
Edit operation documents or `../../codegen.yml`, then rerun codegen instead.
Commit the generated output alongside those changes.

Currently the output contains schema types and shared helpers. Once operations
exist, it will also contain their result and variable types. Schema types describe
all available fields; operation result types describe only the selected fields,
including nested selections, aliases, and nullability. Use operation result types
for response data rather than treating every response as a complete schema object.

The three codegen development dependencies are:

- `@graphql-codegen/cli`: loads the configuration and schema, validates operation
  documents, and coordinates generation.
- `@graphql-codegen/typescript`: generates schema types, scalar mappings, and
  helpers used by operation types.
- `@graphql-codegen/typescript-operations`: generates result and variable types
  from the operation documents and schema.

The existing `graphql` dependency supplies the GraphQL parser and type system.
No client preset, runtime document generation, or React hooks plugin is needed.

Codegen reduces type drift by deriving types from the live schema and actual
selections, and rejecting invalid operations during generation. It still requires
rerunning when either changes; it is not runtime response validation. For this
small app, the tradeoff is extra development dependencies, a generated file to
review, and a generation step that requires a reachable introspection endpoint.

The configuration uses `unknown` for unmapped scalars and fails on custom scalars
without explicit mappings, avoiding `any`. Enum unions and type-only imports
keep the output compatible with the frontend TypeScript compiler settings.
