# Library Checkout frontend

Standalone Vite, React, and TypeScript application. Run these commands from the
frontend directory:

- npm ci: install the locked dependencies.
- npm run dev: start the Vite development server.
- npm run typecheck: check application and Vite configuration types.
- npm run build: typecheck and create the production bundle in dist/.
- npm run preview: serve the built bundle locally.
- npm run lint: run the scaffold-provided Oxlint checks.

TypeScript strict mode is enabled in tsconfig.app.json and tsconfig.node.json.

The application uses React Router and a responsive MUI shell:

- src/main.tsx mounts the app inside ApolloProvider and BrowserRouter.
- src/App.tsx defines the routes and applies MUI's CssBaseline.
- src/AppShell.tsx provides the Library Checkout header and main content container.
- src/pages/BooksPage.tsx is the placeholder for /books.
- src/pages/BookDetailPage.tsx is the placeholder for /books/:id.

Opening / redirects to /books using Navigate with replace, so the redirect does
not leave an extra entry in browser history. Routes matches /books to BooksPage
and a URL such as /books/123 to BookDetailPage. The :id segment captures one
URL segment; /books does not also render the detail page.

When book data is added later, BookDetailPage can import useParams from
react-router and read the parameter with:

```tsx
const { id } = useParams<{ id: string }>()
```

For /books/123, id is the string "123". The hook's type also allows undefined,
so check that id exists before using it in a future data request. No data is
loaded by the current placeholders.

The entry point, route configuration, and shared shell stay directly in src.
The two route pages share one pages folder, keeping navigation easy to follow
without adding feature folders or extra abstractions.

Apollo Client is configured in src/apollo.ts as one shared instance. HttpLink
sets the GraphQL endpoint to http://localhost:4000/, and InMemoryCache uses its
default normalized cache without custom type policies. ApolloProvider makes the
client available throughout the React component tree. The runtime dependencies
are @apollo/client, graphql (GraphQL parsing), and rxjs (observables used by Apollo).

A normalized cache keeps one record for each identifiable object, with references
from lists and related objects. By default, Apollo combines __typename with id
(or _id) to identify records: a Book with id "123" is stored as Book:123. Future
operations should include id; Apollo adds __typename by default. Results for the
same book can then update one shared record instead of separate copies.

Apollo handles GraphQL server data and its cache. React state can handle local
UI needs, so this application does not need Redux or another application state
store. This setup adds no queries, mutations, code generation, or page data
fetching, and configuring the client alone does not send a GraphQL request.
