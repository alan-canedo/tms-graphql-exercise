import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { skipToken, useQuery } from "@apollo/client/react"
import {
  Alert,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import { Link as RouterLink, useParams } from "react-router"
import BookCheckout from "../components/BookCheckout.tsx"
import { GetBookForIdDocument } from "../graphql/generated.ts"

function BookDetailPage() {
  const { id } = useParams<"id">()
  const { data, loading, error } = useQuery(
    GetBookForIdDocument,
    id ? { variables: { bookId: id } } : skipToken,
  )
  const book = data?.getBookForId
  const borrower = book?.checkedOutBy
  // The backend returns undefined for unknown IDs despite declaring Book!.
  const isUnknownBook =
    CombinedGraphQLErrors.is(error) &&
    error.errors.some(
      (graphQLError) =>
        graphQLError.path?.length === 1 &&
        graphQLError.path[0] === "getBookForId" &&
        graphQLError.message ===
          "Cannot return null for non-nullable field Query.getBookForId.",
    )

  return (
    <Stack spacing={2}>
      <Link component={RouterLink} to="/books" sx={{ alignSelf: "flex-start" }}>
        Back to books
      </Link>
      <Typography variant="h4" component="h1">
        Book details
      </Typography>
      {!id ? (
        <Alert severity="warning">Book not found. No book ID was provided.</Alert>
      ) : loading ? (
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }} role="status">
          <CircularProgress size={24} aria-label="Loading book details" />
          <Typography>Loading book details…</Typography>
        </Stack>
      ) : isUnknownBook ? (
        <Alert severity="warning">Book not found. It may no longer be in the library.</Alert>
      ) : error ? (
        <Alert severity="error">Unable to load book details: {error.message}</Alert>
      ) : !book ? (
        <Alert severity="warning">Book not found. It may no longer be in the library.</Alert>
      ) : (
        <Paper variant="outlined" sx={{ p: 2, overflowWrap: "anywhere" }}>
          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="h5" component="h2">
                {book.title}
              </Typography>
              <Typography color="text.secondary">{book.author}</Typography>
            </Stack>
            <Chip
              label={book.isCheckedOut ? "Checked out" : "Available"}
              color={book.isCheckedOut ? "warning" : "success"}
              sx={{ alignSelf: "flex-start" }}
            />
            <BookCheckout key={book.id} bookId={book.id} isAvailable={!book.isCheckedOut} />
            {book.isCheckedOut && (
              <Stack spacing={0.5}>
                <Typography variant="h6" component="h3">
                  Borrower
                </Typography>
                {borrower ? (
                  <>
                    <Typography>{borrower.firstName} {borrower.lastName}</Typography>
                    <Link
                      href={`mailto:${borrower.emailAddress}`}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      {borrower.emailAddress}
                    </Link>
                    {borrower.phoneNumber && (
                      <Typography>Phone: {borrower.phoneNumber}</Typography>
                    )}
                  </>
                ) : (
                  <Typography color="text.secondary">Borrower details are unavailable.</Typography>
                )}
              </Stack>
            )}
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}

export default BookDetailPage
