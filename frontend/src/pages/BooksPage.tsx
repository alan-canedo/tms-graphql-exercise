import { Stack, Typography } from "@mui/material"

function BooksPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4" component="h1">
        Books
      </Typography>
      <Typography>The book list will appear here.</Typography>
    </Stack>
  )
}

export default BooksPage
