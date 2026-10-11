# Library Checkout

A TypeScript library checkout application with an Apollo GraphQL backend and a React frontend. Browse books, search by title or author, filter by availability, view borrower contact details, check out an available book to a selected borrower, and return a book through a confirmation dialog.

## Prerequisites

- Node.js **24.15.0 or newer within the 24.x release line** is recommended; the commands were verified with Node 24.19.0 and npm 11.17.0. The locked frontend dependencies also support Node 22.22.2+ within 22.x or Node 26+. Node 20 is insufficient for the current frontend/test dependencies, even though Apollo Server alone supports it.
- npm, including development dependencies, and network access to install packages.
- Available local ports 4000 and 5173.

There is no `.nvmrc` or package-level `engines` declaration, so select a compatible Node version before installing. No database service, credentials, or `.env` file is required. The backend starts with five books and three borrowers held in memory; restarting it resets checkout state.

## Clean-clone setup

Use two terminals, both initially in the cloned repository root. Backend and frontend have separate `package.json` and lockfiles; installing at the root does **not** install frontend dependencies.

### 1. Install and start the backend

In terminal 1, from the repository root:

```sh
npm ci
npm start
```

`npm start` runs `npm run compile` first, compiling `src/` into `dist/`, then starts the GraphQL server. Wait for `Graphql server ready at:` and leave this terminal running. There is no backend watch script; restart it after backend changes.

### 2. Install, generate GraphQL types, and start the frontend

In terminal 2, from the repository root:

```sh
cd frontend
npm ci
npm run codegen
npm run dev
```

**The backend must be running before codegen.** `frontend/codegen.yml` introspects `http://localhost:4000/` and reads `src/graphql/**/*.graphql` relative to `frontend/`. It generates operation types and typed documents into `frontend/src/graphql/generated.ts`. The codegen CLI and plugins are installed by the frontend's `npm ci`; no global installation is needed.

The generated file is tracked, so an unchanged clone can use it directly. The sequence above regenerates it against the running backend. Rerun codegen after changing the schema or operation documents, and commit the generated output with those changes. Neither `dev` nor `build` runs codegen automatically. Do not edit the generated file manually.

Leave both terminals running and open the frontend URL printed by Vite.

## URLs and ports

| Service or page | Default URL |
| --- | --- |
| GraphQL API | http://localhost:4000/ |
| Frontend | http://localhost:5173/ |
| Book list | http://localhost:5173/books |
| Book details, example seeded ID | http://localhost:5173/books/2 |

The frontend redirects `/` to `/books`. Vite defaults to port 5173 and may select another port if it is occupied; use the URL it prints. The backend port is fixed at 4000 in `src/index.ts`. Both `frontend/src/apollo.ts` and `frontend/codegen.yml` point directly to `http://localhost:4000/`; there is no Vite API proxy or environment-variable configuration for that endpoint.

## Tests and checks

After installing frontend dependencies, run from the repository root:

```sh
npm test
```

The root test script delegates to the frontend's `vitest run`. Alternatively, run `npm test` from `frontend/`. The React Testing Library tests use jsdom and Apollo `MockedProvider`, so neither server needs to be running. They cover combined search/availability filtering, borrower contact details, borrower selection plus disabled controls while checkout is pending, and GraphQL error handling for book details, checkout, and return. Backend resolver tests use Node's built-in test runner; `npm run test:backend` compiles the backend and tests error codes and valid checkout/return state changes without starting an HTTP listener.

Additional checks, all from the repository root:

```sh
npm run compile
npm run test:backend
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run build
```

The frontend build typechecks and produces `frontend/dist/`; it does not start either server.

## Optional stretch goal: one Playwright checkout test

Playwright is the single optional stretch goal because checkout spans routing, GraphQL data fetching, user interaction, mutation handling, and cache-driven UI updates. `frontend/e2e/checkout.spec.ts` runs one Chromium browser test against the actual Vite frontend and local Apollo backend. It does not mock GraphQL.

Install the frontend dependencies and Chromium once (also repeat the browser install after a Playwright upgrade):

```sh
cd frontend
npm ci
npx playwright install chromium
```

On Linux/WSL, if Chromium's system libraries are missing, use `npx playwright install --with-deps chromium` instead; installing OS packages may require sudo. Run the browser installation and test in the same environment (for example, both inside WSL).

**Both servers must already be running.** Playwright does not start or reset them. After the clean-clone setup above, use these three terminals:

1. Repository root: `npm start`. Start a fresh backend (or restart the existing one) to restore the seed data before the first run.
2. `frontend/`: `npm run dev -- --host localhost --port 5173 --strictPort`. This keeps Vite on the exact URL configured for Playwright rather than silently selecting another port.
3. `frontend/`:

```sh
npm run test:e2e
npx playwright show-report
```

The configured frontend URL is `http://localhost:5173`; the application's real GraphQL endpoint is `http://localhost:4000/`. No codegen rerun is needed for this test when using the tracked, unchanged GraphQL documents.

The fixed seed is **The Lord of the Rings (book ID `2`)**, initially available with no borrower, and **luigi bruh (person ID `2`)**, with email `luigi@example.com` and phone `555-555-5556`. The test opens `/books`, follows the book's visible link, requires its status to be Available, selects Luigi, and clicks Check Out. Without reloading, it verifies Checked out plus the borrower's name, email, and phone, exercising Apollo's mutation-driven cache update.

The test uses accessible roles/names and exact visible text, Playwright's automatic waiting, one worker, and no random data. With an unchanged seed, no other client modifying book `2`, and no overlapping E2E runs, the starting state and selection are deterministic. It deliberately fails its Available precondition if the book was already checked out; it does not silently reset another checkout.

Cleanup is part of this same test: a `finally` block clicks Return Book and Confirm when the return control is visible, then verifies Available and the absence of the borrower section. This restores book `2` to its initial available/unassigned state, including when a borrower assertion fails after checkout. A killed browser/test, failed return, or failure before the return control appears can leave state behind; restart the in-memory backend before rerunning in that case. No reset endpoint or test-data service is added.

Playwright writes its HTML report to `frontend/playwright-report/` on each run; `npx playwright show-report` opens it on demand. It saves screenshots only on failed attempts and records a trace on the first retry (one retry is configured). Screenshots and trace ZIPs are under `frontend/test-results/`, with report attachments also included in the HTML report. Both directories are ignored by Git; successful first attempts produce no screenshot or trace. There are no visual snapshots or screenshot galleries. These are Playwright's built-in [reporting](https://playwright.dev/docs/test-reporters) and [failure artifact options](https://playwright.dev/docs/test-use-options).

## Architecture

- **Backend:** `src/index.ts` starts Apollo Server and defines resolvers; `src/schema.ts` defines the GraphQL schema; `src/data/_db.ts` provides mutable in-memory seed data. Queries retrieve books and borrowers, and mutations check out and return books.
- **Frontend:** Vite, React, React Router, and MUI. `frontend/src/main.tsx` provides routing and Apollo Client; `App.tsx` defines routes; `pages/` contains list/detail screens; `components/` contains checkout and return controls.
- **Data flow:** `.graphql` operations and codegen provide typed documents to Apollo hooks. One normalized `InMemoryCache` holds server state. Mutation responses include book identity and changed fields, updating list and detail views without manual refetches. React state holds search, borrower selection, and dialog state.

## Submission notes

- [DECISIONS.md](DECISIONS.md), at the repository root, explains architecture choices and tradeoffs.
- [AI_NOTES.md](AI_NOTES.md), at the repository root, records AI assistance and independent review.
- [GraphQL documentation](frontend/src/graphql/README.md) explains operation typing, generation, and cache behavior in more detail.

## Known gaps / With another day

- **Test coverage:** One live browser checkout journey covers mutation/cache updates and return cleanup. Most loading/error states and broader backend HTTP integration cases still lack automated coverage; add focused behavior coverage as the application grows.
- **State lifetime and freshness:** Checkout data resets when the backend restarts, and Apollo's cache does not discover changes made by another client automatically. Add persistence and an explicit refresh strategy for use beyond this local exercise.
