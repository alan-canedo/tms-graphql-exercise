# GraphQL documents and generated types

`getAllBooks.graphql` defines the named `GetAllBooks` operation. It selects only
`id`, `title`, `author`, and `isCheckedOut` from `getAllBooks`. It does not select
`checkedOutBy` or any Person fields.

With the GraphQL server running at http://localhost:4000/, run from `frontend/`:

```sh
npm run codegen
```

The only generated source file is `generated.ts`. Never edit it manually.
Edit operation documents or `../../codegen.yml`, then rerun codegen instead.
Commit the generated output alongside those changes.

Codegen uses these development dependencies:

- `@graphql-codegen/cli`: loads configuration and schema, validates documents,
  and coordinates generation.
- `@graphql-codegen/typescript`: generates schema types and scalar mappings.
- `@graphql-codegen/typescript-operations`: generates result and variable types
  from the actual selections, including nullability.
- `@graphql-codegen/typed-document-node`: generates the executable query document
  with its result and variable types attached.
- `@graphql-typed-document-node/core`: supplies the TypedDocumentNode type.

The existing `graphql` dependency supplies the parser and type system. No React
hooks plugin is needed.

`GetAllBooksDocument` is a `TypedDocumentNode<GetAllBooksQuery,
GetAllBooksQueryVariables>`. BooksPage imports this generated document and passes
it to Apollo's `useQuery`. Apollo infers the data and variable types from the
document, so each book in `data.getAllBooks` has the four selected properties.
There is no handwritten Book response DTO or duplicate query string.

Schema types describe all available fields, so the generated schema types still
include Person and checkedOutBy. Their presence in TypeScript does not request
those fields. The operation type and executable document contain only the
selected book fields. Apollo adds __typename metadata to the network query for
its normalized cache; it does not add checkedOutBy or Person selections.

Codegen derives types from the live schema and actual selections, and rejects
invalid operations during generation. Rerun it when either changes. It does not
validate server responses at runtime, and generation needs a reachable schema
introspection endpoint.

The configuration uses `unknown` for unmapped scalars and fails on custom scalars
without explicit mappings, avoiding `any`. Enum unions and type-only imports
keep the output compatible with the frontend TypeScript compiler settings.
