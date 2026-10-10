import { useQuery } from "@apollo/client/react"
import { Alert, Chip, CircularProgress, Paper, Stack, Typography } from "@mui/material"
import { GetAllBooksDocument } from "../graphql/generated.ts"

function BooksPage() {
  const { data, loading, error } = useQuery(GetAllBooksDocument)

  return (
    <Stack spacing={2}>
      <Typography variant="h4" component="h1">
        Books
      </Typography>
      {loading ? (
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }} role="status">
          <CircularProgress size={24} aria-label="Loading books" />
          <Typography>Loading books…</Typography>
        </Stack>
      ) : error ? (
        <Alert severity="error">Unable to load books: {error.message}</Alert>
      ) : !data || data.getAllBooks.length === 0 ? (
        <Typography>No books found.</Typography>
      ) : (
        <Stack component="ul" spacing={2} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {data.getAllBooks.map((book) => (
            <Paper key={book.id} component="li" variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="h6" component="h2">
                    {book.title}
                  </Typography>
                  <Typography color="text.secondary">{book.author}</Typography>
                </Stack>
                <Chip
                  label={book.isCheckedOut ? "Checked out" : "Available"}
                  color={book.isCheckedOut ? "warning" : "success"}
                  size="small"
                />
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

export default BooksPage
