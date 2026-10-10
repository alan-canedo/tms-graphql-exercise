# Library Checkout frontend

Standalone Vite, React, and TypeScript application. Run these commands from the
frontend directory:

- npm ci: install the locked dependencies.
- npm run dev: start the Vite development server.
- npm run codegen: regenerate GraphQL types from the running local server.
- npm run typecheck: check application and Vite configuration types.
- npm run build: typecheck and create the production bundle in dist/.
- npm run preview: serve the built bundle locally.
- npm run lint: run the scaffold-provided Oxlint checks.

TypeScript strict mode is enabled in tsconfig.app.json and tsconfig.node.json.

The application uses React Router and a responsive MUI shell:

- src/main.tsx mounts the app inside ApolloProvider and BrowserRouter.
- src/App.tsx defines the routes and applies MUI's CssBaseline.
- src/AppShell.tsx provides the Library Checkout header and main content container.
- src/pages/BooksPage.tsx fetches all books and renders their title, author, and status with MUI.
- src/pages/BookDetailPage.tsx fetches one book for /books/:id and displays its details and borrower contact information.

Opening / redirects to /books using Navigate with replace, so the redirect does
not leave an extra entry in browser history. Routes matches /books to BooksPage
and a URL such as /books/123 to BookDetailPage. The :id segment captures one
URL segment; /books does not also render the detail page.

BookDetailPage reads the route parameter with `useParams<"id">()`. For
/books/123, `id` is the string "123", which is passed as the `bookId` variable
to the generated GetBookForIdDocument. If the parameter is missing, Apollo's
skipToken prevents the request and the page shows a missing-ID message.

The detail page shows loading and error states, the title, author, availability,
and a Back to books link in every state. Checked-out books show the borrower's
full name, a mailto email link, and a phone number when present. A nullable
checkedOutBy is handled with a borrower-details-unavailable message. Available
books show a labeled borrower selector and Check Out button. Borrowers come from
GetAllPeople; CheckOutBook updates the shared Apollo cache after the server
responds. No optimistic UI or return action is implemented.

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
store. BooksPage calls useQuery with the generated GetAllBooksDocument. The hook
uses the provider's client and cache, fetches missing data, and rerenders as the
result changes. The page shows a spinner while loading, an error alert on failure,
and a no-books message for an empty list. Successful results show every book's
title, author, and Available / Checked out chip.

GraphQL Code Generator is configured in codegen.yml. Operation documents
belong in src/graphql/**/*.graphql; generated types are written only to
src/graphql/generated.ts. Never edit that generated file manually. Run
npm run codegen after schema or operation changes, with the server running at
http://localhost:4000/. See src/graphql/README.md for dependency explanations
and the distinction between schema types and operation result types.
