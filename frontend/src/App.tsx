import { CssBaseline } from "@mui/material"
import { Navigate, Route, Routes } from "react-router"
import AppShell from "./AppShell.tsx"
import BooksPage from "./pages/BooksPage.tsx"
import BookDetailPage from "./pages/BookDetailPage.tsx"

function App() {
  return (
    <>
      <CssBaseline />
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
        </Routes>
      </AppShell>
    </>
  )
}

export default App
