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

## Book detail operation

`getBookForId.graphql` defines `GetBookForId($bookId: ID!)` and calls
`getBookForId(bookId: $bookId)`. It requests id, title, author, isCheckedOut,
and checkedOutBy with id, firstName, lastName, emailAddress, and phoneNumber.
The generated GetBookForIdDocument lets Apollo infer result and variable types
without a handwritten response type or `any`.

The schema declares `checkedOutBy: Person` and `phoneNumber: String`, without
`!`, so either can be null. The generated operation type reflects both
nullabilities. The page guards the borrower before reading Person fields, and
renders the phone only when it has a value. The other selected Person fields
are non-null when a Person exists.

`getBookForId(bookId: ID!): Book!` promises a non-null result, but the resolver's
array find returns undefined for an unknown ID. GraphQL converts this into an
error with path `["getBookForId"]` and message `Cannot return null for
non-nullable field Query.getBookForId.`; the response's data is null because the
failure reaches the root. The page recognizes this specific error and shows
Book not found. Other GraphQL and network errors show Unable to load book
details. A missing book result is also handled defensively. The backend schema
and resolver remain unchanged; without a dedicated not-found error code, this
classification depends on the current GraphQL error message and path.

Every operation independently selects fields allowed by the schema. The list
query's omission of checkedOutBy does not restrict the detail query: Book exposes
checkedOutBy as Person, and the detail query can select that Person's fields.
Apollo fetches the fields missing from its cache rather than treating the list's
four-field response as complete detail data.

## Checkout operations and cache updates

`getAllPeople.graphql` defines the variable-free `GetAllPeople` query. It selects
id, firstName, lastName, and emailAddress for each person. BookCheckout runs it
only while the book is available, using skipToken otherwise. The labeled MUI
selector displays names and emails and submits the selected person's ID.
Loading, failed, and empty borrower results disable the selector and checkout.

`checkOutBook.graphql` defines `CheckOutBook($bookId: ID!, $personId: ID!)`.
It submits the current book ID and selected borrower ID to the existing resolver.
The response explicitly selects Book __typename, id, title, author,
isCheckedOut, and checkedOutBy with Person __typename, id, firstName, lastName,
emailAddress, and phoneNumber. These cover every field the list/detail queries
need, including nullable borrower contact information.

The shared default InMemoryCache identifies a Book by __typename plus id:
Book with id "2" becomes `Book:2`. Both getAllBooks and getBookForId reference
that same entity. Apollo adds __typename to queries automatically; the mutation
also requests it explicitly. Writing the mutation response merges the returned
fields into `Book:2`, then notifies query observers. The detail immediately shows
Checked out and borrower details. When navigating back using React Router, the
list's default cache-first query reads the updated entity, so its status and
client-side availability filter reflect checkout without refetching or reloading.
There is no update callback, refetchQueries, or manual Book state synchronization.

BookCheckout stores only the selected borrower ID and a local failure message.
Book data stays in Apollo, and availability is derived directly from the detail
query. Keeping a second Book in React state would require synchronizing it with
both query results and mutation responses and could leave either view stale.
The component is keyed by book ID so a different book gets a fresh selection.

useMutation supplies loading and error. The button and selector are disabled
while the mutation runs, and the submit handler also guards against loading or
an invalid/missing selection. The button reads Checking out… during the request.
GraphQL and network failures show Unable to check out book with the error message;
the rejected promise is caught because the hook already exposes the error.
The existing resolver can silently return an unchanged book, so the response is
also checked for a successful checkout to the selected borrower. Otherwise a
useful failure alert is shown, including when another borrower already has it.
BookCheckout remains mounted to preserve this alert if availability changes,
while its form is rendered only for available books. No optimisticResponse is
provided: cached Book fields change only when a response arrives.

## Return operation, confirmation, and cache updates

`returnBook.graphql` defines `ReturnBook($bookId: ID!)` against the existing
server mutation. Its generated ReturnBookDocument supplies inferred result and
variable types to useMutation without `any`. It selects Book __typename, id,
title, author, isCheckedOut, and checkedOutBy with all borrower detail fields.
The server returns isCheckedOut: false and checkedOutBy: null after a return.
Apollo merges this response into the existing `Book:<id>` record automatically.
Both list and detail queries reference that record, so availability, borrower
details, and the list's client-side filters update without reload or refetch.
There is no optimisticResponse or separate React copy of the book.

BookReturn stays mounted in the detail page and shows Return Book only while
checked out. Clicking the button opens a MUI Dialog with a Return Book title,
a description naming the book and explaining that its borrower will be cleared,
and Cancel and Confirm controls. Unique useId values connect aria-labelledby
and aria-describedby to that title and description. MUI provides role="dialog",
aria-modal, automatic focus management, and the built-in focus trap. Cancel has
autoFocus; Tab and Shift+Tab stay inside the modal. None of disableAutoFocus,
disableEnforceFocus, or disableRestoreFocus is enabled. Cancel, Escape, and
backdrop dismissal restore focus to the trigger. On success the trigger is
removed, so after the exit transition focus moves to the book title, which has
tabIndex=-1 and does not add a stop to the normal Tab order.

Confirm checks that the dialog is open and the book is still checked out. A
synchronous ref lock is set before calling the mutation, preventing a second
submission even before Apollo's loading state renders. While pending, Return
Book, Cancel, and Confirm are disabled and onClose ignores Escape/backdrop
requests. The confirmation button reads Returning… and the dialog is marked
busy. The ref lock is released in finally for both successful and failed calls.

A successful response is checked for the requested ID, isCheckedOut: false,
and checkedOutBy: null before closing the dialog. The detail then shows Available
and the checkout controls. GraphQL/network failures keep the dialog open and
show an error Alert with the returned error message; controls re-enable for
retry or cancellation. An unchanged or missing result also leaves a useful
failure message in the dialog. Reopening clears the previous failure.
