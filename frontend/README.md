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
React Router and MUI are installed for later steps. This foundation renders only
the Library Checkout heading.
