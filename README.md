# TMS GraphQL Exercise

A GraphQL API for a simple library/book management system, built with Apollo Server and TypeScript. This project demonstrates core GraphQL concepts including queries, mutations, and resolvers with relational data.

## Tech Stack

- **[Apollo Server](https://www.apollographql.com/docs/apollo-server/)** — GraphQL server
- **[GraphQL](https://graphql.org/)** — Query language and runtime
- **[TypeScript](https://www.typescriptlang.org/)** — Static typing
- **Node.js** (ESM modules)

## Getting Started

### Prerequisites

- Node.js v18+
- npm

### Installation

```bash
npm install
```

### Running the Server

```bash
npm start
```

This will compile the TypeScript source and start the server. The Apollo sandbox will be available at:

```
http://localhost:4000
```

## Project Structure

```
tms-graphql-exercise/
├── src/
│   ├── index.ts        # Server setup and resolvers
│   ├── schema.ts       # GraphQL type definitions
│   └── data/
│       └── _db.ts      # In-memory data store and TypeScript interfaces
├── tsconfig.json
└── package.json
```

## GraphQL Schema

### Types

```graphql
type Book {
  id: ID!
  title: String!
  author: String!
  isCheckedOut: Boolean!
  checkedOutBy: Person      # Resolved from person_id
}

type Person {
  id: ID!
  firstName: String!
  lastName: String!
  emailAddress: String!
  phoneNumber: String       # Optional
}
```

### Queries

| Query | Arguments | Description |
|---|---|---|
| `getAllBooks` | — | Returns all books in the library |
| `getBookForId` | `bookId: ID!` | Returns a single book by ID |

### Mutations

| Mutation | Arguments | Description |
|---|---|---|
| `checkOutBook` | `bookId: ID!, personId: ID!` | Checks out a book to a person (no-op if already checked out or IDs are invalid) |
| `returnBook` | `bookId: ID!` | Returns a checked-out book (no-op if not currently checked out) |

## Example Operations

### Get all books

```graphql
query {
  getAllBooks {
    id
    title
    author
    isCheckedOut
    checkedOutBy {
      firstName
      lastName
    }
  }
}
```

### Check out a book

```graphql
mutation {
  checkOutBook(bookId: "2", personId: "1") {
    id
    title
    isCheckedOut
    checkedOutBy {
      firstName
      lastName
    }
  }
}
```

### Return a book

```graphql
mutation {
  returnBook(bookId: "1") {
    id
    title
    isCheckedOut
  }
}
```

## Data

The app uses an in-memory data store (no database). Data resets every time the server restarts.

**Seed Books:** Harry Potter, The Lord of the Rings, Dune, Foundation, Neuromancer

**Seed Persons:** Mario Bro, Luigi Bruh, Bowser Koopa

## Scripts

| Script | Command | Description |
|---|---|---|
| `compile` | `npm run compile` | Compiles TypeScript to `dist/` |
| `start` | `npm start` | Compiles and starts the server |