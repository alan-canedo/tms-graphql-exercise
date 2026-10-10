# AI-assisted development notes

## Tools used and how I directed the work

- **OpenAI Codex:** implementation assistance, scaffolding, debugging, tests, and explanations.
- **ChatGPT:** planning, architecture review, requirement interpretation, and discussion of test fixture types.

I used AI throughout development, reviewed the generated code, and made corrections as I worked. For debugging, I pasted logs to give AI context about the errors. The decisions below describe places where I reviewed, corrected, or refined AI-assisted implementation choices rather than accepting the generated output as-is.

## Three judgment moments

1. **Keeping clear TypeScript project boundaries.** During scaffolding, Codex generated some `.js` and `.jsx` files even though the exercise requires strict TypeScript, so I removed them and kept the implementation in `.ts` and `.tsx`. Adding the frontend also caused the backend TypeScript compiler to discover frontend files outside its configured `rootDir`. I corrected the backend `tsconfig.json` to explicitly limit compilation to the backend `src` tree rather than restructuring the existing backend project. Together, these changes kept the frontend and backend as separate, consistently type-checked TypeScript applications.

2. **Using operation-specific types for test fixtures.** Codex initially reused a fixture typed from the checkout mutation in book-list and book-detail query tests. I consulted ChatGPT about this. TypeScript's structural typing allowed the code to compile, but the fixture did not precisely represent each operation's selection set. I changed the fixtures to use the generated type for the operation being tested so the tests better reflect the schema-to-operation-to-component type flow.

3. **Replacing brittle API error handling with explicit GraphQL error codes.** The initial implementation handled unknown book IDs on the frontend partly by interpreting GraphQL error-message text, while some rejected backend mutations returned an unchanged book rather than explicitly rejecting the operation. I updated the backend to return explicit GraphQL errors with stable `extensions.code` values for conditions such as a missing book, missing borrower, or invalid checkout/return state. I then updated the frontend to make decisions based on those codes instead of parsing human-readable error messages. This made the API contract more explicit while keeping the existing non-null GraphQL schema unchanged.

## What I learned and independently verified

AI helped me understand how generated GraphQL code is used in the application. I reviewed most generated files, with extra attention to the files produced by `npm run codegen`. I read those files without modifying them and examined how they were used in actual components to verify my understanding.
