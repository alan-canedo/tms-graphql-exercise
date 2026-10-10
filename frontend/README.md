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

- src/main.tsx mounts the app inside BrowserRouter.
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
