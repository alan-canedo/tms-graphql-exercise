import { useQuery } from "@apollo/client/react"
import {
  Alert,
  Chip,
  CircularProgress,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useState } from "react"
import { Link as RouterLink } from "react-router"
import { GetAllBooksDocument } from "../graphql/generated.ts"

type BookFilter = "all" | "available" | "checkedOut"

function BooksPage() {
  const { data, loading, error } = useQuery(GetAllBooksDocument)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<BookFilter>("all")
  const books = data?.getAllBooks ?? []
  const normalizedSearch = search.trim().toLowerCase()
  const displayedBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(normalizedSearch) ||
      book.author.toLowerCase().includes(normalizedSearch)
    const matchesFilter =
      filter === "all" ||
      (filter === "available" && !book.isCheckedOut) ||
      (filter === "checkedOut" && book.isCheckedOut)

    return matchesSearch && matchesFilter
  })

  return (
    <Stack spacing={2}>
      <Typography variant="h4" component="h1">
        Books
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          id="books-search"
          label="Search by title or author"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
          sx={{ flex: 1, minWidth: 0 }}
        />
        <TextField
          id="books-availability"
          label="Availability"
          select
          value={filter}
          onChange={(event) => {
            const value = event.target.value
            if (value === "all" || value === "available" || value === "checkedOut") {
              setFilter(value)
            }
          }}
          sx={{ width: { xs: "100%", sm: 200 }, flexShrink: 0 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="available">Available</MenuItem>
          <MenuItem value="checkedOut">Checked out</MenuItem>
        </TextField>
      </Stack>
      {loading ? (
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }} role="status">
          <CircularProgress size={24} aria-label="Loading books" />
          <Typography>Loading books…</Typography>
        </Stack>
      ) : error ? (
        <Alert severity="error">Unable to load books: {error.message}</Alert>
      ) : !data || books.length === 0 ? (
        <Typography>No books are available in the library yet.</Typography>
      ) : displayedBooks.length === 0 ? (
        <Typography role="status">
          No matching books. Try a different title or author, or select All in the availability filter.
        </Typography>
      ) : (
        <Stack component="ul" spacing={2} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {displayedBooks.map((book) => (
            <Paper key={book.id} component="li" variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Stack spacing={0.5} sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                  <Typography variant="h6" component="h2">
                    <Link
                      component={RouterLink}
                      to={`/books/${book.id}`}
                      color="inherit"
                      underline="hover"
                    >
                      {book.title}
                    </Link>
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
