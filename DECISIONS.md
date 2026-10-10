# Architecture decisions

These decisions describe the current library checkout application.

## 1. Vite + React

- **Choice:** A standalone Vite + React frontend alongside the Apollo Server API.
- **Fit:** The two-page browser UI consumes the existing GraphQL server; it has no server-rendered pages or frontend server logic.
- **Alternative rejected:** Next.js, whose server rendering and server routes are unused in this implementation.
- **Cost:** Frontend and API run separately. Initial content depends on JavaScript and client-side queries.

## 2. React Router

- **Choice:** `BrowserRouter` with `/books`, `/books/:id`, and a redirect from `/`.
- **Fit:** The list and detail pages need links, browser history, and a book ID from the URL.
- **Alternative rejected:** Manually switching views with React state and browser history handling.
- **Cost:** Adds a routing dependency; deployment must serve the app entry point for direct visits to nested URLs.

## 3. MUI

- **Choice:** MUI components and `sx` styles for layout, forms, status messages, and the return confirmation dialog.
- **Fit:** The library screens use standard controls such as a borrower selector, availability chips, and a modal confirmation.
- **Alternative rejected:** Tailwind with custom controls, which would require implementing those controls separately.
- **Cost:** Adds MUI and Emotion dependencies. The UI follows MUI's appearance and component APIs, with some targeted style overrides.

## 4. Apollo Client

- **Choice:** One Apollo Client, provided to React, with `useQuery` and `useMutation`.
- **Fit:** Book and borrower queries plus checkout/return mutations share a GraphQL endpoint; hooks expose data, loading, and errors used by the UI.
- **Alternative rejected:** Plain `fetch`, with request lifecycle handling written in application code.
- **Cost:** Adds dependencies and Apollo-specific APIs to learn and maintain.

## 5. Apollo normalized cache for server state

- **Choice:** Default `InMemoryCache`; React state holds UI values such as search, selection, and dialog state.
- **Fit:** List and detail queries reference the same books. Checkout/return responses include identity and changed fields, updating shared records without separate Book state or explicit refetches.
- **Alternative rejected:** Redux holding copies of query results and synchronizing them after mutations.
- **Cost:** Operations must select identity and relevant fields. Changes arrive after mutation responses; the cache does not automatically discover changes made by other clients.

## 6. GraphQL Code Generator

- **Choice:** Generate operation result/variable types and typed documents from `.graphql` files and the schema.
- **Fit:** List and detail queries select different fields, including nullable borrower information. Pages, mutations, and test fixtures use the generated types.
- **Alternative rejected:** Handwritten operation DTOs maintained alongside query strings.
- **Cost:** Generation requires the local GraphQL server and must be rerun after schema or operation changes. Types do not validate responses at runtime.

## 7. Simple folders

- **Choice:** App setup in `src`, with `pages`, `components`, `graphql`, and `test` folders.
- **Fit:** Two route pages and two mutation components can be followed directly without additional layers.
- **Alternative rejected:** Feature modules with separate domain, service, and repository layers.
- **Cost:** Pages contain query usage, UI logic, and rendering together; more features may require reorganizing them.

## 8. Focused behavior tests

- **Choice:** Vitest + React Testing Library for frontend behavior, and Node's built-in test runner for backend resolvers.
- **Fit:** Frontend tests cover filtering, borrower details, checkout controls, and GraphQL error handling with mocked responses. Backend tests cover rejected operations and valid checkout/return state changes.
- **Alternative rejected:** A Playwright E2E suite requiring a browser and running frontend/API.
- **Cost:** These tests do not verify requests through the live GraphQL server, deployment, completed UI mutation/cache updates, or visual layout.
