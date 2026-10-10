import { CssBaseline, GlobalStyles } from "@mui/material"
import { Navigate, Route, Routes } from "react-router"
import AppShell from "./AppShell.tsx"
import BooksPage from "./pages/BooksPage.tsx"
import BookDetailPage from "./pages/BookDetailPage.tsx"

function App() {
  return (
    <>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ".MuiButton-root.Mui-focusVisible": {
            outline: "2px solid #1565c0",
            outlineOffset: "2px",
          },
          ".MuiAlert-message": { overflowWrap: "anywhere" },
        }}
      />
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
